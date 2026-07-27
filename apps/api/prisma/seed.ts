import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const plans = [
  {
    key: "free",
    name: "Free",
    priceCents: 0,
    monthlyCredits: 50,
    customDomainAllowed: false,
    priorityGeneration: false,
    teamWorkspace: false,
  },
  {
    key: "starter",
    name: "Starter",
    priceCents: 1900,
    monthlyCredits: 500,
    customDomainAllowed: true,
    priorityGeneration: false,
    teamWorkspace: false,
  },
  {
    key: "pro",
    name: "Pro",
    priceCents: 4900,
    monthlyCredits: 2000,
    customDomainAllowed: true,
    priorityGeneration: true,
    teamWorkspace: false,
  },
  {
    key: "business",
    name: "Business",
    priceCents: 9900,
    monthlyCredits: 6000,
    customDomainAllowed: true,
    priorityGeneration: true,
    teamWorkspace: true,
  },
  {
    key: "enterprise",
    name: "Enterprise",
    priceCents: null,
    monthlyCredits: null,
    customDomainAllowed: true,
    priorityGeneration: true,
    teamWorkspace: true,
  },
] as const;

const creditCosts = [
  { action: "website.create", credits: 20 },
  { action: "website.edit", credits: 2 },
  { action: "poster.generate", credits: 5 },
  { action: "poster.edit", credits: 2 },
  { action: "image.generate", credits: 8 },
  { action: "image.edit", credits: 3 },
  { action: "website.ai-copy", credits: 3 },
] as const;

async function main() {
  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { key: plan.key },
      create: plan,
      update: plan,
    });
  }

  for (const cost of creditCosts) {
    await prisma.creditCost.upsert({
      where: { action: cost.action },
      create: cost,
      update: cost,
    });
  }

  console.log(`Seeded ${plans.length} plans and ${creditCosts.length} credit costs.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
