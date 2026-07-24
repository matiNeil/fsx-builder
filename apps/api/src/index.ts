import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import type { IncomingMessage, ServerResponse } from "node:http";

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

const ensureSqliteSchema = async () => {
  const db = getPrismaClient();
  if (!db) {
    return;
  }

  await db.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Project" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "type" TEXT NOT NULL,
      "data" TEXT NOT NULL DEFAULT '{}',
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL
    );
  `);
  await db.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Asset" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "projectId" TEXT NOT NULL,
      "filename" TEXT NOT NULL,
      "mimeType" TEXT NOT NULL,
      "path" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Asset_projectId_fkey"
        FOREIGN KEY ("projectId")
        REFERENCES "Project" ("id")
        ON DELETE CASCADE
        ON UPDATE CASCADE
    );
  `);
  await db.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "Asset_projectId_idx" ON "Asset"("projectId");
  `);
};

const createProjectSchema = z.object({
  name: z.string().min(1).max(120),
  type: z.enum(["website", "poster", "image"]),
  data: z.record(z.string(), z.unknown()).optional(),
});
const aiImageSchema = z.object({
  prompt: z.string().min(3).max(1000),
  size: z.enum(["1024x1024", "1536x1024", "1024x1536"]).default("1024x1024"),
});
const updateProjectSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  data: z.record(z.string(), z.unknown()).optional(),
});

await app.register(cors, { origin: true });
await app.register(multipart);
app.addHook("onReady", async () => {
  try {
    await ensureSqliteSchema();
  } catch (error) {
    app.log.error(error, "Failed to ensure SQLite schema");
  }
});
app.get("/", async () => ({
  ok: true,
  service: "fsx-api",
  message: "FSX Builder API is running.",
  endpoints: ["/health", "/projects", "/ai/generate-image"],
}));

app.get("/favicon.ico", async (_request, reply) => {
  return reply.status(204).send();
});

app.get("/health", async () => ({
  ok: true,
  service: "fsx-api",
  timestamp: new Date().toISOString(),
}));

app.get("/projects", async (_request, reply) => {
  const db = getPrismaClient();
  if (!db) {
    return reply.status(503).send({
      error: "Database client unavailable",
      message: "Prisma client is not initialized in this deployment.",
    });
  }

  return db.project.findMany({
    orderBy: { updatedAt: "desc" },
  });
});

app.post("/projects", async (request, reply) => {
  const parsed = createProjectSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply.status(400).send({
      error: "Invalid payload",
      issues: parsed.error.issues,
    });
  }

  const db = getPrismaClient();
  if (!db) {
    return reply.status(503).send({
      error: "Database client unavailable",
      message: "Prisma client is not initialized in this deployment.",
    });
  }

  const project = await db.project.create({
    data: {
      name: parsed.data.name,
      type: parsed.data.type,
      data: JSON.stringify(parsed.data.data ?? {}),
    },
  });

  return reply.status(201).send(project);
});

app.get("/projects/:id", async (request, reply) => {
  const params = z.object({ id: z.string().min(1) }).safeParse(request.params);
  if (!params.success) {
    return reply.status(400).send({
      error: "Invalid project id",
      issues: params.error.issues,
    });
  }

  const db = getPrismaClient();
  if (!db) {
    return reply.status(503).send({
      error: "Database client unavailable",
      message: "Prisma client is not initialized in this deployment.",
    });
  }

  const project = await db.project.findUnique({
    where: { id: params.data.id },
  });
  if (!project) {
    return reply.status(404).send({
      error: "Project not found",
      message: "No project exists with the provided id.",
    });
  }
  return reply.status(200).send(project);
});

app.put("/projects/:id", async (request, reply) => {
  const params = z.object({ id: z.string().min(1) }).safeParse(request.params);
  if (!params.success) {
    return reply.status(400).send({
      error: "Invalid project id",
      issues: params.error.issues,
    });
  }

  const parsed = updateProjectSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply.status(400).send({
      error: "Invalid payload",
      issues: parsed.error.issues,
    });
  }

  if (!parsed.data.name && !parsed.data.data) {
    return reply.status(400).send({
      error: "No updates provided",
      message: "Provide at least one field to update.",
    });
  }

  const db = getPrismaClient();
  if (!db) {
    return reply.status(503).send({
      error: "Database client unavailable",
      message: "Prisma client is not initialized in this deployment.",
    });
  }

  try {
    const project = await db.project.update({
      where: { id: params.data.id },
      data: {
        ...(parsed.data.name ? { name: parsed.data.name } : {}),
        ...(parsed.data.data ? { data: JSON.stringify(parsed.data.data) } : {}),
      },
    });
    return reply.status(200).send(project);
  } catch {
    return reply.status(404).send({
      error: "Project not found",
      message: "No project exists with the provided id.",
    });
  }
});

app.post("/ai/generate-image", async (request, reply) => {
  const parsed = aiImageSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply.status(400).send({
      error: "Invalid payload",
      issues: parsed.error.issues,
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

  return reply.status(200).send({
    imageDataUrl: `data:image/png;base64,${imageBase64}`,
    provider: "openai",
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
