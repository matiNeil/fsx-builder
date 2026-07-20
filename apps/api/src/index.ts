import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const app = Fastify({ logger: true });
const prisma = new PrismaClient();

const createProjectSchema = z.object({
  name: z.string().min(1).max(120),
  type: z.enum(["website", "poster", "image"]),
});

await app.register(cors, { origin: true });
await app.register(multipart);

app.get("/health", async () => ({
  ok: true,
  service: "fsx-api",
  timestamp: new Date().toISOString(),
}));

app.get("/projects", async () => {
  return prisma.project.findMany({
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

  const project = await prisma.project.create({
    data: {
      name: parsed.data.name,
      type: parsed.data.type,
      data: "{}",
    },
  });

  return reply.status(201).send(project);
});

const PORT = Number(process.env.PORT ?? 4000);
const HOST = process.env.HOST ?? "0.0.0.0";

const close = async () => {
  await prisma.$disconnect();
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
  await prisma.$disconnect();
  process.exit(1);
}
