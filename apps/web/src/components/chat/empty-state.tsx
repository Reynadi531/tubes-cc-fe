import { Card } from "@tubes-fe/ui/components/card";
import { ArrowUpRight, Sparkles } from "lucide-react";

type Suggestion = {
  title: string;
  subtitle: string;
  prompt: string;
};

const SUGGESTIONS: readonly Suggestion[] = [
  {
    title: "Explain Cloudflare Workers",
    subtitle: "How they differ from traditional servers",
    prompt: "Explain Cloudflare Workers and how they differ from traditional servers.",
  },
  {
    title: "Compare Postgres vs SQLite",
    subtitle: "When to choose each for a small SaaS",
    prompt: "Compare Postgres and SQLite for a small SaaS. When should I pick each?",
  },
  {
    title: "Outline a CI/CD pipeline",
    subtitle: "For a Vite + Bun monorepo on GitHub Actions",
    prompt: "Outline a CI/CD pipeline for a Vite + Bun monorepo using GitHub Actions.",
  },
  {
    title: "Write a Dockerfile",
    subtitle: "Multi-stage build for a Vite SPA",
    prompt: "Write a multi-stage Dockerfile for a Vite SPA served by nginx.",
  },
];

type EmptyStateProps = {
  onSelect: (prompt: string) => void;
};

export function EmptyState({ onSelect }: EmptyStateProps) {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-10">
      <div className="flex w-full max-w-2xl flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex size-10 items-center justify-center bg-primary text-primary-foreground">
            <Sparkles className="size-5" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">How can I help?</h1>
          <p className="text-xs text-muted-foreground">
            Pick a starter or type your own question below.
          </p>
        </div>
        <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s.title}
              type="button"
              onClick={() => onSelect(s.prompt)}
              className="group/suggestion text-left"
            >
              <Card className="h-full gap-1 py-3 transition-colors hover:bg-muted">
                <div className="flex items-start justify-between gap-2 px-3">
                  <span className="text-xs font-medium">{s.title}</span>
                  <ArrowUpRight className="mt-0.5 size-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover/suggestion:opacity-100" />
                </div>
                <span className="px-3 text-[11px] text-muted-foreground">{s.subtitle}</span>
              </Card>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
