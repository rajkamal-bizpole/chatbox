import {
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import type { SupportTicket, TicketStatus } from "../types/tickets.types";
import type { StatItem } from "../../../../common/types/stats.types";

export const buildTicketStats = (
  tickets: SupportTicket[]
): StatItem[] => {
  const countByStatus = (status: TicketStatus) =>
    tickets.filter(t => t.status === status).length;

  return [
    {
      key: "open",
      label: "Open",
      value: countByStatus("open"),
      icon: <AlertCircle size={16} />,
      className: "bg-green-50 text-green-700",
    },
    {
      key: "in_progress",
      label: "In Progress",
      value: countByStatus("in_progress"),
      icon: <Clock size={16} />,
      className: "bg-yellow-50 text-yellow-700",
    },
    {
      key: "resolved",
      label: "Resolved",
      value: countByStatus("resolved"),
      icon: <CheckCircle size={16} />,
      className: "bg-blue-50 text-blue-700",
    },
    {
      key: "closed",
      label: "Closed",
      value: countByStatus("closed"),
      icon: <XCircle size={16} />,
      className: "bg-gray-100 text-gray-700",
    },
  ];
};
