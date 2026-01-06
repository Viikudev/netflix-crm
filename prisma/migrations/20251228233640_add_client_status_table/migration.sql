-- CreateEnum
CREATE TYPE "ClientStatusEnum" AS ENUM ('RENEWED', 'NOT_RENEWED', 'PENDING');

-- CreateTable
CREATE TABLE "client_status" (
    "id" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "activeAccountId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "profile" TEXT NOT NULL,
    "status" "ClientStatusEnum" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_status_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "client_status_activeAccountId_idx" ON "client_status"("activeAccountId");

-- CreateIndex
CREATE INDEX "client_status_serviceId_idx" ON "client_status"("serviceId");

-- AddForeignKey
ALTER TABLE "client_status" ADD CONSTRAINT "client_status_activeAccountId_fkey" FOREIGN KEY ("activeAccountId") REFERENCES "active_account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_status" ADD CONSTRAINT "client_status_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
