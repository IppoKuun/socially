/*
  Warnings:

  - You are about to drop the column `imagesPublicId` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `imagesUrl` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `sharedPostId` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the `ConversationParticipant` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[directKey]` on the table `Conversation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `directKey` to the `Conversation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Conversation` table without a default value. This is not possible if the table is not empty.
  - Made the column `isRead` on table `Message` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "app"."ConversationParticipant" DROP CONSTRAINT "ConversationParticipant_conversationId_fkey";

-- DropForeignKey
ALTER TABLE "app"."ConversationParticipant" DROP CONSTRAINT "ConversationParticipant_userId_fkey";

-- DropForeignKey
ALTER TABLE "app"."Message" DROP CONSTRAINT "Message_sharedPostId_fkey";

-- DropIndex
DROP INDEX "app"."Conversation_participantOneId_participantTwoId_key";

-- AlterTable
ALTER TABLE "app"."Conversation" ADD COLUMN     "directKey" TEXT NOT NULL,
ADD COLUMN     "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "app"."Message" DROP COLUMN "imagesPublicId",
DROP COLUMN "imagesUrl",
DROP COLUMN "sharedPostId",
ALTER COLUMN "isRead" SET NOT NULL,
ALTER COLUMN "isRead" SET DEFAULT false;

-- DropTable
DROP TABLE "app"."ConversationParticipant";

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_directKey_key" ON "app"."Conversation"("directKey");

-- CreateIndex
CREATE INDEX "Conversation_participantOneId_idx" ON "app"."Conversation"("participantOneId");

-- CreateIndex
CREATE INDEX "Conversation_participantTwoId_idx" ON "app"."Conversation"("participantTwoId");

-- CreateIndex
CREATE INDEX "Conversation_lastMessageAt_idx" ON "app"."Conversation"("lastMessageAt");

-- CreateIndex
CREATE INDEX "Message_conversationId_createdAt_idx" ON "app"."Message"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "Message_receiverId_isRead_idx" ON "app"."Message"("receiverId", "isRead");
