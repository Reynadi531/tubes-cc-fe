import { Button } from "@tubes-fe/ui/components/button";
import { ArrowUp } from "lucide-react";
import { useRef, useState } from "react";

type ChatInputProps = {
  isLoading: boolean;
  onSend: (text: string) => void;
};

export function ChatInput({ isLoading, onSend }: ChatInputProps) {
  const [text, setText] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  function submit() {
    const value = text.trim();
    if (!value || isLoading) return;
    onSend(value);
    setText("");
    if (ref.current) ref.current.style.height = "auto";
  }

  return (
    <div className="border-t p-4">
      <div className="mx-auto flex max-w-2xl items-end gap-2">
        <textarea
          ref={ref}
          rows={1}
          value={text}
          placeholder="Send a message..."
          disabled={isLoading}
          className="max-h-40 flex-1 resize-none border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring disabled:opacity-50"
          onChange={(e) => {
            setText(e.target.value);
            e.target.style.height = "auto";
            e.target.style.height = `${e.target.scrollHeight}px`;
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
        />
        <Button size="icon" disabled={isLoading || !text.trim()} onClick={submit}>
          <ArrowUp />
        </Button>
      </div>
    </div>
  );
}
