import { Button } from "@tubes-fe/ui/components/button";
import { ArrowUp, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type ChatInputProps = {
  isLoading: boolean;
  onSend: (text: string) => void;
  onStop: () => void;
};

export function ChatInput({ isLoading, onSend, onStop }: ChatInputProps) {
  const [text, setText] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  useEffect(() => {
    if (!isLoading) ref.current?.focus();
  }, [isLoading]);

  function resize(node: HTMLTextAreaElement) {
    node.style.height = "auto";
    node.style.height = `${node.scrollHeight}px`;
  }

  function submit() {
    const value = text.trim();
    if (!value || isLoading) return;
    onSend(value);
    setText("");
    if (ref.current) ref.current.style.height = "auto";
  }

  return (
    <div className="border-t bg-background px-4 pt-3 pb-2">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-1">
        <div className="flex items-end gap-2">
          <textarea
            ref={ref}
            rows={1}
            name="message"
            aria-label="Message"
            value={text}
            placeholder="Send a message..."
            disabled={isLoading}
            className="max-h-40 flex-1 resize-none border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring disabled:opacity-50"
            onChange={(e) => {
              setText(e.target.value);
              resize(e.currentTarget);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
          />
          {isLoading ? (
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={onStop}
              aria-label="Stop generating"
            >
              <Square />
            </Button>
          ) : (
            <Button
              type="button"
              size="icon"
              disabled={!text.trim()}
              onClick={submit}
              aria-label="Send message"
            >
              <ArrowUp />
            </Button>
          )}
        </div>
        <p className="text-right text-[10px] text-muted-foreground">
          <kbd className="font-mono">↵</kbd> send
          <span className="px-1">·</span>
          <kbd className="font-mono">⇧↵</kbd> newline
        </p>
      </div>
    </div>
  );
}
