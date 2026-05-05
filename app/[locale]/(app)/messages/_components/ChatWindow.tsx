import { cn } from "@/lib/utils";

type ChatWindowProps = {
  viewerId: string;
  messages: {
    id: string;
    content: string;
    createdAt: Date;
    senderId: string;
    receiverId: string;
    isRead: boolean;
  }[];
};

export default function ChatWindow({ messages, viewerId }: ChatWindowProps) {
  return (
    <section className={cn("flex flex-col gap-2 p-4 overflow-y-auto")}>
      {messages.map((message) => {
        const isMine = message.senderId === viewerId;

        return (
          <div
            key={message.id}
            className={cn("flex", isMine ? "justify-end" : "justify-start")}
          >
            <div
              className={cn(
                "rounded-2xl px-4 py-2",
                isMine ? "bg-primary text-white" : "bg-white/10",
              )}
            >
              {message.content}
            </div>
          </div>
        );
      })}
    </section>
  );
}
