import { useEffect, useMemo, useState } from "react";
import { fetchTicketsApi, updateTicketApi } from "../api/tickets.api";
import type {
  PaginationInfo,
  SupportTicket,
  TicketPriority,
  TicketStatus,
} from "../types/tickets.types";

const DEFAULT_PAGE_SIZE = 10;

export const useTickets = () => {
  /* -------------------- Data -------------------- */
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* -------------------- Filters -------------------- */
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | TicketStatus>("all");
  const [priority, setPriority] = useState<"all" | TicketPriority>("all");

  /* -------------------- Pagination -------------------- */
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    totalItems: 0,
    totalPages: 1,
  });

  /* -------------------- Load Tickets -------------------- */
  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const data = await fetchTicketsApi();
      setTickets(data);
    } catch {
      setError("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- Update Ticket -------------------- */
  const updateTicket = async (
    id: number,
    updates: Partial<SupportTicket>
  ) => {
    await updateTicketApi(id, updates);
    setTickets(prev =>
      prev.map(t => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  /* -------------------- Filtering -------------------- */
const filteredTickets = useMemo(() => {
  const normalizedSearch = search.trim().toLowerCase();

  return tickets.filter(ticket => {
    const matchesSearch =
      normalizedSearch === "" ||
      [
        ticket.ticket_number,
        ticket.customer_name,
        ticket.phone,
        ticket.email,
        ticket.issue_type,
        ticket.sub_issue,
      ]
        .filter(Boolean)
        .some(field =>
          field!.toLowerCase().includes(normalizedSearch)
        );

    const matchesStatus =
      status === "all" || ticket.status === status;

    const matchesPriority =
      priority === "all" || ticket.priority === priority;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesPriority
    );
  });
}, [tickets, search, status, priority]);


  /* -------------------- Reset page on filter change -------------------- */
  useEffect(() => {
    setPagination(p => ({ ...p, page: 1 }));
  }, [search, status, priority]);

  /* -------------------- Pagination Slice -------------------- */
  const paginatedTickets = useMemo(() => {
    const start = (pagination.page - 1) * pagination.pageSize;
    return filteredTickets.slice(
      start,
      start + pagination.pageSize
    );
  }, [filteredTickets, pagination]);

  /* -------------------- Update totals -------------------- */
  useEffect(() => {
    setPagination(p => ({
      ...p,
      totalItems: filteredTickets.length,
      totalPages: Math.ceil(
        filteredTickets.length / p.pageSize
      ),
    }));
  }, [filteredTickets]);

  return {
    /* data */
    tickets,
    filteredTickets,
    paginatedTickets,

    /* pagination */
    pagination,
    setPagination,

    /* filters */
    search,
    setSearch,
    status,
    setStatus,
    priority,
    setPriority,

    /* state */
    loading,
    error,
    reload: loadTickets,
    updateTicket,
  };
};
