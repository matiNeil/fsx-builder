import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import { Prisma, PrismaClient } from "@prisma/client";
import { z } from "zod";
import type { IncomingMessage, ServerResponse } from "node:http";
import { hashPassword, mintApiToken, verifyApiToken, verifyPassword } from "./auth.js";
import {
  InsufficientCreditsError,
  addMonths,
  canAfford,
  chargeCredits,
  extendHostingExpiry,
  getOrRefreshBalance,
} from "./credits.js";
import { applyPaynowStatus, getPaynowClient } from "./billing.js";
import { VercelApiError, getVercelDomainsClient } from "./vercel-domains.js";
import { generateWebsiteContent, selectTemplateAndTheme } from "./website-generation.js";
import { getWebsiteTemplateDefinition } from "@fsx/templates";

declare module "fastify" {
  interface FastifyRequest {
    userId?: string;
  }
}

const app = Fastify({ logger: true });
let prisma: PrismaClient | null = null;

const getPrismaClient = (): PrismaClient | null => {
  if (prisma) {
    return prisma;
  }

  try {
    prisma = new PrismaClient();
    return prisma;
  } catch (error) {
    app.log.error(error, "Prisma client initialization failed");
    return null;
  }
};

const dbUnavailable = {
  error: "Database client unavailable",
  message: "Prisma client is not initialized in this deployment.",
};

const projectNotFound = {
  error: "Project not found",
  message: "No project exists with the provided id.",
};

const insufficientCreditsResponse = (error: InsufficientCreditsError) => ({
  error: "insufficient_credits",
  required: error.required,
  available: error.available,
});

const hasPublishedAt = (data: string): boolean => {
  try {
    return Boolean((JSON.parse(data) as { publishedAt?: unknown }).publishedAt);
  } catch {
    return false;
  }
};

const createProjectSchema = z.object({
  name: z.string().min(1).max(120),
  type: z.enum(["website", "poster", "image"]),
  data: z.record(z.string(), z.unknown()).optional(),
});
const aiImageSchema = z.object({
  prompt: z.string().min(3).max(1000),
  size: z.enum(["1024x1024", "1536x1024", "1024x1536"]).default("1024x1024"),
  projectId: z.string().optional(),
});
const aiCopySchema = z.object({
  context: z.string().min(3).max(2000),
  kind: z.enum(["heading", "body"]),
  projectId: z.string().optional(),
});
const updateProjectSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  data: z.record(z.string(), z.unknown()).optional(),
  chargeAction: z.boolean().optional().default(false),
});
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(200),
  name: z.string().min(1).max(120).optional(),
});
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
const checkoutSchema = z.object({
  planKey: z.string().min(1),
});
const creditsCheckoutSchema = z.object({
  packKey: z.string().min(1),
});
const hostingCheckoutSchema = z.object({
  projectId: z.string().min(1),
});
const HOSTING_MONTHLY_PRICE_CENTS = 400;
const ROOT_DOMAIN = "forgestackx.com";
const SUBDOMAIN_LABEL_RE = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
const RESERVED_SUBDOMAINS = new Set(["www", "studio", "api", "app", "mail", "admin"]);
const normalizeSubdomainLabel = (value: string) => value.trim().toLowerCase();
const claimSubdomainSchema = z.object({ subdomain: z.string().min(3).max(63) });
const connectCustomDomainSchema = z.object({ domain: z.string().min(4).max(253) });
const generateSiteSchema = z.object({
  description: z.string().min(10).max(1000),
  projectId: z.string().optional(),
});

await app.register(cors, { origin: true });
await app.register(multipart);

// Paynow posts status updates as a raw url-encoded body whose signature the
// SDK verifies over the exact wire string — keep it as a string rather than
// letting Fastify parse it into an object.
app.addContentTypeParser(
  "application/x-www-form-urlencoded",
  { parseAs: "string" },
  (_request, body, done) => {
    done(null, body);
  }
);

app.get("/", async () => ({
  ok: true,
  service: "fsx-api",
  message: "FSX Studio API is running.",
  endpoints: [
    "/health",
    "/auth/register",
    "/auth/login",
    "/projects",
    "/projects/:id/published",
    "/projects/:id/preview",
    "/credits/costs",
    "/credits/balance",
    "/credits/usage-breakdown",
    "/ai/generate-image",
    "/ai/generate-copy",
    "/ai/generate-site",
    "/billing/checkout",
    "/billing/checkout/credits",
    "/billing/checkout/hosting",
    "/billing/credit-packs",
    "/billing/status/:reference",
    "/billing/paynow/webhook",
    "/cron/suspend-expired-hosting",
  ],
}));

app.get("/favicon.ico", async (_request, reply) => {
  return reply.status(204).send();
});

app.get("/health", async () => ({
  ok: true,
  service: "fsx-api",
  timestamp: new Date().toISOString(),
}));

app.post("/auth/register", async (request, reply) => {
  const parsed = registerSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply.status(400).send({ error: "Invalid payload", issues: parsed.error.issues });
  }

  const db = getPrismaClient();
  if (!db) {
    return reply.status(503).send(dbUnavailable);
  }

  const existing = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return reply.status(409).send({
      error: "Email already registered",
      message: "An account with this email already exists.",
    });
  }

  const freePlan = await db.plan.findUnique({ where: { key: "free" } });
  if (!freePlan || freePlan.monthlyCredits == null) {
    return reply.status(500).send({
      error: "Plans not configured",
      message: "Run the seed script (npm run prisma:seed --workspace @fsx/api) before registering users.",
    });
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const now = new Date();

  const user = await db.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: { email: parsed.data.email, passwordHash, name: parsed.data.name },
    });
    const subscription = await tx.subscription.create({
      data: {
        userId: created.id,
        planId: freePlan.id,
        creditsRemaining: freePlan.monthlyCredits!,
        currentPeriodStart: now,
        currentPeriodEnd: addMonths(now, 1),
      },
    });
    await tx.creditTransaction.create({
      data: {
        userId: created.id,
        subscriptionId: subscription.id,
        type: "GRANT",
        amount: freePlan.monthlyCredits!,
        reason: "SIGNUP_GRANT",
      },
    });
    return created;
  });

  const apiToken = await mintApiToken(user.id);
  return reply.status(201).send({ id: user.id, email: user.email, name: user.name, apiToken });
});

app.post("/auth/login", async (request, reply) => {
  const parsed = loginSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply.status(400).send({ error: "Invalid payload", issues: parsed.error.issues });
  }

  const db = getPrismaClient();
  if (!db) {
    return reply.status(503).send(dbUnavailable);
  }

  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return reply.status(401).send({
      error: "Invalid credentials",
      message: "Email or password is incorrect.",
    });
  }

  const apiToken = await mintApiToken(user.id);
  return reply.status(200).send({ id: user.id, email: user.email, name: user.name, apiToken });
});

const findWebsiteProject = async (db: PrismaClient, id: string) => {
  const project = await db.project.findUnique({ where: { id } });
  return project && project.type === "website" ? project : null;
};

const buildPublishedPayload = (project: NonNullable<Awaited<ReturnType<PrismaClient["project"]["findUnique"]>>>) => {
  let publishedAt: unknown = null;
  try {
    publishedAt = (JSON.parse(project.data) as { publishedAt?: unknown }).publishedAt;
  } catch {
    publishedAt = null;
  }

  if (!publishedAt) {
    return null;
  }

  const isHostingActive =
    project.hostingStatus === "active" &&
    (project.hostingExpiresAt === null || project.hostingExpiresAt > new Date());

  return { ...project, isHostingActive };
};

app.get("/projects/:id/published", async (request, reply) => {
  const params = z.object({ id: z.string().min(1) }).safeParse(request.params);
  if (!params.success) {
    return reply.status(400).send({ error: "Invalid project id", issues: params.error.issues });
  }

  const db = getPrismaClient();
  if (!db) {
    return reply.status(503).send(dbUnavailable);
  }

  const project = await findWebsiteProject(db, params.data.id);
  if (!project) {
    return reply.status(404).send(projectNotFound);
  }

  const payload = buildPublishedPayload(project);
  if (!payload) {
    return reply.status(404).send(projectNotFound);
  }

  return reply.status(200).send(payload);
});

app.get("/projects/:id/preview", async (request, reply) => {
  const params = z.object({ id: z.string().min(1) }).safeParse(request.params);
  if (!params.success) {
    return reply.status(400).send({ error: "Invalid project id", issues: params.error.issues });
  }

  const db = getPrismaClient();
  if (!db) {
    return reply.status(503).send(dbUnavailable);
  }

  const project = await findWebsiteProject(db, params.data.id);
  if (!project) {
    return reply.status(404).send(projectNotFound);
  }

  return reply.status(200).send({ id: project.id, name: project.name, type: project.type, data: project.data });
});

app.get("/published/by-domain/:hostname", async (request, reply) => {
  const params = z.object({ hostname: z.string().min(1) }).safeParse(request.params);
  if (!params.success) {
    return reply.status(400).send({ error: "Invalid hostname" });
  }

  const db = getPrismaClient();
  if (!db) {
    return reply.status(503).send(dbUnavailable);
  }

  const hostname = params.data.hostname.split(":")[0]!.toLowerCase();

  const project = await db.project.findUnique({ where: { domain: hostname } });
  if (!project || project.type !== "website" || project.domainStatus !== "active") {
    return reply.status(404).send(projectNotFound);
  }

  const payload = buildPublishedPayload(project);
  if (!payload) {
    return reply.status(404).send(projectNotFound);
  }

  return reply.status(200).send(payload);
});

app.get("/credits/costs", async (_request, reply) => {
  const db = getPrismaClient();
  if (!db) {
    return reply.status(503).send(dbUnavailable);
  }

  const costs = await db.creditCost.findMany();
  return reply.status(200).send(Object.fromEntries(costs.map((cost) => [cost.action, cost.credits])));
});

app.get("/billing/credit-packs", async (_request, reply) => {
  const db = getPrismaClient();
  if (!db) {
    return reply.status(503).send(dbUnavailable);
  }

  const packs = await db.creditPack.findMany({ orderBy: { credits: "asc" } });
  return reply.status(200).send(
    packs.map((pack) => ({
      key: pack.key,
      name: pack.name,
      credits: pack.credits,
      priceCents: pack.priceCents,
    }))
  );
});

app.post("/billing/paynow/webhook", async (request, reply) => {
  const paynow = getPaynowClient();
  const db = getPrismaClient();
  if (!paynow || !db) {
    return reply.status(503).send(dbUnavailable);
  }

  if (typeof request.body !== "string") {
    return reply.status(400).send({ error: "Invalid payload" });
  }

  let statusUpdate;
  try {
    statusUpdate = paynow.parseStatusUpdate(request.body);
  } catch (error) {
    request.log.warn(error, "Invalid or unverifiable Paynow webhook payload");
    return reply.status(400).send({ error: "Invalid payload" });
  }

  if (!statusUpdate.reference || !statusUpdate.status) {
    return reply.status(200).send({ ok: true });
  }

  const payment = await db.payment.findUnique({ where: { reference: statusUpdate.reference } });
  if (!payment) {
    request.log.warn({ reference: statusUpdate.reference }, "Paynow webhook for unknown payment reference");
    return reply.status(200).send({ ok: true });
  }

  await db.payment.update({
    where: { id: payment.id },
    data: { paynowReference: statusUpdate.paynowReference ?? payment.paynowReference },
  });
  await applyPaynowStatus(db, payment, statusUpdate.status);

  return reply.status(200).send({ ok: true });
});

app.get("/cron/suspend-expired-hosting", async (request, reply) => {
  const cronSecret = process.env.CRON_SECRET;
  const header = request.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;
  if (!cronSecret || token !== cronSecret) {
    return reply.status(401).send({ error: "Unauthorized" });
  }

  const db = getPrismaClient();
  if (!db) {
    return reply.status(503).send(dbUnavailable);
  }

  const result = await db.project.updateMany({
    where: { type: "website", hostingStatus: "active", hostingExpiresAt: { lt: new Date() } },
    data: { hostingStatus: "suspended" },
  });

  return reply.status(200).send({ ok: true, suspendedCount: result.count });
});

await app.register(async (protectedScope) => {
  protectedScope.addHook("onRequest", async (request, reply) => {
    const header = request.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;
    if (!token) {
      return reply.status(401).send({ error: "Unauthorized", message: "Missing bearer token." });
    }
    try {
      const { userId } = await verifyApiToken(token);
      request.userId = userId;
    } catch {
      return reply.status(401).send({ error: "Unauthorized", message: "Invalid or expired token." });
    }
  });

  protectedScope.get("/credits/balance", async (request, reply) => {
    const db = getPrismaClient();
    if (!db) {
      return reply.status(503).send(dbUnavailable);
    }

    const subscription = await getOrRefreshBalance(db, request.userId!);
    return reply.status(200).send({
      plan: {
        key: subscription.plan.key,
        name: subscription.plan.name,
        monthlyCredits: subscription.plan.monthlyCredits,
      },
      creditsRemaining: subscription.creditsRemaining,
      creditsUsedThisPeriod: subscription.creditsUsedThisPeriod,
      currentPeriodEnd: subscription.currentPeriodEnd,
    });
  });

  protectedScope.get("/credits/usage-breakdown", async (request, reply) => {
    const db = getPrismaClient();
    if (!db) {
      return reply.status(503).send(dbUnavailable);
    }

    const transactions = await db.creditTransaction.findMany({
      where: { userId: request.userId, type: "SPEND" },
      select: { reason: true, amount: true },
    });

    const breakdown: Record<"website" | "poster" | "image", number> = {
      website: 0,
      poster: 0,
      image: 0,
    };
    for (const transaction of transactions) {
      const category = transaction.reason.split(".")[0];
      if (category === "website" || category === "poster" || category === "image") {
        breakdown[category] += Math.abs(transaction.amount);
      }
    }

    return reply.status(200).send(breakdown);
  });

  protectedScope.post("/billing/checkout", async (request, reply) => {
    const parsed = checkoutSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: "Invalid payload", issues: parsed.error.issues });
    }

    const db = getPrismaClient();
    if (!db) {
      return reply.status(503).send(dbUnavailable);
    }

    const paynow = getPaynowClient();
    if (!paynow) {
      return reply.status(501).send({
        error: "Payments are not configured",
        message:
          "Set PAYNOW_INTEGRATION_ID, PAYNOW_INTEGRATION_KEY, PAYNOW_RESULT_URL and PAYNOW_RETURN_URL in apps/api/.env to enable checkout.",
      });
    }

    const plan = await db.plan.findUnique({ where: { key: parsed.data.planKey } });
    if (!plan || plan.priceCents == null || plan.priceCents <= 0) {
      return reply.status(400).send({
        error: "Invalid plan",
        message: "This plan cannot be purchased through checkout.",
      });
    }

    const user = await db.user.findUnique({ where: { id: request.userId! } });
    if (!user) {
      return reply.status(404).send({ error: "User not found" });
    }

    const reference = `fsx-${plan.key}-${request.userId}-${Date.now()}`;
    const payment = paynow.createPayment(reference, user.email);
    payment.add(`FSX Studio — ${plan.name} plan`, plan.priceCents / 100);

    const response = await paynow.send(payment);
    if (!response?.success || !response.redirectUrl || !response.pollUrl) {
      request.log.error({ response }, "Paynow checkout initiation failed");
      return reply.status(502).send({
        error: "Failed to start checkout",
        message: response?.error ?? "Paynow did not return a valid response.",
      });
    }

    await db.payment.create({
      data: {
        userId: request.userId!,
        kind: "plan",
        planId: plan.id,
        reference,
        pollUrl: response.pollUrl,
        amountCents: plan.priceCents,
        status: "Created",
      },
    });

    return reply.status(200).send({ redirectUrl: response.redirectUrl, reference });
  });

  protectedScope.post("/billing/checkout/credits", async (request, reply) => {
    const parsed = creditsCheckoutSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: "Invalid payload", issues: parsed.error.issues });
    }

    const db = getPrismaClient();
    if (!db) {
      return reply.status(503).send(dbUnavailable);
    }

    const paynow = getPaynowClient();
    if (!paynow) {
      return reply.status(501).send({
        error: "Payments are not configured",
        message:
          "Set PAYNOW_INTEGRATION_ID, PAYNOW_INTEGRATION_KEY, PAYNOW_RESULT_URL and PAYNOW_RETURN_URL in apps/api/.env to enable checkout.",
      });
    }

    const pack = await db.creditPack.findUnique({ where: { key: parsed.data.packKey } });
    if (!pack) {
      return reply.status(400).send({
        error: "Invalid credit pack",
        message: "This credit pack does not exist.",
      });
    }

    const user = await db.user.findUnique({ where: { id: request.userId! } });
    if (!user) {
      return reply.status(404).send({ error: "User not found" });
    }

    const reference = `fsx-${pack.key}-${request.userId}-${Date.now()}`;
    const payment = paynow.createPayment(reference, user.email);
    payment.add(`FSX Studio — ${pack.name}`, pack.priceCents / 100);

    const response = await paynow.send(payment);
    if (!response?.success || !response.redirectUrl || !response.pollUrl) {
      request.log.error({ response }, "Paynow credit pack checkout initiation failed");
      return reply.status(502).send({
        error: "Failed to start checkout",
        message: response?.error ?? "Paynow did not return a valid response.",
      });
    }

    await db.payment.create({
      data: {
        userId: request.userId!,
        kind: "credits",
        creditPackId: pack.id,
        reference,
        pollUrl: response.pollUrl,
        amountCents: pack.priceCents,
        status: "Created",
      },
    });

    return reply.status(200).send({ redirectUrl: response.redirectUrl, reference });
  });

  protectedScope.post("/billing/checkout/hosting", async (request, reply) => {
    const parsed = hostingCheckoutSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: "Invalid payload", issues: parsed.error.issues });
    }

    const db = getPrismaClient();
    if (!db) {
      return reply.status(503).send(dbUnavailable);
    }

    const paynow = getPaynowClient();
    if (!paynow) {
      return reply.status(501).send({
        error: "Payments are not configured",
        message:
          "Set PAYNOW_INTEGRATION_ID, PAYNOW_INTEGRATION_KEY, PAYNOW_RESULT_URL and PAYNOW_RETURN_URL in apps/api/.env to enable checkout.",
      });
    }

    const project = await db.project.findUnique({ where: { id: parsed.data.projectId } });
    if (!project || project.userId !== request.userId || project.type !== "website") {
      return reply.status(404).send(projectNotFound);
    }

    const user = await db.user.findUnique({ where: { id: request.userId! } });
    if (!user) {
      return reply.status(404).send({ error: "User not found" });
    }

    const reference = `fsx-hosting-${project.id}-${Date.now()}`;
    const payment = paynow.createPayment(reference, user.email);
    payment.add(`FSX Studio — Hosting renewal (${project.name})`, HOSTING_MONTHLY_PRICE_CENTS / 100);

    const response = await paynow.send(payment);
    if (!response?.success || !response.redirectUrl || !response.pollUrl) {
      request.log.error({ response }, "Paynow hosting checkout initiation failed");
      return reply.status(502).send({
        error: "Failed to start checkout",
        message: response?.error ?? "Paynow did not return a valid response.",
      });
    }

    await db.payment.create({
      data: {
        userId: request.userId!,
        kind: "hosting",
        projectId: project.id,
        reference,
        pollUrl: response.pollUrl,
        amountCents: HOSTING_MONTHLY_PRICE_CENTS,
        status: "Created",
      },
    });

    return reply.status(200).send({ redirectUrl: response.redirectUrl, reference });
  });

  protectedScope.get("/billing/status/:reference", async (request, reply) => {
    const params = z.object({ reference: z.string().min(1) }).safeParse(request.params);
    if (!params.success) {
      return reply.status(400).send({ error: "Invalid reference", issues: params.error.issues });
    }

    const db = getPrismaClient();
    if (!db) {
      return reply.status(503).send(dbUnavailable);
    }

    const payment = await db.payment.findUnique({
      where: { reference: params.data.reference },
      include: { plan: true, creditPack: true, project: true },
    });
    if (!payment || payment.userId !== request.userId) {
      return reply.status(404).send({ error: "Payment not found" });
    }

    const paidStatuses = new Set(["paid", "awaiting delivery", "delivered"]);
    const paynow = getPaynowClient();
    if (paynow && !paidStatuses.has(payment.status.toLowerCase())) {
      try {
        const polled = await paynow.pollTransaction(payment.pollUrl);
        if (polled?.status) {
          await applyPaynowStatus(db, payment, polled.status);
        }
      } catch (error) {
        request.log.error(error, "Failed to poll Paynow transaction status");
      }
    }

    const refreshed = await db.payment.findUnique({
      where: { reference: params.data.reference },
      include: { project: true },
    });
    const label =
      payment.kind === "credits"
        ? payment.creditPack?.name
        : payment.kind === "hosting"
          ? payment.project?.name
          : payment.plan?.name;
    return reply.status(200).send({
      status: refreshed?.status ?? payment.status,
      kind: payment.kind,
      label,
      credits: payment.kind === "credits" ? payment.creditPack?.credits : undefined,
      hostingExpiresAt: payment.kind === "hosting" ? (refreshed?.project?.hostingExpiresAt ?? null) : undefined,
    });
  });

  protectedScope.get("/projects", async (request, reply) => {
    const db = getPrismaClient();
    if (!db) {
      return reply.status(503).send(dbUnavailable);
    }

    return db.project.findMany({
      where: { userId: request.userId },
      orderBy: { updatedAt: "desc" },
    });
  });

  protectedScope.post("/projects", async (request, reply) => {
    const parsed = createProjectSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: "Invalid payload", issues: parsed.error.issues });
    }

    const db = getPrismaClient();
    if (!db) {
      return reply.status(503).send(dbUnavailable);
    }

    const chargeAction =
      parsed.data.type === "website"
        ? "website.create"
        : parsed.data.type === "poster"
          ? "poster.generate"
          : null;

    try {
      const result = await db.$transaction(async (tx) => {
        const project = await tx.project.create({
          data: {
            userId: request.userId!,
            name: parsed.data.name,
            type: parsed.data.type,
            data: JSON.stringify(parsed.data.data ?? {}),
          },
        });

        const subscription = chargeAction
          ? await chargeCredits(tx, request.userId!, chargeAction, { relatedProjectId: project.id })
          : await getOrRefreshBalance(tx, request.userId!);

        return { project, creditsRemaining: subscription.creditsRemaining };
      });

      return reply.status(201).send({ ...result.project, creditsRemaining: result.creditsRemaining });
    } catch (error) {
      if (error instanceof InsufficientCreditsError) {
        return reply.status(402).send(insufficientCreditsResponse(error));
      }
      throw error;
    }
  });

  protectedScope.get("/projects/:id", async (request, reply) => {
    const params = z.object({ id: z.string().min(1) }).safeParse(request.params);
    if (!params.success) {
      return reply.status(400).send({ error: "Invalid project id", issues: params.error.issues });
    }

    const db = getPrismaClient();
    if (!db) {
      return reply.status(503).send(dbUnavailable);
    }

    const project = await db.project.findUnique({ where: { id: params.data.id } });
    if (!project || project.userId !== request.userId) {
      return reply.status(404).send(projectNotFound);
    }
    return reply.status(200).send(project);
  });

  protectedScope.put("/projects/:id", async (request, reply) => {
    const params = z.object({ id: z.string().min(1) }).safeParse(request.params);
    if (!params.success) {
      return reply.status(400).send({ error: "Invalid project id", issues: params.error.issues });
    }

    const parsed = updateProjectSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: "Invalid payload", issues: parsed.error.issues });
    }

    if (!parsed.data.name && !parsed.data.data) {
      return reply.status(400).send({
        error: "No updates provided",
        message: "Provide at least one field to update.",
      });
    }

    const db = getPrismaClient();
    if (!db) {
      return reply.status(503).send(dbUnavailable);
    }

    const existing = await db.project.findUnique({ where: { id: params.data.id } });
    if (!existing || existing.userId !== request.userId) {
      return reply.status(404).send(projectNotFound);
    }

    const nextData = parsed.data.data ? JSON.stringify(parsed.data.data) : null;
    const wasPublished = hasPublishedAt(existing.data);
    const willBePublished = nextData ? hasPublishedAt(nextData) : wasPublished;
    const isFirstPublish =
      existing.type === "website" && !wasPublished && willBePublished && existing.hostingExpiresAt === null;

    try {
      const result = await db.$transaction(async (tx) => {
        const project = await tx.project.update({
          where: { id: params.data.id },
          data: {
            ...(parsed.data.name ? { name: parsed.data.name } : {}),
            ...(nextData ? { data: nextData } : {}),
            ...(isFirstPublish
              ? { hostingStatus: "active", hostingExpiresAt: extendHostingExpiry(null) }
              : {}),
          },
        });

        const subscription = parsed.data.chargeAction
          ? await chargeCredits(tx, request.userId!, `${existing.type}.edit`, { relatedProjectId: project.id })
          : await getOrRefreshBalance(tx, request.userId!);

        return { project, creditsRemaining: subscription.creditsRemaining };
      });

      return reply.status(200).send({ ...result.project, creditsRemaining: result.creditsRemaining });
    } catch (error) {
      if (error instanceof InsufficientCreditsError) {
        return reply.status(402).send(insufficientCreditsResponse(error));
      }
      throw error;
    }
  });

  protectedScope.get("/projects/:id/domain/subdomain-availability", async (request, reply) => {
    const params = z.object({ id: z.string().min(1) }).safeParse(request.params);
    const query = z.object({ value: z.string().min(1) }).safeParse(request.query);
    if (!params.success || !query.success) {
      return reply.status(400).send({ error: "Invalid request" });
    }

    const db = getPrismaClient();
    if (!db) {
      return reply.status(503).send(dbUnavailable);
    }

    const existing = await db.project.findUnique({ where: { id: params.data.id } });
    if (!existing || existing.userId !== request.userId) {
      return reply.status(404).send(projectNotFound);
    }

    const normalized = normalizeSubdomainLabel(query.data.value);
    if (!normalized || !SUBDOMAIN_LABEL_RE.test(normalized) || RESERVED_SUBDOMAINS.has(normalized)) {
      return reply.status(200).send({ available: false, reason: "invalid_format" });
    }

    const domain = `${normalized}.${ROOT_DOMAIN}`;
    const conflict = await db.project.findUnique({ where: { domain } });
    const available = !conflict || conflict.id === existing.id;
    return reply.status(200).send({ available, reason: available ? undefined : "taken" });
  });

  protectedScope.post("/projects/:id/domain/subdomain", async (request, reply) => {
    const params = z.object({ id: z.string().min(1) }).safeParse(request.params);
    if (!params.success) {
      return reply.status(400).send({ error: "Invalid project id", issues: params.error.issues });
    }

    const parsed = claimSubdomainSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: "Invalid payload", issues: parsed.error.issues });
    }

    const db = getPrismaClient();
    if (!db) {
      return reply.status(503).send(dbUnavailable);
    }

    const existing = await db.project.findUnique({ where: { id: params.data.id } });
    if (!existing || existing.userId !== request.userId || existing.type !== "website") {
      return reply.status(404).send(projectNotFound);
    }

    if (existing.hostingStatus !== "active" || existing.hostingExpiresAt === null) {
      return reply.status(400).send({
        error: "hosting_not_active",
        message: "Hosting must be active before you can set up a domain.",
      });
    }

    const normalized = normalizeSubdomainLabel(parsed.data.subdomain);
    if (!normalized || !SUBDOMAIN_LABEL_RE.test(normalized) || RESERVED_SUBDOMAINS.has(normalized)) {
      return reply.status(400).send({ error: "invalid_subdomain", message: "Choose a different name." });
    }

    const domain = `${normalized}.${ROOT_DOMAIN}`;
    const conflict = await db.project.findUnique({ where: { domain } });
    if (conflict && conflict.id !== existing.id) {
      return reply.status(409).send({ error: "subdomain_taken", message: "That name is already in use." });
    }

    if (existing.domainType === "custom" && existing.domain) {
      const vercel = getVercelDomainsClient();
      if (vercel) {
        await vercel.removeDomain(existing.domain).catch((error) => {
          request.log.warn(error, "Failed to remove previous custom domain from Vercel (non-blocking)");
        });
      }
    }

    try {
      const updated = await db.project.update({
        where: { id: existing.id },
        data: {
          domainType: "subdomain",
          domain,
          domainStatus: "active",
          domainVerifiedAt: new Date(),
          domainError: null,
        },
      });
      return reply.status(200).send(updated);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        return reply.status(409).send({ error: "subdomain_taken", message: "That name is already in use." });
      }
      throw error;
    }
  });

  protectedScope.post("/projects/:id/domain/custom", async (request, reply) => {
    const params = z.object({ id: z.string().min(1) }).safeParse(request.params);
    if (!params.success) {
      return reply.status(400).send({ error: "Invalid project id", issues: params.error.issues });
    }

    const parsed = connectCustomDomainSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: "Invalid payload", issues: parsed.error.issues });
    }

    const db = getPrismaClient();
    if (!db) {
      return reply.status(503).send(dbUnavailable);
    }

    const existing = await db.project.findUnique({ where: { id: params.data.id } });
    if (!existing || existing.userId !== request.userId || existing.type !== "website") {
      return reply.status(404).send(projectNotFound);
    }

    if (existing.hostingStatus !== "active" || existing.hostingExpiresAt === null) {
      return reply.status(400).send({
        error: "hosting_not_active",
        message: "Hosting must be active before you can set up a domain.",
      });
    }

    const subscription = await getOrRefreshBalance(db, request.userId!);
    if (!subscription.plan.customDomainAllowed) {
      return reply.status(403).send({
        error: "upgrade_required",
        message: "Connecting a custom domain requires a paid plan.",
      });
    }

    const domain = parsed.data.domain.trim().toLowerCase();
    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain) || domain.includes("..")) {
      return reply.status(400).send({ error: "invalid_domain", message: "Enter a valid domain name." });
    }
    if (domain === ROOT_DOMAIN || domain === `www.${ROOT_DOMAIN}` || domain.endsWith(`.${ROOT_DOMAIN}`)) {
      return reply.status(400).send({
        error: "reserved_domain",
        message: "That domain isn't available to connect.",
      });
    }

    const conflict = await db.project.findUnique({ where: { domain } });
    if (conflict && conflict.id !== existing.id) {
      return reply.status(409).send({ error: "domain_taken", message: "That domain is already connected elsewhere." });
    }

    const vercel = getVercelDomainsClient();
    if (!vercel) {
      return reply.status(501).send({
        error: "domain_connection_not_configured",
        message: "Custom domain connection isn't configured on this deployment yet.",
      });
    }

    let addResult;
    try {
      addResult = await vercel.addDomain(domain);
    } catch (error) {
      if (error instanceof VercelApiError && error.status === 409) {
        return reply.status(409).send({ error: "domain_taken", message: "That domain is already in use elsewhere." });
      }
      request.log.error(error, "Vercel addDomain failed");
      return reply.status(502).send({ error: "domain_connect_failed", message: "Failed to connect that domain." });
    }

    let config;
    try {
      config = await vercel.getDomainConfig(domain);
    } catch (error) {
      request.log.error(error, "Vercel getDomainConfig failed");
      config = { misconfigured: true };
    }

    const isApex = addResult.name === addResult.apexName;
    const instructions = {
      recordType: isApex ? "A" : "CNAME",
      host: isApex ? "@" : addResult.name.replace(`.${addResult.apexName}`, ""),
      value: isApex ? config.recommendedIPv4?.[0]?.value : config.recommendedCNAME?.[0]?.value,
    } as { recordType: string; host: string; value?: string | string[] };

    try {
      const updated = await db.project.update({
        where: { id: existing.id },
        data: { domainType: "custom", domain, domainStatus: "pending", domainError: null },
      });
      return reply.status(200).send({
        ...updated,
        instructions,
        verificationChallenge: addResult.verified ? null : (addResult.verification ?? null),
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        return reply.status(409).send({ error: "domain_taken", message: "That domain is already connected elsewhere." });
      }
      throw error;
    }
  });

  protectedScope.get("/projects/:id/domain/status", async (request, reply) => {
    const params = z.object({ id: z.string().min(1) }).safeParse(request.params);
    if (!params.success) {
      return reply.status(400).send({ error: "Invalid project id", issues: params.error.issues });
    }

    const db = getPrismaClient();
    if (!db) {
      return reply.status(503).send(dbUnavailable);
    }

    const existing = await db.project.findUnique({ where: { id: params.data.id } });
    if (!existing || existing.userId !== request.userId) {
      return reply.status(404).send(projectNotFound);
    }

    if (existing.domainType !== "custom" || !existing.domain) {
      return reply.status(400).send({ error: "no_custom_domain", message: "No custom domain is connected." });
    }

    if (existing.domainStatus === "active") {
      return reply.status(200).send({
        domain: existing.domain,
        domainStatus: existing.domainStatus,
        domainError: existing.domainError,
      });
    }

    const vercel = getVercelDomainsClient();
    if (!vercel) {
      return reply.status(501).send({
        error: "domain_connection_not_configured",
        message: "Custom domain connection isn't configured on this deployment yet.",
      });
    }

    try {
      let projectDomain = await vercel.getProjectDomain(existing.domain);
      if (!projectDomain.verified) {
        try {
          projectDomain = await vercel.verifyDomain(existing.domain);
        } catch {
          // still unverified — fall through and report the pending state below
        }
      }

      if (!projectDomain.verified) {
        const reason = projectDomain.verification?.[0]?.reason ?? "Domain ownership could not be verified yet.";
        const updated = await db.project.update({
          where: { id: existing.id },
          data: { domainError: reason },
        });
        return reply.status(200).send({
          domain: updated.domain,
          domainStatus: "pending",
          domainError: updated.domainError,
        });
      }

      const config = await vercel.getDomainConfig(existing.domain);
      if (!config.misconfigured) {
        const updated = await db.project.update({
          where: { id: existing.id },
          data: { domainStatus: "active", domainVerifiedAt: new Date(), domainError: null },
        });
        return reply.status(200).send({
          domain: updated.domain,
          domainStatus: updated.domainStatus,
          domainError: updated.domainError,
        });
      }

      const updated = await db.project.update({
        where: { id: existing.id },
        data: { domainError: "DNS not detected yet — double check the record below." },
      });
      return reply.status(200).send({
        domain: updated.domain,
        domainStatus: "pending",
        domainError: updated.domainError,
      });
    } catch (error) {
      request.log.error(error, "Failed to check domain status with Vercel");
      return reply.status(502).send({ error: "domain_status_failed", message: "Failed to check domain status." });
    }
  });

  protectedScope.post("/ai/generate-image", async (request, reply) => {
    const parsed = aiImageSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: "Invalid payload", issues: parsed.error.issues });
    }

    const db = getPrismaClient();
    if (!db) {
      return reply.status(503).send(dbUnavailable);
    }

    const affordability = await canAfford(db, request.userId!, "image.generate");
    if (!affordability.ok) {
      return reply.status(402).send({
        error: "insufficient_credits",
        required: affordability.required,
        available: affordability.available,
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return reply.status(501).send({
        error: "AI image generation is not configured",
        message: "Set OPENAI_API_KEY in apps/api/.env to enable this feature.",
      });
    }

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt: parsed.data.prompt,
        size: parsed.data.size,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      request.log.error({ errorBody }, "OpenAI image generation failed");
      return reply.status(502).send({
        error: "Failed to generate image",
        message: "The AI provider returned an error.",
      });
    }

    const result = (await response.json()) as { data?: Array<{ b64_json?: string }> };
    const imageBase64 = result.data?.[0]?.b64_json;
    if (!imageBase64) {
      return reply.status(502).send({
        error: "Failed to generate image",
        message: "The AI provider did not return image data.",
      });
    }

    try {
      const subscription = await chargeCredits(db, request.userId!, "image.generate", {
        relatedProjectId: parsed.data.projectId,
      });

      return reply.status(200).send({
        imageDataUrl: `data:image/png;base64,${imageBase64}`,
        provider: "openai",
        creditsRemaining: subscription.creditsRemaining,
      });
    } catch (error) {
      if (error instanceof InsufficientCreditsError) {
        return reply.status(402).send(insufficientCreditsResponse(error));
      }
      throw error;
    }
  });

  protectedScope.post("/ai/generate-copy", async (request, reply) => {
    const parsed = aiCopySchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: "Invalid payload", issues: parsed.error.issues });
    }

    const db = getPrismaClient();
    if (!db) {
      return reply.status(503).send(dbUnavailable);
    }

    const affordability = await canAfford(db, request.userId!, "website.ai-copy");
    if (!affordability.ok) {
      return reply.status(402).send({
        error: "insufficient_credits",
        required: affordability.required,
        available: affordability.available,
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return reply.status(501).send({
        error: "AI copy generation is not configured",
        message: "Set OPENAI_API_KEY in apps/api/.env to enable this feature.",
      });
    }

    const lengthHint =
      parsed.data.kind === "heading"
        ? "Write a short, punchy heading (max 8 words). Return only the heading text, no quotes."
        : "Write a concise paragraph (2-3 sentences) of website section body copy. Return only the copy, no quotes or markdown.";

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You write concise, professional marketing copy for small business websites. " +
              lengthHint,
          },
          { role: "user", content: parsed.data.context },
        ],
        temperature: 0.7,
        max_tokens: 120,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      request.log.error({ errorBody }, "OpenAI copy generation failed");
      return reply.status(502).send({
        error: "Failed to generate copy",
        message: "The AI provider returned an error.",
      });
    }

    const result = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = result.choices?.[0]?.message?.content?.trim();
    if (!text) {
      return reply.status(502).send({
        error: "Failed to generate copy",
        message: "The AI provider did not return text.",
      });
    }

    try {
      const subscription = await chargeCredits(db, request.userId!, "website.ai-copy", {
        relatedProjectId: parsed.data.projectId,
      });

      return reply.status(200).send({
        text,
        creditsRemaining: subscription.creditsRemaining,
      });
    } catch (error) {
      if (error instanceof InsufficientCreditsError) {
        return reply.status(402).send(insufficientCreditsResponse(error));
      }
      throw error;
    }
  });

  protectedScope.post("/ai/generate-site", async (request, reply) => {
    const parsed = generateSiteSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: "Invalid payload", issues: parsed.error.issues });
    }

    const db = getPrismaClient();
    if (!db) {
      return reply.status(503).send(dbUnavailable);
    }

    const affordability = await canAfford(db, request.userId!, "website.ai-generate-site");
    if (!affordability.ok) {
      return reply.status(402).send({
        error: "insufficient_credits",
        required: affordability.required,
        available: affordability.available,
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return reply.status(501).send({
        error: "AI site generation is not configured",
        message: "Set OPENAI_API_KEY in apps/api/.env to enable this feature.",
      });
    }

    const selection = await selectTemplateAndTheme(apiKey, parsed.data.description);
    const definition = selection ? getWebsiteTemplateDefinition(selection.templateId) : undefined;
    if (!selection || !definition) {
      return reply.status(502).send({
        error: "Failed to generate site",
        message: "The AI provider did not return a usable template selection.",
      });
    }

    const pages = await generateWebsiteContent(apiKey, parsed.data.description, definition, request.log);

    try {
      const subscription = await chargeCredits(db, request.userId!, "website.ai-generate-site", {
        relatedProjectId: parsed.data.projectId,
      });

      return reply.status(200).send({
        templateId: selection.templateId,
        themeId: selection.themeId,
        pages,
        creditsRemaining: subscription.creditsRemaining,
      });
    } catch (error) {
      if (error instanceof InsufficientCreditsError) {
        return reply.status(402).send(insufficientCreditsResponse(error));
      }
      throw error;
    }
  });
});

const PORT = Number(process.env.PORT ?? 4000);
const HOST = process.env.HOST ?? "0.0.0.0";
const isVercelRuntime = process.env.VERCEL === "1";
let isReady = false;

const ensureReady = async () => {
  if (!isReady) {
    await app.ready();
    isReady = true;
  }
};

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await ensureReady();
  app.server.emit("request", req, res);
}

const close = async () => {
  if (prisma) {
    await prisma.$disconnect();
  }
  await app.close();
  process.exit(0);
};
if (!isVercelRuntime) {
  process.on("SIGINT", () => {
    void close();
  });

  process.on("SIGTERM", () => {
    void close();
  });

  try {
    await app.listen({ port: PORT, host: HOST });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}
