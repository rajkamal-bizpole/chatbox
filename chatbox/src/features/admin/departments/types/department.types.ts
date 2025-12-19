export interface DepartmentRequest {
  id: number;
  session_id: number;
  department: string;
  status: "investigating" | "resolved";
  priority?: "low" | "medium" | "high";
  message: string;
  chat_logs: any;
  created_at: string;
  updated_at?: string | null;
  assigned_to?: string;
}
