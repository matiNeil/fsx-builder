import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import type { IncomingMessage, ServerResponse } from "node:http";
import { hashPassword, mintApiToken, verifyApiToken, verifyPassword } from "./auth.js";
import { InsufficientCreditsError, addMonths, canAfford, chargeCredits, getOrRefreshBalance } from "./credits.js";

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

await app.register(cors, { origin: true });
await app.register(multipart);

app.get("/", async () => ({
  ok: true,
  service: "fsx-api",
  message: "FSX Builder API is running.",
  endpoints: [
    "/health",
    "/auth/register",
    "/auth/login",
    "/projects",
    "/projects/:id/published",
    "/credits/costs",
    "/credits/balance",
    "/credits/usage-breakdown",
    "/ai/generate-image",
    "/ai/generate-copy",
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

app.get("/projects/:id/published", async (request, reply) => {
  const params = z.object({ id: z.string().min(1) }).safeParse(request.params);
  if (!params.success) {
    return reply.status(400).send({ error: "Invalid project id", issues: params.error.issues });
  }

  const db = getPrismaClient();
  if (!db) {
    return reply.status(503).send(dbUnavailable);
  }

  const project = await db.project.findUnique({ where: { id: params.data.id } });
  if (!project || project.type !== "website") {
    return reply.status(404).send(projectNotFound);
  }

  let publishedAt: unknown = null;
  try {
    publishedAt = (JSON.parse(project.data) as { publishedAt?: unknown }).publishedAt;
  } catch {
    publishedAt = null;
  }

  if (!publishedAt) {
    return reply.status(404).send(projectNotFound);
  }

  return reply.status(200).send(project);
});

app.get("/credits/costs", async (_request, reply) => {
  const db = getPrismaClient();
  if (!db) {
    return reply.status(503).send(dbUnavailable);
  }

  const costs = await db.creditCost.findMany();
  return reply.status(200).send(Object.fromEntries(costs.map((cost) => [cost.action, cost.credits])));
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

    try {
      const result = await db.$transaction(async (tx) => {
        const project = await tx.project.update({
          where: { id: params.data.id },
          data: {
            ...(parsed.data.name ? { name: parsed.data.name } : {}),
            ...(parsed.data.data ? { data: JSON.stringify(parsed.data.data) } : {}),
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
