-- AlterTable
ALTER TABLE "app"."UserProfile" ADD COLUMN     "hasAcceptedCookies" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "app"."AnonymousVisitor" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "hasAcceptedCookies" BOOLEAN NOT NULL DEFAULT false,
    "visitCount" INTEGER NOT NULL DEFAULT 1,
    "language" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_login_at" TIMESTAMP(3),
    "last_seen_at" TIMESTAMP(3),
    "utm_source" TEXT,
    "utm_medium" TEXT,
    "utm_campaign" TEXT,
    "referrer_domain" TEXT,

    CONSTRAINT "AnonymousVisitor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AnonymousVisitor_id_key" ON "app"."AnonymousVisitor"("id");
