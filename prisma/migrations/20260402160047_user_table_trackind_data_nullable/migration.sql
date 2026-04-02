/*
  Warnings:

  - The `trackingData` column on the `user` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "auth"."user" DROP COLUMN "trackingData",
ADD COLUMN     "trackingData" JSONB;
