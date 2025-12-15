// src/types/chat/session.types.ts

export interface ChatSession {
  session_token: string;
  session_id: number;
}

export interface UserData {
  [key: string]: any;
}
