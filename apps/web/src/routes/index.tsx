import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

import { ChatInput } from "@/components/chat/chat-input";
import { EmptyState } from "@/components/chat/empty-state";
import { Header } from "@/components/chat/header";
import { MessageList } from "@/components/chat/message-list";
import { Sidebar } from "@/components/chat/sidebar";
import { useConversations } from "@/hooks/use-conversations";
import { AbortError, newMessage, sendMessage } from "@/lib/api";

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
    renameConversation,
  } = useConversations();
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const sendIntoConversation = useCallback(
    async (conversationId: string, text: string) => {
      appendMessage(conversationId, newMessage("user", text));
      const controller = new AbortController();
      abortRef.current = controller;
      setIsLoading(true);
      try {
        const reply = await sendMessage(text, controller.signal);
        appendMessage(conversationId, newMessage("assistant", reply));
      } catch (err) {
        if (err instanceof AbortError) {
          toast("Stopped");
          return;
        }
        toast.error(err instanceof Error ? err.message : "Failed to send message");
      } finally {
        if (abortRef.current === controller) abortRef.current = null;
        setIsLoading(false);
      }
    },
    [appendMessage],
  );

  const handleSend = useCallback(
    (text: string) => {
      const id = active?.id ?? createConversation();
      void sendIntoConversation(id, text);
    },
    [active?.id, createConversation, sendIntoConversation],
  );

  const handleStop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const handleDelete = useCallback(
    (id: string) => {
      const restore = deleteConversation(id);
      toast("Conversation deleted", {
        action: {
          label: "Undo",
          onClick: () => restore(),
        },
        duration: 5000,
      });
    },
    [deleteConversation],
  );

  return (
    <div className="flex h-svh">
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={selectConversation}
        onCreate={() => createConversation()}
        onDelete={handleDelete}
      />
      <main className="flex flex-1 flex-col">
        {active ? (
          <>
            <Header
              title={active.title}
              onRename={(next) => renameConversation(active.id, next)}
              onDelete={() => handleDelete(active.id)}
            />
            <MessageList messages={active.messages} isLoading={isLoading} />
          </>
        ) : (
          <EmptyState onSelect={handleSend} />
        )}
        <ChatInput isLoading={isLoading} onSend={handleSend} onStop={handleStop} />
      </main>
    </div>
  );
}
