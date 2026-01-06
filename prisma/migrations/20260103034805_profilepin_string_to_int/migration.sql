/*
  Warnings:

  - Changed the type of `profilePIN` on the `client_status` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable - Convert profilePIN from String to Int while preserving data
ALTER TABLE "client_status" ADD COLUMN "profilePIN_new" INTEGER;
UPDATE "client_status" SET "profilePIN_new" = CAST("profilePIN" AS INTEGER) WHERE "profilePIN" IS NOT NULL AND "profilePIN" ~ '^[0-9]+$';
UPDATE "client_status" SET "profilePIN_new" = 0 WHERE "profilePIN_new" IS NULL;
ALTER TABLE "client_status" ALTER COLUMN "profilePIN_new" SET NOT NULL;
ALTER TABLE "client_status" DROP COLUMN "profilePIN";
ALTER TABLE "client_status" RENAME COLUMN "profilePIN_new" TO "profilePIN";
