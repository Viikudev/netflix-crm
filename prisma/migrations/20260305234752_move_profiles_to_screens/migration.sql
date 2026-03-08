/*
  Warnings:

  - You are about to drop the column `profileName` on the `client_status` table. All the data in the column will be lost.
  - You are about to drop the column `profilePIN` on the `client_status` table. All the data in the column will be lost.
  - Added the required column `screenId` to the `client_status` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "client_status" DROP COLUMN "profileName",
DROP COLUMN "profilePIN",
ADD COLUMN     "screenId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "screen" (
    "id" TEXT NOT NULL,
    "profileName" TEXT NOT NULL,
    "profilePIN" INTEGER NOT NULL,
    "activeAccountId" TEXT NOT NULL,

    CONSTRAINT "screen_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "screen_activeAccountId_idx" ON "screen"("activeAccountId");

-- CreateIndex
CREATE INDEX "client_status_screenId_idx" ON "client_status"("screenId");

-- AddForeignKey
ALTER TABLE "screen" ADD CONSTRAINT "screen_activeAccountId_fkey" FOREIGN KEY ("activeAccountId") REFERENCES "active_account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_status" ADD CONSTRAINT "client_status_screenId_fkey" FOREIGN KEY ("screenId") REFERENCES "screen"("id") ON DELETE CASCADE ON UPDATE CASCADE;
