import { Button } from "@tubes-fe/ui/components/button";
import { cn } from "@tubes-fe/ui/lib/utils";
import { Plus, Trash2 } from "lucide-react";

import type { Conversation } from "@/lib/api";
import { ModeToggle } from "@/components/mode-toggle";

type SidebarProps = {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
};

export function Sidebar({ conversations, activeId, onSelect, onCreate, onDelete }: SidebarProps) {
  return (
    <aside className="flex w-64 shrink-0 flex-col border-r bg-sidebar">
      <div className="flex items-center justify-between gap-2 p-2">
        <Button variant="outline" className="flex-1" onClick={onCreate}>
          <Plus /> New chat
        </Button>
        <ModeToggle />
      </div>
      <nav className="flex-1 overflow-y-auto p-2">
        {conversations.map((c) => (
          <div
            key={c.id}
            className={cn(
              "group flex cursor-pointer items-center justify-between gap-2 px-2 py-1.5 text-xs",
              c.id === activeId
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted/50",
            )}
            onClick={() => onSelect(c.id)}
          >
            <span className="truncate">{c.title}</span>
            <button
              className="opacity-0 transition-opacity group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(c.id);
              }}
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        ))}
      </nav>
    </aside>
  );
}
