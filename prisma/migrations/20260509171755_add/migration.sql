-- CreateEnum
CREATE TYPE "app"."EmailStatus" AS ENUM ('SENT', 'FAILED');

-- CreateTable
CREATE TABLE "app"."EmailLog" (
    "id" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "status" "app"."EmailStatus" NOT NULL DEFAULT 'SENT',
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EmailLog_status_createdAt_idx" ON "app"."EmailLog"("status", "createdAt");
