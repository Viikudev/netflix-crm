-- AlterTable
ALTER TABLE "subscriptions" RENAME CONSTRAINT "client_status_pkey" TO "subscriptions_pkey";

-- RenameForeignKey
ALTER TABLE "subscriptions" RENAME CONSTRAINT "client_status_activeAccountId_fkey" TO "subscriptions_activeAccountId_fkey";

-- RenameForeignKey
ALTER TABLE "subscriptions" RENAME CONSTRAINT "client_status_screenId_fkey" TO "subscriptions_screenId_fkey";

-- RenameForeignKey
ALTER TABLE "subscriptions" RENAME CONSTRAINT "client_status_serviceId_fkey" TO "subscriptions_serviceId_fkey";

-- RenameIndex
ALTER INDEX "client_status_activeAccountId_idx" RENAME TO "subscriptions_activeAccountId_idx";

-- RenameIndex
ALTER INDEX "client_status_screenId_idx" RENAME TO "subscriptions_screenId_idx";

-- RenameIndex
ALTER INDEX "client_status_serviceId_idx" RENAME TO "subscriptions_serviceId_idx";
