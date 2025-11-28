/* ==============================
   Chat Flow Types Module
   ============================== */

/* ---- Validation Rules ---- */
export interface ValidationRules {
  pattern?: string;
  error_message?: string;
  placeholder?: string;
}

/* ---- Dynamic Next Step Logic ---- */
export interface NextStepCondition {
  field: string;
  value: any;
  next_step: string;
}

export interface NextStepLogic {
  conditions: NextStepCondition[];
}

/* ---- API Config ---- */
export interface ApiConfig {
  endpoint?: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  next_step_logic?: NextStepLogic;
}

/* ---- Single Step ---- */
export interface ChatStep {
  step_key: string;
  step_type: "message" | "options" | "input" | "api_call";
  message_text: string;

  // message + options
  options: string[];

  // validations for input types
  validation_rules: ValidationRules;

  // mapping to next steps
  next_step_map: Record<string, string>;

  // API call support
  api_config: ApiConfig;

  is_initial?: boolean;
  sort_order: number;
}

/* ---- Entire Flow ---- */
export interface ChatFlow {
  id?: number;
  name: string;
  description: string;
  is_active: boolean;
  steps: ChatStep[];

  created_at?: string;
  step_count?: number;
}

/* ---- Preview Message ---- */
export interface ChatPreviewMessage {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  type?: "option" | "input" | "message";
  options?: string[];
}
