/*
  Warnings:

  - Added the required column `AccountType` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `trackingData` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "auth"."user" ADD COLUMN     "AccountType" TEXT NOT NULL,
ADD COLUMN     "trackingData" TEXT NOT NULL;
