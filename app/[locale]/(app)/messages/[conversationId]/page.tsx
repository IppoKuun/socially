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

  if (messages) {
    await markConversationAsRead(conversationId);
  }

  return messages ? (
    <section className="flex min-h-[620px] flex-col bg-[rgba(12,14,20,0.36)]">
      <ConversationHeader otherParticipant={messages.otherParticipant} />
      <ChatWindow
        conversationId={conversationId}
        viewerId={messages.viewerId}
        initialMessages={messages.messages}
      />
    </section>
  ) : (
    <div className="flex flex-1 items-center justify-center p-4">
      <p className="text-neutral-500 font-medium bg-neutral-900/50 px-6 py-3 rounded-full border border-neutral-800">
        La conversation na pas été trouvée
      </p>
    </div>
  );
}
