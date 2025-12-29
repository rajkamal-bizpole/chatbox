import React, { useState } from "react";
import { useTickets } from "../hooks/useTickets";
import PageHeader from "../../../../common/components/header/PageHeader";
import { RefreshCw } from "lucide-react";

import FilterBar from "../../../../common/components/filter/FilterBar";
import Pagination from "../../../../common/components/pagination/Pagination"
import TicketDetailsPanel from "../components/TicketDetailsPanel";
import type { SupportTicket } from "../types/tickets.types";
import DataTable from "../../../../common/components/table/DataTable";
import { ticketColumns } from "../utils/columns";
import StatsBar from "../../../../common/components/stats/StatsBar";
import { buildTicketStats } from "../utils/stats";
import {
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import type {
  TicketPriority,
  TicketStatus,
} from "../types/tickets.types";

/* -------------------- Status Options -------------------- */
const statusOptions: {
  value: TicketStatus;
  icon: React.ReactNode;
}[] = [
  { value: "open", icon: <AlertCircle size={14} /> },
  { value: "in_progress", icon: <Clock size={14} /> },
  { value: "resolved", icon: <CheckCircle size={14} /> },
  { value: "closed", icon: <XCircle size={14} /> },
];

/* -------------------- Badge Helpers -------------------- */
const getPriorityBadgeClass = (priority: TicketPriority) => {
  switch (priority) {
    case "low":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "high":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "urgent":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
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

/* -------------------- Date Helpers -------------------- */
const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const formatDateTime = (date: string) =>
  new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
const SupportTickets = () => {
const {
  tickets,
  filteredTickets,
  paginatedTickets,
  pagination,
  setPagination,

  search,
  setSearch,
  status,
  setStatus,
  priority,
  setPriority,

  loading,
  error,
  reload,
  updateTicket,
} = useTickets();


  const [selectedTicket, setSelectedTicket] =
    useState<SupportTicket | null>(null);

  if (loading) return <div className="p-10">Loading...</div>;
  if (error) return <div className="p-10 text-red-500">{error}</div>;

  return (
    <div className="p-6 space-y-6">
     <PageHeader
  title="Support Tickets"
  subtitle="Manage and track customer support requests"
  actions={
    <button
      onClick={reload}
      className="flex items-center gap-2 px-4 py-2 rounded-lg
        border border-gray-300 text-sm font-medium text-gray-700
        hover:bg-gray-50 transition"
    >
      <RefreshCw size={16} />
      Refresh
    </button>
  }
/>


     <StatsBar items={buildTicketStats(tickets)} />


   <FilterBar
  filters={[
    {
      key: "search",
      type: "search",
      value: search,
      placeholder: "Search ticket number or customer...",
      onChange: setSearch,
    },
    {
      key: "status",
      type: "select",
      value: status,
      onChange: setStatus,
      options: [
        { label: "All Status", value: "all" },
        { label: "Open", value: "open" },
        { label: "In Progress", value: "in_progress" },
        { label: "Resolved", value: "resolved" },
        { label: "Closed", value: "closed" },
      ],
    },
    {
      key: "priority",
      type: "select",
      value: priority,
      onChange: setPriority,
      options: [
        { label: "All Priority", value: "all" },
        { label: "Low", value: "low" },
        { label: "Medium", value: "medium" },
        { label: "High", value: "high" },
        { label: "Urgent", value: "urgent" },
      ],
    },
  ]}
  onReset={() => {
    setSearch("");
    setStatus("all");
    setPriority("all");
  }}
/>


<div className="flex gap-6">
  {/* LEFT SIDE */}
  <div className="flex-1 flex flex-col min-h-[600px]">
  <DataTable
  data={paginatedTickets}
  columns={ticketColumns(
    setSelectedTicket,
    getPriorityBadgeClass,
    getStatusBadgeClass,
    statusOptions,
    formatDate,
    formatDateTime
  )}
  emptyMessage="No tickets found"
  className="flex-1"
  onRowClick={setSelectedTicket}
  getRowClassName={ticket =>
    ticket.id === selectedTicket?.id
      ? "bg-blue-50"
      : ""
  }
/>

  <Pagination
    page={pagination.page}
    pageSize={pagination.pageSize}
    total={filteredTickets.length}
    onChange={page =>
      setPagination(p => ({ ...p, page }))
    }
  />  
 
  </div>

  {/* RIGHT SIDE */}
  {selectedTicket && (
    <TicketDetailsPanel
      ticket={selectedTicket}
      onClose={() => setSelectedTicket(null)}
      onUpdate={updateTicket}
    />
  )}
</div>

    </div>
  );
};

export default SupportTickets;
