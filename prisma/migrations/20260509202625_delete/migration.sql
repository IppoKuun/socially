/*
  Warnings:

  - You are about to drop the column `last_login_at` on the `UserProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "app"."UserProfile" DROP COLUMN "last_login_at";
