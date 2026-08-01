-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "projectId" TEXT;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "hostingExpiresAt" TIMESTAMP(3),
ADD COLUMN     "hostingStatus" TEXT NOT NULL DEFAULT 'active';

-- CreateIndex
CREATE INDEX "Payment_projectId_idx" ON "Payment"("projectId");

-- CreateIndex
CREATE INDEX "Project_hostingStatus_hostingExpiresAt_idx" ON "Project"("hostingStatus", "hostingExpiresAt");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
