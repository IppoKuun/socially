import { getConversationMessages } from "@/lib/messages/queries";
import { makeQueryClient } from "@/lib/query-client";
import { notFound } from "next/navigation";
import ConversationHeader from "../_components/ConversationHeader";
import ChatWindow from "../_components/ChatWindow";
import { MessageInput } from "../_components/MessageInput";

export default async function ConversationDetail({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;

  if (!conversationId) {
    notFound();
  }

  const queryClient = makeQueryClient();

  const messages = await queryClient.fetchQuery({
    queryKey: ["conversations", conversationId, "messages"],
    queryFn: () => {
      return getConversationMessages(conversationId);
    },
  });

  return (
    <section className="flex flex-col">
      <ConversationHeader otherParticipant={messages.otherParticipant} />
      <ChatWindow viewerId={messages.viewerId} messages={messages.messages} />
      <MessageInput />
    </section>
  );
}
