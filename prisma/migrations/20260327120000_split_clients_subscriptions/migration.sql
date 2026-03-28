-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clients_phoneNumber_key" ON "clients"("phoneNumber");

-- RenameTable
ALTER TABLE "client_status" RENAME TO "subscriptions";

-- AddColumn
ALTER TABLE "subscriptions" ADD COLUMN "clientId" TEXT;

-- Backfill clients from existing subscription rows (dedupe by trimmed phone number)
INSERT INTO "clients" ("id", "clientName", "phoneNumber", "createdAt", "updatedAt")
SELECT
  md5(TRIM(s."phoneNumber")),
  MAX(s."clientName") AS "clientName",
  TRIM(s."phoneNumber") AS "phoneNumber",
  MIN(s."createdAt") AS "createdAt",
  NOW() AS "updatedAt"
FROM "subscriptions" s
GROUP BY TRIM(s."phoneNumber");

-- Link subscriptions to created clients
UPDATE "subscriptions" s
SET "clientId" = c."id"
FROM "clients" c
WHERE TRIM(s."phoneNumber") = c."phoneNumber";

-- Make relation required
ALTER TABLE "subscriptions"
  ALTER COLUMN "clientId" SET NOT NULL;

-- Drop old columns moved to clients table
ALTER TABLE "subscriptions"
  DROP COLUMN "clientName",
  DROP COLUMN "phoneNumber";

-- CreateIndex
CREATE INDEX "subscriptions_clientId_idx" ON "subscriptions"("clientId");

-- AddForeignKey
ALTER TABLE "subscriptions"
  ADD CONSTRAINT "subscriptions_clientId_fkey"
  FOREIGN KEY ("clientId") REFERENCES "clients"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
