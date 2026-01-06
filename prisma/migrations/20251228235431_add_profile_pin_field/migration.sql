/*
  Warnings:

  - You are about to drop the column `profile` on the `client_status` table. All the data in the column will be lost.
  - Added the required column `profileName` to the `client_status` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profilePIN` to the `client_status` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "client_status" DROP COLUMN "profile",
ADD COLUMN     "profileName" TEXT NOT NULL,
ADD COLUMN     "profilePIN" TEXT NOT NULL;
