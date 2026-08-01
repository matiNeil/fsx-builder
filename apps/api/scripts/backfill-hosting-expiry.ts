import { PrismaClient } from "@prisma/client";
import { extendHostingExpiry } from "../src/credits.js";

const prisma = new PrismaClient();

/**
 * One-time operational script: grandfathers websites that were published
 * before hosting billing existed with a fresh hostingExpiresAt, so they
 * aren't suspended the instant the suspension cron starts running.
 *
 * Idempotent — only touches rows with hostingExpiresAt still null, so it is
 * safe to re-run any number of times.
 */
async function main() {
  const candidates = await prisma.project.findMany({
    where: { type: "website", hostingExpiresAt: null },
    select: { id: true, name: true, data: true },
  });

  let grandfathered = 0;
  for (const project of candidates) {
    let publishedAt: unknown = null;
    try {
      publishedAt = (JSON.parse(project.data) as { publishedAt?: unknown }).publishedAt;
    } catch {
      publishedAt = null;
    }
    if (!publishedAt) {
      continue;
    }

    await prisma.project.update({
      where: { id: project.id },
      data: { hostingStatus: "active", hostingExpiresAt: extendHostingExpiry(null) },
    });
    grandfathered += 1;
    console.log(`Grandfathered "${project.name}" (${project.id})`);
  }

  console.log(`Done. Grandfathered ${grandfathered}/${candidates.length} candidate project(s).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
