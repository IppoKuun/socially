/*
  Warnings:

  - You are about to drop the column `AccountType` on the `user` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "app"."UserProfile_displayName_idx";

-- DropIndex
DROP INDEX "app"."UserProfile_isPro_idx";

-- AlterTable
ALTER TABLE "auth"."user" DROP COLUMN "AccountType";

-- DropEnum
DROP TYPE "auth"."accountType";
