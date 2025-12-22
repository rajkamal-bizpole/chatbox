export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";

export interface SupportTicket {
  id: number;
  ticket_number: string;
  issue_type: string;
  sub_issue: string | null;
  description: string | null;
  status: TicketStatus;
  priority: TicketPriority;
  assigned_to: number | null;
  created_at: string;
  updated_at: string;
  session_id: number;
  phone?: string | null;
  customer_name?: string | null;
  email?: string | null;
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface AgentOption {
  id: number;
  name: string;
  department?: string;
}
