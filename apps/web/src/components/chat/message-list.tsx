import { Skeleton } from "@tubes-fe/ui/components/skeleton";
import { cn } from "@tubes-fe/ui/lib/utils";
import { useEffect, useRef } from "react";

import type { Message } from "@/lib/api";

type MessageListProps = {
  messages: Message[];
  isLoading: boolean;
};

export function MessageList({ messages, isLoading }: MessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto flex max-w-2xl flex-col gap-4 px-4 py-6">
        {messages.map((m, i) => (
          <div
            key={i}
            className={cn(
              "max-w-[80%] px-3 py-2 text-sm whitespace-pre-wrap",
              m.role === "user" ? "self-end bg-muted" : "self-start text-foreground",
            )}
          >
            {m.content}
          </div>
        ))}
        {isLoading && <Skeleton className="h-5 w-24 self-start" />}
        <div ref={endRef} />
      </div>
    </div>
  );
}
