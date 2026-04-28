/*
  Warnings:

  - The `query` column on the `SearchHistory` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "app"."SearchHistory" DROP COLUMN "query",
ADD COLUMN     "query" TEXT[];
