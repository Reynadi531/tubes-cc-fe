import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { ChatInput } from "@/components/chat/chat-input";
import { MessageList } from "@/components/chat/message-list";
import { Sidebar } from "@/components/chat/sidebar";
import { useConversations } from "@/hooks/use-conversations";
import { sendMessage } from "@/lib/api";

export const Route = createFileRoute("/")({
  component: ChatPage,
});

function ChatPage() {
  const {
    conversations,
    activeId,
    active,
    selectConversation,
    createConversation,
    deleteConversation,
    appendMessage,
  } = useConversations();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSend(text: string) {
    const conversationId = active?.id ?? createConversation();

    appendMessage(conversationId, { role: "user", content: text });

    setIsLoading(true);
    try {
      const reply = await sendMessage(text);
      appendMessage(conversationId, { role: "assistant", content: reply });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex h-svh">
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={selectConversation}
        onCreate={createConversation}
        onDelete={deleteConversation}
      />
      <main className="flex flex-1 flex-col">
        {active ? (
          <MessageList messages={active.messages} isLoading={isLoading} />
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
            Start a new conversation
          </div>
        )}
        <ChatInput isLoading={isLoading} onSend={handleSend} />
      </main>
    </div>
  );
}
