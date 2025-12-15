// types/chat.ts
export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'option' | 'input' | 'message';
  options?: string[];
}

export type ChatStep = 'welcome' | 'userType' | 'phone' | 'products' | 'otherIssues';

