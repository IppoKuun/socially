import { NextResponse } from "next/server";

import { getSession } from "@/lib/authSession";
import { getPusherServer } from "@/lib/pusher/server";
import { getUserNotificationsChannel } from "@/lib/pusher/events";
import { myPrisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userProfile = await myPrisma.userProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!userProfile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 403 });
  }

  const formData = await request.formData();
  const socketId = formData.get("socket_id");
  const channelName = formData.get("channel_name");
  const expectedChannelName = getUserNotificationsChannel(userProfile.id);

  if (
    typeof socketId !== "string" ||
    typeof channelName !== "string" ||
    channelName !== expectedChannelName
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
