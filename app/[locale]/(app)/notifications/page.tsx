import { getTranslations } from "next-intl/server";

import { getSession } from "@/lib/authSession";
import { myPrisma } from "@/lib/prisma";
import AppPageShell from "../_components/app-page-shell";

async function getNotificationsForUser(userId: string) {
  return myPrisma.notifications.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 100,
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
        },
      },
      post: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
    },
  });
}

type UserNotification = Awaited<
  ReturnType<typeof getNotificationsForUser>
>[number];

// Post notications fusionne avec usernotifications mais écrase les données des proprété//
type PostNotification = UserNotification & {
  postId: string;
  post: NonNullable<UserNotification["post"]>;
};

type PostNotificationGroup = {
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

export default async function NotificationsPage() {
  const t = await getTranslations("appShell.pages.notifications");
  const session = await getSession();

  if (!session) {
    return <AppPageShell title={t("title")} description={t("description")} />;
  }

  const userProfile = await myPrisma.userProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!userProfile) {
    return <AppPageShell title={t("title")} description={t("description")} />;
  }

  const notifications = await getNotificationsForUser(userProfile.id);
  const followNotifications = notifications.filter(
    (notification) => notification.type === "FOLLOW",
  );
  const postNotificationGroups = groupPostNotifications(
    notifications.filter(hasPost),
  );

  void followNotifications;
  void postNotificationGroups;

  return <AppPageShell title={t("title")} description={t("description")} />;
}
