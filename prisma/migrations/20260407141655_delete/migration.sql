/*
  Warnings:

  - The values [NEWS,SCIENCE,GAMING,LIFESTYLE,FOOD,TRAVEL,FASHION_BEAUTY,CREATORS,FINANCE,ENVIRONMENT] on the enum `Category` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "app"."Category_new" AS ENUM ('TECH', 'BUSINESS', 'SOCIETY', 'POLITICS', 'EDUCATION', 'HEALTH', 'SPORTS', 'ENTERTAINMENT', 'CULTURE_ARTS');
ALTER TABLE "app"."Post" ALTER COLUMN "Category" DROP DEFAULT;
ALTER TABLE "app"."UserProfile" ALTER COLUMN "categories" DROP DEFAULT;
ALTER TABLE "app"."UserProfile" ALTER COLUMN "categories" TYPE "app"."Category_new"[] USING ("categories"::text::"app"."Category_new"[]);
ALTER TABLE "app"."Post" ALTER COLUMN "Category" TYPE "app"."Category_new"[] USING ("Category"::text::"app"."Category_new"[]);
ALTER TYPE "app"."Category" RENAME TO "Category_old";
ALTER TYPE "app"."Category_new" RENAME TO "Category";
DROP TYPE "app"."Category_old";
ALTER TABLE "app"."Post" ALTER COLUMN "Category" SET DEFAULT ARRAY[]::"app"."Category"[];
ALTER TABLE "app"."UserProfile" ALTER COLUMN "categories" SET DEFAULT ARRAY[]::"app"."Category"[];
COMMIT;
