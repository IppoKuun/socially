/*
  Warnings:

  - Made the column `isRead` on table `Notifications` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "app"."Notifications" ALTER COLUMN "isRead" SET NOT NULL,
ALTER COLUMN "isRead" SET DEFAULT false;
