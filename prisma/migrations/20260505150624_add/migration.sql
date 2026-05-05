/*
  Warnings:

  - Added the required column `lastMessageText` to the `Conversation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "app"."Conversation" ADD COLUMN     "lastMessageText" TEXT NOT NULL;
