export type ChatRole = "user" | "bot" | "assistant";

export interface ChatUIMessage {
  id?: number;
  role: ChatRole;
  text: string;
  timestamp?: string;
  meta?: string; // step, tag, etc
}
