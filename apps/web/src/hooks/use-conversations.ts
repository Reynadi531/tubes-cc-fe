import { useEffect, useState } from "react";

import type { Conversation, Message } from "@/lib/api";

const STORAGE_KEY = "chat-conversations";

function load(): Conversation[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>(load);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  }, [conversations]);

  function createConversation() {
    const conv: Conversation = {
      id: crypto.randomUUID(),
      title: "New conversation",
      messages: [],
      createdAt: Date.now(),
    };
    setConversations((prev) => [conv, ...prev]);
    setActiveId(conv.id);
    return conv.id;
  }

  function deleteConversation(id: string) {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    setActiveId((prev) => (prev === id ? null : prev));
  }

  function appendMessage(id: string, message: Message) {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              messages: [...c.messages, message],
              title:
                c.messages.length === 0 && message.role === "user"
                  ? message.content.slice(0, 40)
                  : c.title,
            }
          : c,
      ),
    );
  }

  return {
    conversations,
    activeId,
    active: conversations.find((c) => c.id === activeId) ?? null,
    selectConversation: setActiveId,
    createConversation,
    deleteConversation,
    appendMessage,
  };
}
