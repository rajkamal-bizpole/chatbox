import React from "react";
import { AlertCircle, Clock, CheckCircle, XCircle } from "lucide-react";
import type { SupportTicket, TicketStatus } from "../types/tickets.types";

const STATUS_CONFIG: Record<
  TicketStatus,
  { label: string; icon: React.ReactNode; className: string }
> = {
  open: {
    label: "Open",
    icon: <AlertCircle size={16} />,
    className: "bg-green-50 text-green-700",
  },
  in_progress: {
    label: "In Progress",
    icon: <Clock size={16} />,
    className: "bg-yellow-50 text-yellow-700",
  },
  resolved: {
    label: "Resolved",
    icon: <CheckCircle size={16} />,
    className: "bg-blue-50 text-blue-700",
  },
  closed: {
    label: "Closed",
    icon: <XCircle size={16} />,
    className: "bg-gray-100 text-gray-700",
  },
};

interface Props {
  tickets: SupportTicket[];
}

const TicketStats: React.FC<Props> = ({ tickets }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {(Object.keys(STATUS_CONFIG) as TicketStatus[]).map(status => {
        const count = tickets.filter(t => t.status === status).length;

        return (
          <div
            key={status}
            className="bg-white border rounded-xl p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  {STATUS_CONFIG[status].label}
                </p>
                <p className="text-2xl font-bold text-gray-900">{count}</p>
              </div>
              <div
                className={`p-2 rounded-lg ${STATUS_CONFIG[status].className}`}
              >
                {STATUS_CONFIG[status].icon}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TicketStats;
