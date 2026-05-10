-- CreateEnum
CREATE TYPE "app"."PostAppealStatus" AS ENUM ('NONE', 'PENDING', 'ACCEPTED', 'REJECTED');

-- DropForeignKey
ALTER TABLE "app"."Block" DROP CONSTRAINT "Block_blockedById_fkey";

-- DropForeignKey
ALTER TABLE "app"."Block" DROP CONSTRAINT "Block_blockerId_fkey";

-- DropForeignKey
ALTER TABLE "app"."CommentLike" DROP CONSTRAINT "CommentLike_comment_id_fkey";

-- DropForeignKey
ALTER TABLE "app"."CommentLike" DROP CONSTRAINT "CommentLike_user_id_fkey";

-- DropForeignKey
ALTER TABLE "app"."Follow" DROP CONSTRAINT "Follow_followedProfileId_fkey";

-- DropForeignKey
ALTER TABLE "app"."Follow" DROP CONSTRAINT "Follow_followerProfileId_fkey";

-- DropForeignKey
ALTER TABLE "app"."Notifications" DROP CONSTRAINT "Notifications_postId_fkey";

-- DropForeignKey
ALTER TABLE "app"."Notifications" DROP CONSTRAINT "Notifications_userId_fkey";

-- DropForeignKey
ALTER TABLE "app"."PostLike" DROP CONSTRAINT "PostLike_post_id_fkey";

-- DropForeignKey
ALTER TABLE "app"."PostLike" DROP CONSTRAINT "PostLike_user_id_fkey";

-- DropForeignKey
ALTER TABLE "app"."Report" DROP CONSTRAINT "Report_reporterId_fkey";

-- DropForeignKey
ALTER TABLE "app"."SearchHistory" DROP CONSTRAINT "SearchHistory_userId_fkey";

-- DropIndex
DROP INDEX "app"."Conversation_participantOneId_idx";

-- DropIndex
DROP INDEX "app"."Conversation_participantTwoId_idx";

-- AlterTable
ALTER TABLE "app"."Post" ADD COLUMN     "appealMessage" TEXT,
ADD COLUMN     "appealStatus" "app"."PostAppealStatus" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "appealedAt" TIMESTAMP(3),
ADD COLUMN     "moderationReason" TEXT,
ADD COLUMN     "reviewDecisionReason" TEXT,
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "reviewedById" TEXT,
ADD COLUMN     "unsafeImages" INTEGER[] DEFAULT ARRAY[]::INTEGER[];

-- CreateIndex
CREATE INDEX "Block_blockedById_blockerId_idx" ON "app"."Block"("blockedById", "blockerId");

-- CreateIndex
CREATE INDEX "Block_blockerId_createdAt_idx" ON "app"."Block"("blockerId", "createdAt");

-- CreateIndex
CREATE INDEX "Comment_postId_responseToCommentId_deletedAt_createdAt_idx" ON "app"."Comment"("postId", "responseToCommentId", "deletedAt", "createdAt");

-- CreateIndex
CREATE INDEX "Comment_responseToCommentId_createdAt_idx" ON "app"."Comment"("responseToCommentId", "createdAt");

-- CreateIndex
CREATE INDEX "Comment_authorId_createdAt_idx" ON "app"."Comment"("authorId", "createdAt");

-- CreateIndex
CREATE INDEX "CommentLike_comment_id_idx" ON "app"."CommentLike"("comment_id");

-- CreateIndex
CREATE INDEX "CommentLike_user_id_createdAt_idx" ON "app"."CommentLike"("user_id", "createdAt");

-- CreateIndex
CREATE INDEX "Conversation_participantOneId_lastMessageAt_idx" ON "app"."Conversation"("participantOneId", "lastMessageAt");

-- CreateIndex
CREATE INDEX "Conversation_participantTwoId_lastMessageAt_idx" ON "app"."Conversation"("participantTwoId", "lastMessageAt");

-- CreateIndex
CREATE INDEX "Follow_followerProfileId_followedProfileId_idx" ON "app"."Follow"("followerProfileId", "followedProfileId");

-- CreateIndex
CREATE INDEX "Follow_followerProfileId_createdAt_idx" ON "app"."Follow"("followerProfileId", "createdAt");

-- CreateIndex
CREATE INDEX "Message_conversationId_receiverId_isRead_idx" ON "app"."Message"("conversationId", "receiverId", "isRead");

-- CreateIndex
CREATE INDEX "Notifications_userId_createdAt_idx" ON "app"."Notifications"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Notifications_userId_type_createdAt_idx" ON "app"."Notifications"("userId", "type", "createdAt");

-- CreateIndex
CREATE INDEX "Notifications_userId_isRead_idx" ON "app"."Notifications"("userId", "isRead");

-- CreateIndex
CREATE INDEX "Notifications_userId_postId_type_isRead_idx" ON "app"."Notifications"("userId", "postId", "type", "isRead");

-- CreateIndex
CREATE INDEX "Notifications_postId_idx" ON "app"."Notifications"("postId");

-- CreateIndex
CREATE INDEX "Post_deletedAt_createdAt_id_idx" ON "app"."Post"("deletedAt", "createdAt", "id");

-- CreateIndex
CREATE INDEX "Post_userId_createdAt_idx" ON "app"."Post"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Post_moderationStatus_createdAt_idx" ON "app"."Post"("moderationStatus", "createdAt");

-- CreateIndex
CREATE INDEX "Post_moderationStatus_appealStatus_appealedAt_idx" ON "app"."Post"("moderationStatus", "appealStatus", "appealedAt");

-- CreateIndex
CREATE INDEX "PostLike_post_id_idx" ON "app"."PostLike"("post_id");

-- CreateIndex
CREATE INDEX "PostLike_user_id_createdAt_idx" ON "app"."PostLike"("user_id", "createdAt");

-- CreateIndex
CREATE INDEX "Report_postId_idx" ON "app"."Report"("postId");

-- CreateIndex
CREATE INDEX "SearchHistory_userId_createdAt_idx" ON "app"."SearchHistory"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "SearchHistory_userId_query_idx" ON "app"."SearchHistory"("userId", "query");

-- CreateIndex
CREATE INDEX "UserProfile_defineltyDeleted_deletedAt_idx" ON "app"."UserProfile"("defineltyDeleted", "deletedAt");

-- AddForeignKey
ALTER TABLE "app"."Report" ADD CONSTRAINT "Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "app"."UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."PostLike" ADD CONSTRAINT "PostLike_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "app"."Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."PostLike" ADD CONSTRAINT "PostLike_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "app"."UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."CommentLike" ADD CONSTRAINT "CommentLike_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "app"."Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."CommentLike" ADD CONSTRAINT "CommentLike_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "app"."UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."Follow" ADD CONSTRAINT "Follow_followedProfileId_fkey" FOREIGN KEY ("followedProfileId") REFERENCES "app"."UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."Follow" ADD CONSTRAINT "Follow_followerProfileId_fkey" FOREIGN KEY ("followerProfileId") REFERENCES "app"."UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."Block" ADD CONSTRAINT "Block_blockedById_fkey" FOREIGN KEY ("blockedById") REFERENCES "app"."UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."Block" ADD CONSTRAINT "Block_blockerId_fkey" FOREIGN KEY ("blockerId") REFERENCES "app"."UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."Notifications" ADD CONSTRAINT "Notifications_postId_fkey" FOREIGN KEY ("postId") REFERENCES "app"."Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."Notifications" ADD CONSTRAINT "Notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "app"."UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."SearchHistory" ADD CONSTRAINT "SearchHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "app"."UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
