export interface ChatSession {
  id: number;
  session_token: string;
  phone: string;
  status: string;
  username: string;
  email: string;
  message_count: number;
  last_activity: string;
  latest_ticket: string;
  created_at: string;
  customer_name: string;
  is_existing_customer: boolean;
   department: string;
}

export interface Message {
  id: number;
  content: string;
  message_type: 'user' | 'bot';
  created_at: string;
  step: string;
}

export interface SupportTicket {
  id: number;
  ticket_number: string;
  priority: string;
  issue_type: string;
  sub_issue: string;
  status: string;
}