/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `UserProfile` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "app"."Message" ADD COLUMN     "imagesPublicId" TEXT;

-- AlterTable
ALTER TABLE "app"."UserProfile"
RENAME COLUMN "displayName" TO "displayname";

-- AlterTable
ALTER TABLE "app"."UserProfile"
ADD COLUMN     "avatarPublicId" TEXT,
ADD COLUMN     "bannerPublicId" TEXT,
ADD COLUMN     "username" TEXT;

-- AlterTable
ALTER TABLE "auth"."StaffProfile" ADD COLUMN     "avatarPublicid" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_username_key" ON "app"."UserProfile"("username");
