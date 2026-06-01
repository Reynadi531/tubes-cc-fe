import { cn } from "@tubes-fe/ui/lib/utils";

type TypingDotsProps = {
  className?: string;
};

export function TypingDots({ className }: TypingDotsProps) {
  return (
    <div
      role="status"
      aria-label="Assistant is typing"
      className={cn("flex items-center gap-1 py-2", className)}
    >
      <span className="size-1.5 animate-bounce bg-muted-foreground [animation-delay:-0.3s]" />
      <span className="size-1.5 animate-bounce bg-muted-foreground [animation-delay:-0.15s]" />
      <span className="size-1.5 animate-bounce bg-muted-foreground" />
    </div>
  );
}
