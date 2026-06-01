import { useCallback, useEffect, useRef, useState } from "react";

import type { Conversation, Message, MessageRole } from "@/lib/api";

const STORAGE_KEY = "chat-conversations";

const MESSAGE_ROLES: ReadonlySet<MessageRole> = new Set(["user", "assistant"]);

function isMessage(value: unknown): value is Message {
  if (typeof value !== "object" || value === null) return false;
  const m = value as Partial<Message>;
  return (
    typeof m.id === "string" &&
    typeof m.content === "string" &&
    typeof m.createdAt === "number" &&
    typeof m.role === "string" &&
    MESSAGE_ROLES.has(m.role as MessageRole)
  );
}

function isConversation(value: unknown): value is Conversation {
  if (typeof value !== "object" || value === null) return false;
  const c = value as Partial<Conversation>;
  return (
    typeof c.id === "string" &&
    typeof c.title === "string" &&
    typeof c.createdAt === "number" &&
    Array.isArray(c.messages) &&
    c.messages.every(isMessage)
  );
}

function load(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isConversation);
  } catch {
    return [];
  }
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>(load);
  const [activeId, setActiveId] = useState<string | null>(null);
  const hydrated = useRef(false);

  useEffect(() => {
    // Skip the initial write so a transient error during load doesn't blow away storage.
    if (!hydrated.current) {
      hydrated.current = true;
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  }, [conversations]);

  const createConversation = useCallback((title = "New conversation") => {
    const conv: Conversation = {
      id: crypto.randomUUID(),
      title,
      messages: [],
      createdAt: Date.now(),
    };
    setConversations((prev) => [conv, ...prev]);
    setActiveId(conv.id);
    return conv.id;
  }, []);

  const deleteConversation = useCallback((id: string) => {
    let snapshot: { conv: Conversation; index: number } | null = null;
    setConversations((prev) => {
      const index = prev.findIndex((c) => c.id === id);
      if (index === -1) return prev;
      const conv = prev[index];
      if (!conv) return prev;
      snapshot = { conv, index };
      return prev.filter((c) => c.id !== id);
    });
    setActiveId((prev) => (prev === id ? null : prev));
    return () => {
      if (!snapshot) return;
      const { conv, index } = snapshot;
      setConversations((prev) => {
        if (prev.some((c) => c.id === conv.id)) return prev;
        const next = prev.slice();
        next.splice(Math.min(index, next.length), 0, conv);
        return next;
      });
    };
  }, []);

  const appendMessage = useCallback((id: string, message: Message) => {
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
  }, []);

  const renameConversation = useCallback((id: string, title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: trimmed.slice(0, 80) } : c)),
    );
  }, []);

  return {
    conversations,
    activeId,
    active: conversations.find((c) => c.id === activeId) ?? null,
    selectConversation: setActiveId,
    createConversation,
    deleteConversation,
    appendMessage,
    renameConversation,
  };
}
