import { Button } from "@tubes-fe/ui/components/button";
import { cn } from "@tubes-fe/ui/lib/utils";
import { MessageSquare, Plus, Trash2 } from "lucide-react";
import { useMemo } from "react";

import { ModeToggle } from "@/components/mode-toggle";
import type { Conversation } from "@/lib/api";

type SidebarProps = {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
};

const DAY = 86_400_000;
const GROUP_ORDER = ["Today", "Yesterday", "Previous 7 days", "Older"] as const;
type GroupName = (typeof GROUP_ORDER)[number];

function startOfToday(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function bucket(createdAt: number, today: number): GroupName {
  if (createdAt >= today) return "Today";
  if (createdAt >= today - DAY) return "Yesterday";
  if (createdAt >= today - 7 * DAY) return "Previous 7 days";
  return "Older";
}

function lastUserMessage(c: Conversation): string {
  for (let i = c.messages.length - 1; i >= 0; i--) {
    const m = c.messages[i];
    if (m && m.role === "user") return m.content;
  }
  return "";
}

export function Sidebar({ conversations, activeId, onSelect, onCreate, onDelete }: SidebarProps) {
  const groups = useMemo(() => {
    const today = startOfToday();
    const map = new Map<GroupName, Conversation[]>();
    for (const c of conversations) {
      const key = bucket(c.createdAt, today);
      const list = map.get(key);
      if (list) list.push(c);
      else map.set(key, [c]);
    }
    return GROUP_ORDER.flatMap((name) => {
      const list = map.get(name);
      return list && list.length > 0 ? [{ name, list }] : [];
    });
  }, [conversations]);

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r bg-sidebar">
      <div className="flex h-10 items-center gap-2 border-b px-3">
        <div className="flex size-5 items-center justify-center bg-primary text-primary-foreground">
          <MessageSquare className="size-3" />
        </div>
        <span className="text-xs font-semibold tracking-wide">Chat</span>
      </div>
      <div className="p-2">
        <Button variant="outline" className="w-full" onClick={onCreate}>
          <Plus /> New chat
        </Button>
      </div>
      <nav className="flex-1 overflow-y-auto px-2 pb-2">
        {groups.length === 0 ? (
          <p className="px-2 py-4 text-[11px] text-muted-foreground">No conversations yet.</p>
        ) : (
          groups.map(({ name, list }) => (
            <section key={name} className="mb-3">
              <h3 className="px-2 pt-1 pb-1.5 text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                {name}
              </h3>
              <ul className="flex flex-col">
                {list.map((c) => (
                  <ConversationRow
                    key={c.id}
                    conversation={c}
                    active={c.id === activeId}
                    onSelect={onSelect}
                    onDelete={onDelete}
                  />
                ))}
              </ul>
            </section>
          ))
        )}
      </nav>
      <div className="flex items-center justify-between gap-2 border-t px-2 py-2">
        <span className="px-1 text-[10px] text-muted-foreground">Theme</span>
        <ModeToggle />
      </div>
    </aside>
  );
}

type ConversationRowProps = {
  conversation: Conversation;
  active: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
};

function ConversationRow({ conversation, active, onSelect, onDelete }: ConversationRowProps) {
  const preview = lastUserMessage(conversation);
  return (
    <li>
      <div
        role="button"
        tabIndex={0}
        aria-current={active ? "true" : undefined}
        onClick={() => onSelect(conversation.id)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect(conversation.id);
          }
        }}
        className={cn(
          "group flex cursor-pointer items-start justify-between gap-2 border-l-2 px-2 py-1.5 transition-colors",
          active
            ? "border-primary bg-muted text-foreground"
            : "border-transparent text-muted-foreground hover:bg-muted/50",
        )}
      >
        <div className="min-w-0 flex-1">
          <div className="truncate text-xs font-medium text-foreground">{conversation.title}</div>
          {preview ? (
            <div className="truncate text-[11px] text-muted-foreground">{preview}</div>
          ) : null}
        </div>
        <button
          type="button"
          aria-label="Delete conversation"
          className="mt-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(conversation.id);
          }}
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </li>
  );
}
