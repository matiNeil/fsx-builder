-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_planId_fkey";

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "creditPackId" TEXT,
ADD COLUMN     "kind" TEXT NOT NULL DEFAULT 'plan',
ALTER COLUMN "planId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "CreditPack" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "credits" INTEGER NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreditPack_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CreditPack_key_key" ON "CreditPack"("key");

-- CreateIndex
CREATE INDEX "Payment_creditPackId_idx" ON "Payment"("creditPackId");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_creditPackId_fkey" FOREIGN KEY ("creditPackId") REFERENCES "CreditPack"("id") ON DELETE SET NULL ON UPDATE CASCADE;
