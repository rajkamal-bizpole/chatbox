export interface Overview {
  totalChats: number;
  resolvedChats: number;
  averageResponseTime: string;
  unresolvedChats?: number;
  resolutionRate?: number;
}

export interface Category {
  category: string;
  count: number;
}

export interface HourActivity {
  hour: string;
  chats: number;
}
