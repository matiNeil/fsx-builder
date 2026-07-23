import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

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

const createProjectSchema = z.object({
  name: z.string().min(1).max(120),
  type: z.enum(["website", "poster", "image"]),
});
const aiImageSchema = z.object({
  prompt: z.string().min(3).max(1000),
  size: z.enum(["1024x1024", "1536x1024", "1024x1536"]).default("1024x1024"),
});

await app.register(cors, { origin: true });
await app.register(multipart);

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
      data: "{}",
    },
  });

  return reply.status(201).send(project);
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

const close = async () => {
  await app.close();
  process.exit(0);
};

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
