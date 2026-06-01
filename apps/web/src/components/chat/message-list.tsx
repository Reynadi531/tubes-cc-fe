import { Button } from "@tubes-fe/ui/components/button";
import { cn } from "@tubes-fe/ui/lib/utils";
import { Check, Copy, Sparkles, User } from "lucide-react";
import { type ReactNode, memo, useEffect, useRef, useState } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";

import type { Message } from "@/lib/api";

import { TypingDots } from "./typing-dots";

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
      <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-6">
        {messages.map((m) => (
          <MessageRow key={m.id} message={m} />
        ))}
        {isLoading && <AssistantPending />}
        <div ref={endRef} />
      </div>
    </div>
  );
}

const MessageRow = memo(function MessageRow({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <div
      className={cn(
        "flex animate-in fade-in slide-in-from-bottom-1 gap-3 duration-200",
        isUser && "flex-row-reverse",
      )}
    >
      <RoleAvatar role={message.role} />
      <div className={cn("flex min-w-0 flex-1 flex-col gap-1", isUser && "items-end")}>
        {isUser ? (
          <div className="max-w-[85%] bg-muted px-3 py-2 text-sm whitespace-pre-wrap ring-1 ring-foreground/5">
            {message.content}
          </div>
        ) : (
          <AssistantBody content={message.content} />
        )}
      </div>
    </div>
  );
});

function AssistantPending() {
  return (
    <div className="flex animate-in fade-in gap-3 duration-200">
      <RoleAvatar role="assistant" />
      <TypingDots className="h-7" />
    </div>
  );
}

function RoleAvatar({ role }: { role: Message["role"] }) {
  const Icon = role === "user" ? User : Sparkles;
  return (
    <div
      className={cn(
        "flex size-6 shrink-0 items-center justify-center ring-1 ring-foreground/10",
        role === "assistant" ? "bg-primary text-primary-foreground" : "bg-background",
      )}
      aria-hidden
    >
      <Icon className="size-3.5" />
    </div>
  );
}

function AssistantBody({ content }: { content: string }) {
  return (
    <div className="group/assistant relative w-full">
      <div className="text-sm leading-relaxed">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={MARKDOWN}>
          {content}
        </ReactMarkdown>
      </div>
      <CopyButton content={content} />
    </div>
  );
}

function CopyButton({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    },
    [],
  );

  async function copy() {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success("Copied to clipboard");
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy");
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      onClick={copy}
      aria-label="Copy message"
      className="absolute top-0 right-0 opacity-0 transition-opacity group-hover/assistant:opacity-100 focus-visible:opacity-100"
    >
      {copied ? <Check /> : <Copy />}
    </Button>
  );
}

const MARKDOWN: Components = {
  p: ({ children }: { children?: ReactNode }) => (
    <p className="my-2 first:mt-0 last:mb-0">{children}</p>
  ),
  a: ({ children, href }: { children?: ReactNode; href?: string }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-primary underline-offset-2 hover:underline"
    >
      {children}
    </a>
  ),
  ul: ({ children }: { children?: ReactNode }) => (
    <ul className="my-2 ml-5 list-disc space-y-1">{children}</ul>
  ),
  ol: ({ children }: { children?: ReactNode }) => (
    <ol className="my-2 ml-5 list-decimal space-y-1">{children}</ol>
  ),
  li: ({ children }: { children?: ReactNode }) => <li className="leading-relaxed">{children}</li>,
  h1: ({ children }: { children?: ReactNode }) => (
    <h3 className="mt-4 mb-2 text-base font-semibold">{children}</h3>
  ),
  h2: ({ children }: { children?: ReactNode }) => (
    <h3 className="mt-4 mb-2 text-base font-semibold">{children}</h3>
  ),
  h3: ({ children }: { children?: ReactNode }) => (
    <h3 className="mt-3 mb-1.5 text-sm font-semibold">{children}</h3>
  ),
  blockquote: ({ children }: { children?: ReactNode }) => (
    <blockquote className="my-2 border-l-2 border-border pl-3 text-muted-foreground italic">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-3 border-border" />,
  pre: ({ children }: { children?: ReactNode }) => (
    <pre className="my-2 overflow-x-auto bg-muted p-3 font-mono text-[12px] leading-relaxed ring-1 ring-foreground/5">
      {children}
    </pre>
  ),
  code: ({ className, children }: { className?: string; children?: ReactNode }) => {
    const inline = !className?.includes("language-");
    if (inline) {
      return (
        <code className="bg-muted px-1 py-0.5 font-mono text-[12px] ring-1 ring-foreground/5">
          {children}
        </code>
      );
    }
    return <code className={className}>{children}</code>;
  },
  table: ({ children }: { children?: ReactNode }) => (
    <div className="my-2 overflow-x-auto">
      <table className="w-full border-collapse text-xs">{children}</table>
    </div>
  ),
  th: ({ children }: { children?: ReactNode }) => (
    <th className="border border-border bg-muted px-2 py-1 text-left font-medium">{children}</th>
  ),
  td: ({ children }: { children?: ReactNode }) => (
    <td className="border border-border px-2 py-1">{children}</td>
  ),
};
