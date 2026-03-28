-- AlterTable
ALTER TABLE "app"."UserProfile" ADD COLUMN     "anonymeCreatedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "auth"."StaffProfile" (
    "id" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "deletedAt" TIMESTAMP(3),
    "defineltyDeleted" TIMESTAMP(3),

    CONSTRAINT "StaffProfile_pkey" PRIMARY KEY ("id")
);
