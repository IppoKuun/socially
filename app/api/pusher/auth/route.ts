import { NextResponse } from "next/server";

import { getSession } from "@/lib/authSession";
import { getPusherServer } from "@/lib/pusher/server";
import {
  CONVERSATION_REALTIME_CHANNEL_PREFIX,
  getUserNotificationsChannel,
} from "@/lib/pusher/events";
import { myPrisma } from "@/lib/prisma";
import { checkApiRateLimit, getRequestIp } from "@/lib/apiRateLimit";

export async function POST(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimitResponse = await checkApiRateLimit(
    "pusherAuth",
    session.user.id || getRequestIp(request),
  );

  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const userProfile = await myPrisma.userProfile.findFirst({
    where: { userId: session.user.id, deletedAt: null },
    select: { id: true },
  });

  if (!userProfile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 403 });
  }

  const formData = await request.formData();
  const socketId = formData.get("socket_id");
  const channelName = formData.get("channel_name");
  const expectedChannelName = getUserNotificationsChannel(userProfile.id);

  if (typeof socketId !== "string" || typeof channelName !== "string") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (channelName !== expectedChannelName) {
    if (!channelName.startsWith(CONVERSATION_REALTIME_CHANNEL_PREFIX)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const conversationId = channelName.slice(
      CONVERSATION_REALTIME_CHANNEL_PREFIX.length,
    );

    const conversation = await myPrisma.conversation.findFirst({
      where: {
        id: conversationId,
        participantOne: { deletedAt: null },
        participantTwo: { deletedAt: null },
        OR: [
          { participantOneId: userProfile.id },
          { participantTwoId: userProfile.id },
        ],
      },
      select: { id: true },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const pusher = getPusherServer();

  if (!pusher) {
    return NextResponse.json(
      { error: "Pusher is not configured" },
      { status: 503 },
    );
  }

  return NextResponse.json(pusher.authorizeChannel(socketId, channelName));
}
