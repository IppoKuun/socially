import { captureAppException } from "@/lib/monitoring/sentry";
import { myPrisma } from "@/lib/prisma";

const LAST_SEEN_UPDATE_INTERVAL_MS = 15 * 60 * 1000;

type TouchUserLastSeenInput = {
  profileId: string;
  lastSeenAt: Date | null;
};

export async function touchUserLastSeen({
  profileId,
  lastSeenAt,
}: TouchUserLastSeenInput) {
  const now = new Date();

  if (
    lastSeenAt &&
    // Ce block vérifié
    // "Est-ce que le dernier lastSeenAt date de moins de 15 minutes ?"" //
    now.getTime() - lastSeenAt.getTime() < LAST_SEEN_UPDATE_INTERVAL_MS
  ) {
    return;
  }

  try {
    await myPrisma.userProfile.update({
      where: { id: profileId },
      data: { last_seen_at: now },
      select: { id: true },
    });
  } catch (error) {
    captureAppException(error, {
      feature: "user_activity",
      action: "touch_last_seen",
      level: "warning",
      extra: {
        profileId,
      },
    });
  }
}
