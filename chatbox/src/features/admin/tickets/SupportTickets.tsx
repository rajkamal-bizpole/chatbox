// components/admin/SupportTickets.tsx
import React, { useEffect, useState, useMemo } from "react";
import http from "../../../api/http";
import {
  Search,
  Filter,
  User,
  Phone,
  Mail,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye
} from "lucide-react";

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
  avatar?: string;
  department?: string;
}

interface PaginationInfo {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

const ITEMS_PER_PAGE = 10;
const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

const MOCK_AGENTS: AgentOption[] = [
  { id: 1, name: "Unassigned", department: "General" },
  { id: 2, name: "Billing Team", department: "Finance" },
  { id: 3, name: "Tech Support", department: "Technical" },
  { id: 4, name: "Accounts", department: "Finance" },
  { id: 5, name: "Sarah Chen", department: "Support" },
  { id: 6, name: "Michael Rodriguez", department: "Technical" },
];

const statusOptions: { value: TicketStatus; label: string; icon: React.ReactNode }[] = [
  { value: "open", label: "Open", icon: <AlertCircle size={14} /> },
  { value: "in_progress", label: "In Progress", icon: <Clock size={14} /> },
  { value: "resolved", label: "Resolved", icon: <CheckCircle size={14} /> },
  { value: "closed", label: "Closed", icon: <XCircle size={14} /> },
];

const priorityOptions: { value: TicketPriority; label: string; color: string }[] = [
  { value: "low", label: "Low", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { value: "medium", label: "Medium", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  { value: "high", label: "High", color: "bg-orange-100 text-orange-800 border-orange-200" },
  { value: "urgent", label: "Urgent", color: "bg-red-100 text-red-800 border-red-200" },
];

const SupportTickets: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<"all" | TicketStatus>("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | TicketPriority>("all");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  });

  // Pagination
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    pageSize: ITEMS_PER_PAGE,
    totalItems: 0,
    totalPages: 1,
  });

  // Calculate paginated tickets
  const paginatedTickets = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.pageSize;
    return filteredTickets.slice(startIndex, startIndex + pagination.pageSize);
  }, [filteredTickets, pagination.page, pagination.pageSize]);

  // Load tickets on mount
  useEffect(() => {
    fetchTickets();
  }, []);

  // Apply filters whenever tickets/filters change
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

    if (dateRange.start) {
      const startDate = new Date(dateRange.start);
      data = data.filter((t) => new Date(t.created_at) >= startDate);
    }

    if (dateRange.end) {
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999);
      data = data.filter((t) => new Date(t.created_at) <= endDate);
    }

    setFilteredTickets(data);
    setPagination(prev => ({
      ...prev,
      totalItems: data.length,
      totalPages: Math.ceil(data.length / prev.pageSize),
      page: 1, // Reset to first page when filters change
    }));
  }, [tickets, statusFilter, priorityFilter, search, dateRange]);

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
      setError("Failed to load tickets. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const refreshTickets = async () => {
    setIsRefreshing(true);
    await fetchTickets();
    setTimeout(() => setIsRefreshing(false), 500);
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
    const option = priorityOptions.find(p => p.value === priority);
    return option?.color || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getStatusBadgeClass = (status: TicketStatus) => {
    switch (status) {
      case "open":
        return "bg-green-50 text-green-700 border-green-200";
      case "in_progress":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "resolved":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "closed":
        return "bg-gray-100 text-gray-700 border-gray-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const clearFilters = () => {
    setStatusFilter("all");
    setPriorityFilter("all");
    setSearch("");
    setDateRange({ start: "", end: "" });
  };

  const getStatusCount = (status: TicketStatus) => {
    return tickets.filter(t => t.status === status).length;
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > pagination.totalPages) return;
    setPagination(prev => ({ ...prev, page }));
  };

  const handlePageSizeChange = (size: number) => {
    setPagination(prev => ({
      ...prev,
      pageSize: size,
      totalPages: Math.ceil(prev.totalItems / size),
      page: 1,
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#e76458] border-t-transparent mx-auto" />
          <p className="text-gray-500 mt-4 text-sm font-medium">Loading support tickets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-lg mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center text-red-800">
            <AlertCircle className="mr-2" size={20} />
            <span className="font-medium">Error Loading Tickets</span>
          </div>
          <p className="text-red-600 mt-2 text-sm">{error}</p>
          <div className="mt-4 flex gap-2">
            <button
              onClick={fetchTickets}
              className="px-4 py-2 bg-[#e76458] text-white rounded-lg text-sm font-medium hover:bg-[#d35448] transition-colors"
            >
              Retry
            </button>
            <button
              onClick={clearFilters}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Support Tickets</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage and track customer support requests
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={refreshTickets}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {statusOptions.map((status) => (
          <div
            key={status.value}
            className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">{status.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {getStatusCount(status.value)}
                </p>
              </div>
              <div className={`p-2 rounded-lg ${getStatusBadgeClass(status.value).split(' ')[0]}`}>
                {status.icon}
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-400">
              {((getStatusCount(status.value) / tickets.length) * 100).toFixed(1)}% of total
            </div>
          </div>
        ))}
      </div>

      {/* Filters Section */}
      <div className="bg-white border rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-500" />
            <h3 className="font-medium text-gray-900">Filters</h3>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-sm text-[#e76458] font-medium hover:text-[#d35448]"
          >
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tickets, customers, issues..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#e76458] focus:border-transparent outline-none"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={clearFilters}
              className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#e76458] focus:border-transparent outline-none"
              >
                <option value="all">All Statuses</option>
                {statusOptions.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as any)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#e76458] focus:border-transparent outline-none"
              >
                <option value="all">All Priorities</option>
                {priorityOptions.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#e76458] focus:border-transparent outline-none"
                />
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#e76458] focus:border-transparent outline-none"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6">
        {/* Tickets Table */}
        <div className="flex-1 flex flex-col">
          <div className="bg-white border rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col">
            {/* Table Header */}
            <div className="px-6 py-4 border-b bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">All Tickets</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Showing {paginatedTickets.length} of {filteredTickets.length} tickets
                    {statusFilter !== "all" && ` • Filtered by: ${statusFilter.replace("_", " ")}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={pagination.pageSize}
                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-[#e76458] focus:border-transparent outline-none"
                  >
                    {PAGE_SIZE_OPTIONS.map(size => (
                      <option key={size} value={size}>
                        Show {size}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr className="border-b">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Ticket Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedTickets.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <div className="text-gray-400">
                          <Filter className="mx-auto mb-3" size={32} />
                          <p className="font-medium">No tickets found</p>
                          <p className="text-sm mt-1">Try adjusting your filters or search terms</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedTickets.map((ticket) => (
                      <tr
                        key={ticket.id}
                        className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                          selectedTicket?.id === ticket.id ? "bg-blue-50" : ""
                        }`}
                        onClick={() => setSelectedTicket(ticket)}
                      >
                        <td className="px-6 py-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="font-mono font-semibold text-gray-900">
                                {ticket.ticket_number}
                              </div>
                              <Eye size={14} className="text-gray-400" />
                            </div>
                            <div className="mt-1">
                              <div className="font-medium text-gray-900">
                                {ticket.issue_type}
                              </div>
                              {ticket.sub_issue && (
                                <div className="text-sm text-gray-500 mt-0.5">
                                  {ticket.sub_issue}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                              <User size={16} className="text-gray-500" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {ticket.customer_name || "Guest User"}
                              </div>
                              <div className="text-sm text-gray-500 space-y-0.5">
                                {ticket.phone && (
                                  <div className="flex items-center gap-1">
                                    <Phone size={12} />
                                    {ticket.phone}
                                  </div>
                                )}
                                {ticket.email && (
                                  <div className="flex items-center gap-1">
                                    <Mail size={12} />
                                    {ticket.email}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getPriorityBadgeClass(
                              ticket.priority
                            )}`}
                          >
                            {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadgeClass(
                                ticket.status
                              )}`}
                            >
                              {statusOptions.find(s => s.value === ticket.status)?.icon}
                              <span className="ml-1.5">
                                {ticket.status.replace("_", " ")}
                              </span>
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="text-gray-900">{formatDate(ticket.created_at)}</div>
                            <div className="text-gray-500 text-xs">
                              {formatDateTime(ticket.created_at).split(', ')[1]}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredTickets.length > 0 && (
              <div className="px-6 py-4 border-t bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing{" "}
                    <span className="font-medium">
                      {(pagination.page - 1) * pagination.pageSize + 1}
                    </span>
                    {" to "}
                    <span className="font-medium">
                      {Math.min(pagination.page * pagination.pageSize, filteredTickets.length)}
                    </span>
                    {" of "}
                    <span className="font-medium">{filteredTickets.length}</span>
                    {" results"}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handlePageChange(1)}
                      disabled={pagination.page === 1}
                      className="p-2 rounded-lg border border-gray-300 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      <ChevronsLeft size={16} />
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="p-2 rounded-lg border border-gray-300 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <div className="flex items-center gap-1 mx-2">
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        let pageNum;
                        if (pagination.totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (pagination.page <= 3) {
                          pageNum = i + 1;
                        } else if (pagination.page >= pagination.totalPages - 2) {
                          pageNum = pagination.totalPages - 4 + i;
                        } else {
                          pageNum = pagination.page - 2 + i;
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-8 h-8 rounded-lg text-sm font-medium ${
                              pagination.page === pageNum
                                ? "bg-[#e76458] text-white"
                                : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      {pagination.totalPages > 5 && pagination.page < pagination.totalPages - 2 && (
                        <>
                          <span className="px-2">...</span>
                          <button
                            onClick={() => handlePageChange(pagination.totalPages)}
                            className="w-8 h-8 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium"
                          >
                            {pagination.totalPages}
                          </button>
                        </>
                      )}
                    </div>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className="p-2 rounded-lg border border-gray-300 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      <ChevronRight size={16} />
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.totalPages)}
                      disabled={pagination.page === pagination.totalPages}
                      className="p-2 rounded-lg border border-gray-300 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      <ChevronsRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Ticket Details Panel */}
        {selectedTicket && (
          <div className="lg:w-96 flex flex-col">
            <div className="bg-white border rounded-xl shadow-sm flex-1 flex flex-col">
              <div className="px-6 py-4 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Ticket Details</h3>
                  <button
                    onClick={() => setSelectedTicket(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle size={20} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-auto p-6 space-y-6">
                {/* Ticket Header */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-mono font-bold text-lg text-gray-900">
                      {selectedTicket.ticket_number}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getPriorityBadgeClass(
                          selectedTicket.priority
                        )}`}
                      >
                        {selectedTicket.priority.charAt(0).toUpperCase() + selectedTicket.priority.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    Created {formatDateTime(selectedTicket.created_at)}
                  </div>
                </div>

                {/* Issue Details */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Issue Details</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div>
                      <div className="text-xs text-gray-500 font-medium">Main Issue</div>
                      <div className="font-medium text-gray-900">{selectedTicket.issue_type}</div>
                    </div>
                    {selectedTicket.sub_issue && (
                      <div>
                        <div className="text-xs text-gray-500 font-medium">Sub Issue</div>
                        <div className="text-gray-700">{selectedTicket.sub_issue}</div>
                      </div>
                    )}
                    <div>
                      <div className="text-xs text-gray-500 font-medium">Description</div>
                      <div className="text-gray-700 whitespace-pre-line mt-1">
                        {selectedTicket.description || "No description provided"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Quick Actions</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Status
                      </label>
                      <select
                        value={selectedTicket.status}
                        onChange={(e) =>
                          handleStatusChange(selectedTicket, e.target.value as TicketStatus)
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#e76458] focus:border-transparent outline-none"
                      >
                        {statusOptions.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Priority
                      </label>
                      <select
                        value={selectedTicket.priority}
                        onChange={(e) =>
                          handlePriorityChange(selectedTicket, e.target.value as TicketPriority)
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#e76458] focus:border-transparent outline-none"
                      >
                        {priorityOptions.map((p) => (
                          <option key={p.value} value={p.value}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Assign To
                    </label>
                    <select
                      value={selectedTicket.assigned_to || 1}
                      onChange={(e) =>
                        handleAssignChange(selectedTicket, Number(e.target.value))
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#e76458] focus:border-transparent outline-none"
                    >
                      {MOCK_AGENTS.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name} {a.department ? `(${a.department})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Customer Information</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <User size={20} className="text-gray-500" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {selectedTicket.customer_name || "Guest User"}
                        </div>
                        <div className="text-sm text-gray-500">Session #{selectedTicket.session_id}</div>
                      </div>
                    </div>
                    {(selectedTicket.phone || selectedTicket.email) && (
                      <div className="space-y-2 border-t pt-3">
                        {selectedTicket.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone size={14} className="text-gray-400" />
                            <span className="text-gray-700">{selectedTicket.phone}</span>
                          </div>
                        )}
                        {selectedTicket.email && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail size={14} className="text-gray-400" />
                            <span className="text-gray-700">{selectedTicket.email}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Timestamps */}
                <div className="pt-4 border-t">
                  <div className="text-xs text-gray-500 space-y-1">
                    <div className="flex justify-between">
                      <span>Created:</span>
                      <span>{formatDateTime(selectedTicket.created_at)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Updated:</span>
                      <span>{formatDateTime(selectedTicket.updated_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportTickets;