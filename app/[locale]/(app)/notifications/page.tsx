import { getTranslations } from "next-intl/server";

import { getSession } from "@/lib/authSession";
import { myPrisma } from "@/lib/prisma";
import AppPageShell from "../_components/app-page-shell";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import AllPostNotifs from "./_components/AllPostNotifs";
import CurrentPostNotifs from "./_components/CurrentPostNotifs";
import MarkAllAsRead from "./_components/MarkAllAsRead";
import FollowNotifCard from "./_components/FollowNotifCard";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import AuthRequiredPrompt from "@/components/auth/AuthRequiredPrompt";

async function getFollowNotificationsForUser(userId: string) {
  return myPrisma.notifications.findMany({
    where: {
      userId,
      type: "FOLLOW",
      actor: { deletedAt: null },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      type: true,
      isRead: true,
      createdAt: true,
      postId: true,
      actor: {
        select: {
          id: true,
          username: true,
          displayname: true,
          avatarUrl: true,
          relationWhereUserIsFollowed: {
            where: { followerProfileId: userId },
            select: { id: true },
          },
        },
      },
    },
  });
}

async function getPostNotificationsForUser(userId: string) {
  return myPrisma.notifications.findMany({
    where: {
      userId,
      type: { in: ["LIKE", "COMMENT"] },
      postId: { not: null },
      actor: { deletedAt: null },
      post: { deletedAt: null, author: { deletedAt: null } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      type: true,
      isRead: true,
      createdAt: true,
      postId: true,
      actor: {
        select: {
          id: true,
          username: true,
          displayname: true,
          avatarUrl: true,
          relationWhereUserIsFollowed: {
            where: { followerProfileId: userId },
            select: { id: true },
          },
        },
      },
      post: {
        select: {
          deletedAt: true,
          id: true,
          title: true,
          slug: true,
          content: true,
          imagesUrl: true,
        },
      },
    },
  });
}

type UserNotification = Awaited<
  ReturnType<typeof getPostNotificationsForUser>
>[number];
type FollowNotification = Awaited<
  ReturnType<typeof getFollowNotificationsForUser>
>[number];

// Post notications fusionne avec usernotifications mais écrase les données des proprété//
type PostNotification = UserNotification & {
  postId: string;
  post: NonNullable<UserNotification["post"]>;
};

export type FollowNotificationType = FollowNotification;

export type PostNotificationGroup = {
  postId: string;
  post: PostNotification["post"];
  likeActors: PostNotification["actor"][];
  commentActors: PostNotification["actor"][];
  notificationIds: string[];
  isUnread: boolean;
  latestCreatedAt: Date;
};

//norifications is PostNotificationos veut dire que le type de return sera PostNotifiactrions //
function hasPost(
  notification: UserNotification,
): notification is PostNotification {
  return notification.postId !== null && notification.post !== null;
}

function groupPostNotifications(notifications: PostNotification[]) {
  const groups = new Map<string, PostNotificationGroup>();

  for (const notification of notifications) {
    const existingGroup = groups.get(notification.postId);
    const group =
      existingGroup ??
      ({
        postId: notification.postId,
        post: notification.post,
        likeActors: [],
        commentActors: [],
        notificationIds: [],
        isUnread: false,
        latestCreatedAt: notification.createdAt,
      } satisfies PostNotificationGroup);

    if (notification.type === "LIKE") {
      group.likeActors.push(notification.actor);
    }

    if (notification.type === "COMMENT") {
      group.commentActors.push(notification.actor);
    }

    group.notificationIds.push(notification.id);
    group.isUnread = group.isUnread || !notification.isRead;

    if (notification.createdAt > group.latestCreatedAt) {
      group.latestCreatedAt = notification.createdAt;
    }

    groups.set(notification.postId, group);
  }

  // Return un tableau de tout les groupDe post trié par ordre//
  return Array.from(groups.values()).sort(
    (leftGroup, rightGroup) =>
      rightGroup.latestCreatedAt.getTime() -
      leftGroup.latestCreatedAt.getTime(),
  );
}

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ followView: string; postId: string }>;
}) {
  const t = await getTranslations("appShell.pages.notifications");
  const session = await getSession();

  if (!session) {
    return (
      <AppPageShell title={t("title")} description={t("description")}>
        <AuthRequiredPrompt />
      </AppPageShell>
    );
  }

  const userProfile = await myPrisma.userProfile.findFirst({
    where: { userId: session.user.id, deletedAt: null },
    select: { id: true },
  });

  if (!userProfile) {
    redirect("/login");
  }

  const isFollow = (await searchParams).followView;
  const currentPostId = (await searchParams).postId;

  const [followNotifications, postNotifications] = await Promise.all([
    getFollowNotificationsForUser(userProfile.id),
    getPostNotificationsForUser(userProfile.id),
  ]);

  const unreadFollowNotifications = followNotifications.filter(
    (notification) => !notification.isRead,
  );
  const unreadFollowCount = unreadFollowNotifications.length;

  const postNotificationGroups = groupPostNotifications(
    postNotifications.filter(hasPost),
  ) as PostNotificationGroup[];

  const selectedPostId =
    currentPostId ?? postNotificationGroups[0]?.postId ?? null;

  const currentPost = selectedPostId
    ? (postNotificationGroups.find(
        (group) => group.postId === selectedPostId,
      ) ?? null)
    : null;

  const mode = isFollow ? "follow" : "post";
  const hasDetailView = Boolean(currentPostId) || Boolean(isFollow);

  return (
    <AppPageShell title={t("title")} description={t("description")}>
      <section className="flex w-full flex-row items-center justify-between gap-4">
        <MarkAllAsRead />
        <FollowNotifCard
          unreadFollowCount={unreadFollowCount}
          isActive={Boolean(isFollow)}
        />
      </section>

      <section className="mt-5 flex flex-col gap-6 md:flex-row md:gap-2">
        <section
          className={cn(
            "w-full md:block md:w-auto",
            hasDetailView ? "hidden" : "block",
          )}
        >
          <AllPostNotifs
            selectedPostId={selectedPostId}
            postNotificationGroups={postNotificationGroups}
          />
        </section>

        <section
          className={cn(
            "min-w-0 flex-1 md:block",
            hasDetailView ? "block" : "hidden",
          )}
        >
          {hasDetailView && (
            <Link
              href="/notifications"
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-white/78 transition hover:border-white/16 hover:bg-white/[0.1] hover:text-white md:hidden"
            >
              <ArrowLeft className="size-4" />
              {t("back")}
            </Link>
          )}
          <CurrentPostNotifs
            mode={mode}
            currentPost={currentPost}
            followList={followNotifications}
          />
        </section>
      </section>
    </AppPageShell>
  );
}
