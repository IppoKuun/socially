/*
  Warnings:

  - You are about to drop the column `displayName` on the `UserProfile` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[username]` on the table `UserProfile` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `displayname` to the `UserProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `UserProfile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "app"."Message" ADD COLUMN     "imagesPublicId" TEXT;

-- AlterTable
ALTER TABLE "app"."UserProfile" DROP COLUMN "displayName",
ADD COLUMN     "avatarPublicId" TEXT,
ADD COLUMN     "bannerPublicId" TEXT,
ADD COLUMN     "displayname" TEXT NOT NULL,
ADD COLUMN     "username" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "auth"."StaffProfile" ADD COLUMN     "avatarPublicid" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_username_key" ON "app"."UserProfile"("username");
