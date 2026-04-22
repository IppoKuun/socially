/*
  Warnings:

  - You are about to drop the column `FollowingId` on the `Follow` table. All the data in the column will be lost.
  - You are about to drop the column `followerId` on the `Follow` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[followedProfileId,followerProfileId]` on the table `Follow` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[reporterId,postId]` on the table `Report` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `followedProfileId` to the `Follow` table without a default value. This is not possible if the table is not empty.
  - Added the required column `followerProfileId` to the `Follow` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "app"."Follow" DROP CONSTRAINT "Follow_FollowingId_fkey";

-- DropForeignKey
ALTER TABLE "app"."Follow" DROP CONSTRAINT "Follow_followerId_fkey";

-- DropIndex
DROP INDEX "app"."Follow_FollowingId_followerId_key";

-- AlterTable
ALTER TABLE "app"."Follow" DROP COLUMN "FollowingId",
DROP COLUMN "followerId",
ADD COLUMN     "followedProfileId" TEXT NOT NULL,
ADD COLUMN     "followerProfileId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Follow_followedProfileId_followerProfileId_key" ON "app"."Follow"("followedProfileId", "followerProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "Report_reporterId_postId_key" ON "app"."Report"("reporterId", "postId");

-- AddForeignKey
ALTER TABLE "app"."Follow" ADD CONSTRAINT "Follow_followedProfileId_fkey" FOREIGN KEY ("followedProfileId") REFERENCES "app"."UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."Follow" ADD CONSTRAINT "Follow_followerProfileId_fkey" FOREIGN KEY ("followerProfileId") REFERENCES "app"."UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
