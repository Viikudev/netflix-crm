-- AlterTable
ALTER TABLE "active_account" ADD COLUMN     "service_id" TEXT;

-- CreateIndex
CREATE INDEX "active_account_service_id_idx" ON "active_account"("service_id");

-- AddForeignKey
ALTER TABLE "active_account" ADD CONSTRAINT "active_account_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;
