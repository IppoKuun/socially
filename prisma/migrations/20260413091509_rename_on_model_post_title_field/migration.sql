/*
  Warnings:

  - You are about to drop the column `images` on the `Post` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "app"."Post" DROP COLUMN "images",
ADD COLUMN     "imagesUrl" TEXT[];
