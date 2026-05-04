/*
  Warnings:

  - A unique constraint covering the columns `[actorId,userId,type,postId]` on the table `Notifications` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Notifications_actorId_userId_type_postId_key" ON "app"."Notifications"("actorId", "userId", "type", "postId");
