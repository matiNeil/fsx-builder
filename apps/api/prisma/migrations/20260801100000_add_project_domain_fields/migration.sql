-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "domain" TEXT,
ADD COLUMN     "domainError" TEXT,
ADD COLUMN     "domainStatus" TEXT,
ADD COLUMN     "domainType" TEXT,
ADD COLUMN     "domainVerifiedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Project_domain_key" ON "Project"("domain");
