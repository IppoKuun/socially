/*
  Warnings:

  - Added the required column `AccountType` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "auth"."accountType" AS ENUM ('PUBLIC', 'BACKOFFICE');

-- AlterTable
ALTER TABLE "auth"."user" ADD COLUMN     "AccountType" "auth"."accountType" NOT NULL;

-- CreateIndex
CREATE INDEX "UserProfile_displayName_idx" ON "app"."UserProfile"("displayName");

-- CreateIndex
CREATE INDEX "UserProfile_isPro_idx" ON "app"."UserProfile"("isPro");
