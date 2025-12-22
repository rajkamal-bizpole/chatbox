import { useEffect, useMemo, useState } from "react";
import { fetchTicketsApi, updateTicketApi } from "../api/tickets.api";
import type { PaginationInfo, SupportTicket } from "../types/tickets.types";

const DEFAULT_PAGE_SIZE = 10;

export const useTickets = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    totalItems: 0,
    totalPages: 1,
  });

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const data = await fetchTicketsApi();
      setTickets(data);
      setFilteredTickets(data);
      setPagination(p => ({
        ...p,
        totalItems: data.length,
        totalPages: Math.ceil(data.length / p.pageSize),
      }));
    } catch {
      setError("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  const updateTicket = async (
    id: number,
    updates: Partial<SupportTicket>
  ) => {
    await updateTicketApi(id, updates);
    setTickets(prev =>
      prev.map(t => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const paginatedTickets = useMemo(() => {
    const start = (pagination.page - 1) * pagination.pageSize;
    return filteredTickets.slice(start, start + pagination.pageSize);
  }, [filteredTickets, pagination]);

  return {
    tickets,
    filteredTickets,
    paginatedTickets,
    pagination,
    setPagination,
    setFilteredTickets,
    loading,
    error,
    reload: loadTickets,
    updateTicket,
  };
};
