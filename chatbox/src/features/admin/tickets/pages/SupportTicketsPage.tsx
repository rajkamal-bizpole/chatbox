import React, { useState } from "react";
import { useTickets } from "../hooks/useTickets";
import TicketHeader from "../components/TicketHeader";
import TicketStats from "../components/TicketStats";
import TicketFilters from "../components/TicketFilters";
import TicketsTable from "../components/TicketsTable";
import TicketDetailsPanel from "../components/TicketDetailsPanel";
import type { SupportTicket } from "../types/tickets.types";
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
    setFilteredTickets,
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
      <TicketHeader onRefresh={reload} />

      <TicketStats tickets={tickets} />

      <TicketFilters
        tickets={tickets}
        onFilter={setFilteredTickets}
      />

      <div className="flex gap-6">
   <TicketsTable
  tickets={paginatedTickets}
  pagination={pagination}
  total={filteredTickets.length}
  selectedId={selectedTicket?.id}
  onSelect={setSelectedTicket}
  setPagination={setPagination}
  getPriorityBadgeClass={getPriorityBadgeClass}
  getStatusBadgeClass={getStatusBadgeClass}
  statusOptions={statusOptions}
  formatDate={formatDate}
  formatDateTime={formatDateTime}
/>


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
