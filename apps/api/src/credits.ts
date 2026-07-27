import type { Prisma, PrismaClient } from "@prisma/client";

type DbClient = PrismaClient | Prisma.TransactionClient;

export class InsufficientCreditsError extends Error {
  required: number;
  available: number;

  constructor(required: number, available: number) {
    super(`Insufficient credits: required ${required}, available ${available}`);
    this.name = "InsufficientCreditsError";
    this.required = required;
    this.available = available;
  }
}

export const addMonths = (date: Date, months: number) => {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
};

export const getOrRefreshBalance = async (db: DbClient, userId: string) => {
  const subscription = await db.subscription.findUnique({
    where: { userId },
    include: { plan: true },
  });
  if (!subscription) {
    throw new Error(`No subscription found for user ${userId}`);
  }

  const now = new Date();
  if (now < subscription.currentPeriodEnd) {
    return subscription;
  }

  const nextCreditsRemaining = subscription.plan.monthlyCredits ?? subscription.creditsRemaining;
  const refreshed = await db.subscription.update({
    where: { id: subscription.id },
    data: {
      creditsRemaining: nextCreditsRemaining,
      creditsUsedThisPeriod: 0,
      currentPeriodStart: now,
      currentPeriodEnd: addMonths(now, 1),
    },
    include: { plan: true },
  });

  await db.creditTransaction.create({
    data: {
      userId,
      subscriptionId: refreshed.id,
      type: "GRANT",
      amount: nextCreditsRemaining,
      reason: "MONTHLY_RESET",
    },
  });

  return refreshed;
};

const getRequiredCredits = async (db: DbClient, action: string) => {
  const cost = await db.creditCost.findUnique({ where: { action } });
  if (!cost) {
    throw new Error(`No credit cost configured for action "${action}" — run the seed script`);
  }
  return cost.credits;
};

export const canAfford = async (db: DbClient, userId: string, action: string) => {
  const subscription = await getOrRefreshBalance(db, userId);
  const required = await getRequiredCredits(db, action);
  return {
    ok: subscription.creditsRemaining >= required,
    required,
    available: subscription.creditsRemaining,
  };
};

export const chargeCredits = async (
  db: DbClient,
  userId: string,
  action: string,
  options: { relatedProjectId?: string } = {}
) => {
  const subscription = await getOrRefreshBalance(db, userId);
  const required = await getRequiredCredits(db, action);

  if (subscription.creditsRemaining < required) {
    throw new InsufficientCreditsError(required, subscription.creditsRemaining);
  }

  const updated = await db.subscription.update({
    where: { id: subscription.id },
    data: {
      creditsRemaining: { decrement: required },
      creditsUsedThisPeriod: { increment: required },
    },
  });

  await db.creditTransaction.create({
    data: {
      userId,
      subscriptionId: subscription.id,
      type: "SPEND",
      amount: -required,
      reason: action,
      relatedProjectId: options.relatedProjectId,
    },
  });

  return updated;
};
