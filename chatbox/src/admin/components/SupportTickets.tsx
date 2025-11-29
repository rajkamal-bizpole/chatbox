// components/admin/SupportTickets.tsx
import React, { useEffect, useState } from "react";
import http from "../../api/http";

type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
type TicketPriority = "low" | "medium" | "high" | "urgent";

interface SupportTicket {
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

interface AgentOption {
  id: number;
  name: string;
}

// 👉 If you don't have agents table yet, you can hardcode some
const MOCK_AGENTS: AgentOption[] = [
  { id: 1, name: "Unassigned" },
  { id: 2, name: "Billing Team" },
  { id: 3, name: "Tech Support" },
  { id: 4, name: "Accounts" },
];

const statusOptions: { value: TicketStatus; label: string }[] = [
  { value: "open",        label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved",    label: "Resolved" },
  { value: "closed",      label: "Closed" },
];

const priorityOptions: { value: TicketPriority; label: string }[] = [
  { value: "low",    label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high",   label: "High" },
  { value: "urgent", label: "Urgent" },
];

const SupportTickets: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<"all" | TicketStatus>("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | TicketPriority>("all");
  const [search, setSearch] = useState("");

  // Load tickets on mount
  useEffect(() => {
    fetchTickets();
  }, []);

  // Apply filters whenever tickets / filters change
  useEffect(() => {
    let data = [...tickets];

    if (statusFilter !== "all") {
      data = data.filter((t) => t.status === statusFilter);
    }

    if (priorityFilter !== "all") {
      data = data.filter((t) => t.priority === priorityFilter);
    }

    if (search.trim()) {
      const s = search.toLowerCase();
      data = data.filter(
        (t) =>
          t.ticket_number.toLowerCase().includes(s) ||
          t.issue_type.toLowerCase().includes(s) ||
          (t.sub_issue || "").toLowerCase().includes(s) ||
          (t.customer_name || "").toLowerCase().includes(s) ||
          (t.phone || "").toLowerCase().includes(s) ||
          (t.email || "").toLowerCase().includes(s)
      );
    }

    setFilteredTickets(data);
  }, [tickets, statusFilter, priorityFilter, search]);

  const fetchTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await http.get("/api/chat/admin/tickets");
      if (res.data.success) {
        setTickets(res.data.tickets || []);
      } else {
        setError("Failed to load tickets");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  const updateTicket = async (ticketId: number, updates: Partial<SupportTicket>) => {
    try {
      await http.put(`/api/chat/admin/ticket/${ticketId}`, updates);

      // Update local state
      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId
            ? { ...t, ...updates, updated_at: new Date().toISOString() }
            : t
        )
      );

      if (selectedTicket?.id === ticketId) {
        setSelectedTicket((prev) => (prev ? { ...prev, ...updates } : prev));
      }
    } catch (err) {
      console.error("Ticket update failed", err);
      alert("Failed to update ticket");
    }
  };

  const handleStatusChange = (ticket: SupportTicket, status: TicketStatus) => {
    updateTicket(ticket.id, { status });
  };

  const handlePriorityChange = (ticket: SupportTicket, priority: TicketPriority) => {
    updateTicket(ticket.id, { priority });
  };

  const handleAssignChange = (ticket: SupportTicket, assigned_to: number) => {
    updateTicket(ticket.id, { assigned_to });
  };

  const getPriorityBadgeClass = (priority: TicketPriority) => {
    switch (priority) {
      case "low":
        return "bg-gray-100 text-gray-800";
      case "medium":
        return "bg-blue-100 text-blue-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "urgent":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadgeClass = (status: TicketStatus) => {
    switch (status) {
      case "open":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "resolved":
        return "bg-blue-100 text-blue-800";
      case "closed":
        return "bg-gray-200 text-gray-700";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e76458] mx-auto" />
          <p className="text-gray-500 mt-2">Loading support tickets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-600 mb-2">{error}</p>
        <button
          onClick={fetchTickets}
          className="px-4 py-2 bg-[#e76458] text-white rounded-lg text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Header + Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Support Tickets</h2>
          <p className="text-sm text-gray-500">
            Total: {tickets.length} &nbsp;•&nbsp; Showing: {filteredTickets.length}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ticket #, issue, customer..."
            className="border px-3 py-2 rounded-lg text-sm min-w-[220px]"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="border px-3 py-2 rounded-lg text-sm"
          >
            <option value="all">All Status</option>
            {statusOptions.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as any)}
            className="border px-3 py-2 rounded-lg text-sm"
          >
            <option value="all">All Priorities</option>
            {priorityOptions.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Layout: Table + Detail */}
      <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-200px)]">
        {/* Tickets Table */}
        <div className="flex-1 border rounded-lg bg-white overflow-hidden flex flex-col">
          <div className="border-b px-4 py-2 bg-gray-50 text-sm text-gray-600">
            Tickets
          </div>

          <div className="flex-1 overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-gray-600">
                    Ticket #
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-600">
                    Issue
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-600">
                    Customer
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-600">
                    Priority
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-600">
                    Status
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-600">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-6 text-gray-500 text-sm"
                    >
                      No tickets found with current filters.
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((t) => (
                    <tr
                      key={t.id}
                      className={`border-t hover:bg-gray-50 cursor-pointer ${
                        selectedTicket?.id === t.id ? "bg-orange-50" : ""
                      }`}
                      onClick={() => setSelectedTicket(t)}
                    >
                      <td className="px-3 py-2 font-mono text-xs text-gray-800">
                        {t.ticket_number}
                      </td>
                      <td className="px-3 py-2">
                        <div className="font-medium text-gray-800">
                          {t.issue_type}
                        </div>
                        {t.sub_issue && (
                          <div className="text-gray-500 text-xs">
                            {t.sub_issue}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2 text-xs">
                        <div className="font-medium">
                          {t.customer_name || "Guest"}
                        </div>
                        {t.phone && (
                          <div className="text-gray-500">{t.phone}</div>
                        )}
                        {t.email && (
                          <div className="text-gray-500">{t.email}</div>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadgeClass(
                            t.priority
                          )}`}
                        >
                          {(t.priority || "medium").toUpperCase()}

                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
                            t.status
                          )}`}
                        >
                       {(t.status || "open").replace("_", " ")}

                        </span>
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-500">
                        {new Date(t.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Panel */}
        <div className="w-full lg:w-80 border rounded-lg bg-white flex flex-col">
          <div className="border-b px-4 py-2 bg-gray-50 text-sm font-medium">
            Ticket Details
          </div>

          {selectedTicket ? (
            <div className="p-4 space-y-4 text-sm overflow-auto">
              <div>
                <div className="text-xs text-gray-500">Ticket Number</div>
                <div className="font-mono text-sm font-semibold">
                  {selectedTicket.ticket_number}
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-500">Issue</div>
                <div className="font-medium">{selectedTicket.issue_type}</div>
                {selectedTicket.sub_issue && (
                  <div className="text-gray-600 text-xs">
                    {selectedTicket.sub_issue}
                  </div>
                )}
              </div>

              <div>
                <div className="text-xs text-gray-500">Description</div>
                <div className="text-gray-700 whitespace-pre-line">
                  {selectedTicket.description || "—"}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-xs text-gray-500">Status</label>
                  <select
                    value={selectedTicket.status}
                    onChange={(e) =>
                      handleStatusChange(
                        selectedTicket,
                        e.target.value as TicketStatus
                      )
                    }
                    className="mt-1 w-full border rounded-lg px-2 py-1.5 text-sm"
                  >
                    {statusOptions.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-500">Priority</label>
                  <select
                    value={selectedTicket.priority}
                    onChange={(e) =>
                      handlePriorityChange(
                        selectedTicket,
                        e.target.value as TicketPriority
                      )
                    }
                    className="mt-1 w-full border rounded-lg px-2 py-1.5 text-sm"
                  >
                    {priorityOptions.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-500">Assigned To</label>
                  <select
                    value={selectedTicket.assigned_to || 1}
                    onChange={(e) =>
                      handleAssignChange(
                        selectedTicket,
                        Number(e.target.value)
                      )
                    }
                    className="mt-1 w-full border rounded-lg px-2 py-1.5 text-sm"
                  >
                    {MOCK_AGENTS.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-500">Customer</div>
                <div className="text-gray-800">
                  {selectedTicket.customer_name || "Guest"}
                </div>
                {selectedTicket.phone && (
                  <div className="text-gray-600 text-xs">
                    📞 {selectedTicket.phone}
                  </div>
                )}
                {selectedTicket.email && (
                  <div className="text-gray-600 text-xs">
                    ✉️ {selectedTicket.email}
                  </div>
                )}
              </div>

              <div>
                <div className="text-xs text-gray-500">Session ID</div>
                <div className="text-gray-700 text-xs">
                  #{selectedTicket.session_id}
                </div>
                {/* You can link to Chat Logs / Session Details page here */}
              </div>

              <div className="text-xs text-gray-400">
                Created: {new Date(selectedTicket.created_at).toLocaleString()}
                <br />
                Updated: {new Date(selectedTicket.updated_at).toLocaleString()}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              Select a ticket to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportTickets;
