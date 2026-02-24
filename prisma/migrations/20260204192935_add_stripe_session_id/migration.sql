/*
  Warnings:

  - A unique constraint covering the columns `[stripeSessionId]` on the table `CheckIn` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "CheckIn" ADD COLUMN     "stripeSessionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "CheckIn_stripeSessionId_key" ON "CheckIn"("stripeSessionId");
