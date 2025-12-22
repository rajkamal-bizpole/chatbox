import http from "../../../../api/http";
import type { SupportTicket } from "../types/tickets.types";

export const fetchTicketsApi = async (): Promise<SupportTicket[]> => {
  const res = await http.get("/api/chat/admin/tickets");
  if (!res.data.success) throw new Error("Failed to load tickets");
  return res.data.tickets || [];
};

export const updateTicketApi = async (
  ticketId: number,
  updates: Partial<SupportTicket>
) => {
  await http.put(`/api/chat/admin/ticket/${ticketId}`, updates);
};
