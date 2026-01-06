/*
  Warnings:

  - The values [RENEWED,NOT_RENEWED,PENDING] on the enum `ClientStatusEnum` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ClientStatusEnum_new" AS ENUM ('ACTIVE', 'EXPIRED', 'NEAR_EXPIRATION');
ALTER TABLE "client_status" ALTER COLUMN "status" TYPE "ClientStatusEnum_new" USING ("status"::text::"ClientStatusEnum_new");
ALTER TYPE "ClientStatusEnum" RENAME TO "ClientStatusEnum_old";
ALTER TYPE "ClientStatusEnum_new" RENAME TO "ClientStatusEnum";
DROP TYPE "public"."ClientStatusEnum_old";
COMMIT;
