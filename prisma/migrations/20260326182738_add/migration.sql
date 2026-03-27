/*
  Warnings:

  - You are about to drop the column `last_login_at` on the `AnonymousVisitor` table. All the data in the column will be lost.
  - You are about to drop the column `last_seen_at` on the `AnonymousVisitor` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[visitorId]` on the table `AnonymousVisitor` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "app"."AnonymousVisitor" DROP COLUMN "last_login_at",
DROP COLUMN "last_seen_at";

-- CreateIndex
CREATE UNIQUE INDEX "AnonymousVisitor_visitorId_key" ON "app"."AnonymousVisitor"("visitorId");
