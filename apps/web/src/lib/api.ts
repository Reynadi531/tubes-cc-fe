import { getRuntimeAppConfig } from "@/lib/runtime-config";

const runtimeAppConfig = getRuntimeAppConfig();
const baseUrl = runtimeAppConfig?.VITE_SERVER_URL ?? import.meta.env.VITE_SERVER_URL ?? "";

export type MessageRole = "user" | "assistant";

export type Message = {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: number;
};

export type Conversation = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
};



function buildAskUrl() {
  return `${baseUrl}/ask`;
}
export class AbortError extends Error {
  constructor() {
    super("Request aborted");
    this.name = "AbortError";
  }
}

export async function sendMessage(query: string, signal?: AbortSignal): Promise<string> {
  let res: Response;
  try {
    res = await fetch(buildAskUrl(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
      signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw new AbortError();
    throw err;
  }

  if (!res.ok) throw new Error(`Request failed (${res.status})`);

  const data = (await res.json()) as { response?: string };
  return data.response ?? "";
}

export function newMessage(role: MessageRole, content: string): Message {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    createdAt: Date.now(),
  };
}
