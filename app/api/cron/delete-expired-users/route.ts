import deleteCloudinary from "@/lib/cloudinaryConfig";
import { captureAppException, captureAppMessage } from "@/lib/monitoring/sentry";
import { myPrisma } from "@/lib/prisma";
import { checkApiRateLimit, getRequestIp } from "@/lib/apiRateLimit";

const DELETE_GRACE_PERIOD_DAYS = 30;
const DELETE_BATCH_SIZE = 20;

function getDeletionThreshold() {
  return new Date(
    Date.now() - DELETE_GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000,
  );
}

async function anonymizeDeletedProfile(profile: {
  id: string;
  userId: string;
  avatarPublicId: string | null;
  bannerPublicId: string | null;
}) {
  const now = new Date();
  const deletedEmail = `deleted-${profile.id}@deleted.socially.local`;
  const mediaPublicIds = [
    profile.avatarPublicId,
    profile.bannerPublicId,
  ].filter((id): id is string => Boolean(id));

  await myPrisma.$transaction([
    myPrisma.postLike.deleteMany({
      where: { user_id: profile.id },
    }),
    myPrisma.commentLike.deleteMany({
      where: { user_id: profile.id },
    }),
    myPrisma.report.deleteMany({
      where: { reporterId: profile.id },
    }),
    myPrisma.notifications.deleteMany({
      where: {
        OR: [{ actorId: profile.id }, { userId: profile.id }],
      },
    }),
    myPrisma.follow.deleteMany({
      where: {
        OR: [
          { followerProfileId: profile.id },
          { followedProfileId: profile.id },
        ],
      },
    }),
    myPrisma.block.deleteMany({
      where: {
        OR: [{ blockerId: profile.id }, { blockedById: profile.id }],
      },
    }),
    myPrisma.searchHistory.deleteMany({
      where: { userId: profile.id },
    }),
    myPrisma.session.deleteMany({
      where: { userId: profile.userId },
    }),
    myPrisma.account.deleteMany({
      where: { userId: profile.userId },
    }),
    myPrisma.user.update({
      where: { id: profile.userId },
      data: {
        name: "Deleted user",
        email: deletedEmail,
        emailVerified: false,
        image: null,
        trackingData: {},
      },
    }),
    myPrisma.userProfile.update({
      where: { id: profile.id },
      data: {
        username: null,
        displayname: "Utilisateur supprimé",
        avatarUrl: null,
        avatarPublicId: null,
        bannerUrl: null,
        bannerPublicId: null,
        bio: null,
        language: "deleted",
        pinnedPostId: null,
        hasAcceptedCookies: false,
        last_seen_at: null,
        utm_source: null,
        utm_medium: null,
        utm_campaign: null,
        referrer_domain: null,
        visitCountBeforeLogin: null,
        anonymeCreatedAt: null,
        hasOnboarded: false,
        onboardedStep: 0,
        intent: null,
        occupation: null,
        isAi: false,
        isPro: false,
        categories: {
          set: [],
        },
        defineltyDeleted: now,
      },
    }),
  ]);

  if (mediaPublicIds.length > 0) {
    try {
      await deleteCloudinary(mediaPublicIds);
    } catch (error) {
      console.error("Unable to delete anonymized profile media", {
        profileId: profile.id,
        error,
      });
      captureAppException(error, {
        feature: "account_deletion",
        action: "delete_anonymized_profile_media",
        level: "warning",
        extra: {
          profileId: profile.id,
          mediaCount: mediaPublicIds.length,
        },
      });
    }
  }
}

export async function GET(request: Request) {
  const rateLimitResponse = await checkApiRateLimit(
    "cron",
    getRequestIp(request),
  );

  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const authHeader = request.headers.get("authorization");

  if (!process.env.CRON_SECRET) {
    captureAppMessage("CRON_SECRET is not configured", {
      feature: "account_deletion",
      action: "delete_expired_users_cron_config",
      level: "error",
    });
    return Response.json(
      { ok: false, error: "CRON_SECRET is not configured" },
      { status: 500 },
    );
  }

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const threshold = getDeletionThreshold();

  const expiredProfiles = await myPrisma.userProfile.findMany({
    where: {
      deletedAt: {
        lte: threshold,
      },
      defineltyDeleted: null,
    },
    select: {
      id: true,
      userId: true,
      avatarPublicId: true,
      bannerPublicId: true,
    },
    orderBy: {
      deletedAt: "asc",
    },
    take: DELETE_BATCH_SIZE,
  });

  const anonymizedProfileIds: string[] = [];
  const failedProfileIds: string[] = [];

  for (const profile of expiredProfiles) {
    try {
      await anonymizeDeletedProfile(profile);
      anonymizedProfileIds.push(profile.id);
    } catch (error) {
      console.error("Unable to anonymize expired deleted profile", {
        profileId: profile.id,
        error,
      });
      captureAppException(error, {
        feature: "account_deletion",
        action: "anonymize_expired_deleted_profile",
        extra: {
          profileId: profile.id,
        },
      });
      failedProfileIds.push(profile.id);
    }
  }

  return Response.json({
    ok: failedProfileIds.length === 0,
    threshold: threshold.toISOString(),
    scannedCount: expiredProfiles.length,
    anonymizedCount: anonymizedProfileIds.length,
    failedCount: failedProfileIds.length,
    anonymizedProfileIds,
    failedProfileIds,
  });
}
