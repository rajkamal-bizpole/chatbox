// src/types/chat/chat-flow.types.ts

export interface ChatStep {
  step_key: string;
  step_type: "message" | "options" | "input" | "api_call";
  message_text: string;
  options: string[];
  validation_rules: any;
  next_step_map: Record<string, string>;
  api_config: any;
  is_initial?: boolean;
  sort_order: number;
}

export interface ChatFlow {
  id?: number;
  name: string;
  description: string;
  is_active: boolean;
  steps: ChatStep[];
  created_at?: string;
  step_count?: number;
}
