// src/types/chat/message.types.ts

export interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  type?: "option" | "input" | "message";
  options?: string[];
}
