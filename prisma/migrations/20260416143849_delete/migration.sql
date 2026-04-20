/*
  Warnings:

  - You are about to drop the column `images` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `isAi` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `isAi` on the `Post` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "app"."Comment" DROP COLUMN "images",
DROP COLUMN "isAi";

-- AlterTable
ALTER TABLE "app"."Post" DROP COLUMN "isAi";
