export type Message = {
  role: "user" | "assistant";
  content: string;
};

export type Conversation = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
};

const BASE_URL = import.meta.env.VITE_SERVER_URL ?? "";

export async function sendMessage(query: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) throw new Error(`Request failed (${res.status})`);

  const data = await res.json();
  return data.response ?? "";
}
