"use server";

import { getTranslations } from "next-intl/server";

import { getSession } from "@/lib/authSession";
import { myPrisma } from "@/lib/prisma";

type CreateOrGetConversationResult =
  | {
      ok: true;
      conversationId: string;
      userMsg: "";
    }
  | {
      ok: false;
      conversationId: null;
      userMsg: string;
    };

// Direct key sera une clé unique pour empecher les doublons A-B / B-A.
// Car si A lance conv a B, la contrainte ne sera pas appliqué si B lance a A
// Ont créer donc une directKey qui ne changera jamais sur les 2 profils //

function getDirectConversationKey(profileAId: string, profileBId: string) {
  return [profileAId, profileBId].sort().join(":");
}

export async function createOrGetConversation(
  targetProfileId: string,
): Promise<CreateOrGetConversationResult> {
  const t = await getTranslations("appShell.pages.messages.actions");
  const session = await getSession();

  if (!session) {
    return { ok: false, conversationId: null, userMsg: t("authRequired") };
  }

  const viewer = await myPrisma.userProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!viewer) {
    return {
      ok: false,
      conversationId: null,
      userMsg: t("viewerProfileNotFound"),
    };
  }

  const target = await myPrisma.userProfile.findFirst({
    where: {
      id: targetProfileId,
      deletedAt: null,
      defineltyDeleted: null,
    },
    select: { id: true },
  });

  if (!target) {
    return {
      ok: false,
      conversationId: null,
      userMsg: t("targetProfileNotFound"),
    };
  }

  if (target.id === viewer.id) {
    return {
      ok: false,
      conversationId: null,
      userMsg: t("cannotMessageSelf"),
    };
  }

  const existingBlock = await myPrisma.block.findFirst({
    where: {
      OR: [
        {
          blockerId: viewer.id,
          blockedById: target.id,
        },
        {
          blockerId: target.id,
          blockedById: viewer.id,
        },
      ],
    },
    select: { id: true },
  });

  if (existingBlock) {
    return {
      ok: false,
      conversationId: null,
      userMsg: t("blocked"),
    };
  }

  const directKey = getDirectConversationKey(viewer.id, target.id);
  const [participantOneId, participantTwoId] = [viewer.id, target.id].sort();

  try {
    const existingConversation = await myPrisma.conversation.findUnique({
      where: { directKey },
      select: { id: true },
    });

    if (existingConversation) {
      return {
        ok: true,
        conversationId: existingConversation.id,
        userMsg: "",
      };
    }

    const conversation = await myPrisma.conversation.create({
      data: {
        directKey,
        creatorId: viewer.id,
        participantOneId,
        participantTwoId,
      },
      select: { id: true },
    });

    return { ok: true, conversationId: conversation.id, userMsg: "" };
  } catch (error) {
    console.error("Unable to create or get conversation", error);

    return {
      ok: false,
      conversationId: null,
      userMsg: t("databaseError"),
    };
  }
}
