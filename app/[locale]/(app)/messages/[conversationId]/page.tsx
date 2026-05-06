import { getConversationMessages } from "@/lib/messages/queries";
import { notFound } from "next/navigation";
import ConversationHeader from "../_components/ConversationHeader";
import ChatWindow from "../_components/ChatWindow";
import markConversationAsRead from "../_actions/markConversationRead";

export default async function ConversationDetail({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;

  if (!conversationId) {
    notFound();
  }

  const messages = await getConversationMessages(conversationId);

  await markConversationAsRead(conversationId);

  return (
    <section className="flex flex-col">
      <ConversationHeader otherParticipant={messages.otherParticipant} />
      <ChatWindow
        conversationId={conversationId}
        viewerId={messages.viewerId}
        initialMessages={messages.messages}
      />
    </section>
  );
}
