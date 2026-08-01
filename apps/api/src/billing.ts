import { Paynow } from "paynow";
import type { Prisma, PrismaClient, Payment } from "@prisma/client";
import { addMonths, extendHostingExpiry, getOrRefreshBalance } from "./credits.js";

type TxClient = Prisma.TransactionClient;

let client: Paynow | null = null;

export const getPaynowClient = (): Paynow | null => {
  const integrationId = process.env.PAYNOW_INTEGRATION_ID;
  const integrationKey = process.env.PAYNOW_INTEGRATION_KEY;
  const resultUrl = process.env.PAYNOW_RESULT_URL;
  const returnUrl = process.env.PAYNOW_RETURN_URL;

  if (!integrationId || !integrationKey || !resultUrl || !returnUrl) {
    return null;
  }

  if (!client) {
    client = new Paynow(integrationId, integrationKey, resultUrl, returnUrl);
  }

  return client;
};

const PAID_STATUSES = new Set(["paid", "awaiting delivery", "delivered"]);

/**
 * Idempotent: re-applying the same status (from both the webhook and a manual
 * status poll racing each other) is a no-op once the payment already reflects it.
 */
export const applyPaynowStatus = async (db: PrismaClient, payment: Payment, rawStatus: string) => {
  const status = rawStatus.toLowerCase();
  if (payment.status.toLowerCase() === status) {
    return;
  }

  if (!PAID_STATUSES.has(status)) {
    await db.payment.update({ where: { id: payment.id }, data: { status: rawStatus } });
    return;
  }

  await db.$transaction(async (tx) => {
    await tx.payment.update({ where: { id: payment.id }, data: { status: rawStatus } });

    if (payment.kind === "credits") {
      await grantCreditPack(tx, payment);
    } else if (payment.kind === "hosting") {
      await extendHosting(tx, payment);
    } else {
      await upgradePlan(tx, payment);
    }
  });
};

const upgradePlan = async (tx: TxClient, payment: Payment) => {
  const plan = await tx.plan.findUniqueOrThrow({ where: { id: payment.planId! } });
  const now = new Date();
  const grantedCredits = plan.monthlyCredits ?? 0;

  const subscription = await tx.subscription.upsert({
    where: { userId: payment.userId },
    update: {
      planId: plan.id,
      creditsRemaining: grantedCredits,
      creditsUsedThisPeriod: 0,
      currentPeriodStart: now,
      currentPeriodEnd: addMonths(now, 1),
    },
    create: {
      userId: payment.userId,
      planId: plan.id,
      creditsRemaining: grantedCredits,
      currentPeriodStart: now,
      currentPeriodEnd: addMonths(now, 1),
    },
  });

  await tx.creditTransaction.create({
    data: {
      userId: payment.userId,
      subscriptionId: subscription.id,
      type: "GRANT",
      amount: grantedCredits,
      reason: "PLAN_UPGRADE",
    },
  });
};

/**
 * Entire auto-restore mechanism: a successful hosting payment unconditionally
 * sets status back to "active", whether the project was still active
 * (renewal, extends from its current expiry) or already suspended (lapsed,
 * extends from now) — no separate "restore" code path needed.
 */
const extendHosting = async (tx: TxClient, payment: Payment) => {
  const project = await tx.project.findUniqueOrThrow({ where: { id: payment.projectId! } });
  await tx.project.update({
    where: { id: project.id },
    data: {
      hostingStatus: "active",
      hostingExpiresAt: extendHostingExpiry(project.hostingExpiresAt),
    },
  });
};

const grantCreditPack = async (tx: TxClient, payment: Payment) => {
  const pack = await tx.creditPack.findUniqueOrThrow({ where: { id: payment.creditPackId! } });
  const subscription = await getOrRefreshBalance(tx, payment.userId);

  const updated = await tx.subscription.update({
    where: { id: subscription.id },
    data: { creditsRemaining: { increment: pack.credits } },
  });

  await tx.creditTransaction.create({
    data: {
      userId: payment.userId,
      subscriptionId: updated.id,
      type: "GRANT",
      amount: pack.credits,
      reason: "CREDIT_PACK_PURCHASE",
    },
  });
};
