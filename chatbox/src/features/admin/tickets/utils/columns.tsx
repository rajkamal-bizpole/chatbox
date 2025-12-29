import { Eye, User, Phone, Mail } from "lucide-react";
import type { Column } from "../../../../common/types/table.types";
import type { SupportTicket } from "../types/tickets.types";

export const ticketColumns = (
  onSelect: (ticket: SupportTicket) => void,
  getPriorityBadgeClass: (p: SupportTicket["priority"]) => string,
  getStatusBadgeClass: (s: SupportTicket["status"]) => string,
  statusOptions: { value: any; icon: React.ReactNode }[],
  formatDate: (d: string) => string,
  formatDateTime: (d: string) => string,
): Column<SupportTicket>[] => [
  {
    key: "details",
    header: "Ticket Details",
    render: ticket => (
      <div>
        <div className="flex items-center gap-2">
          <span className="font-mono font-semibold">
            {ticket.ticket_number}
          </span>
          <Eye size={14} className="text-gray-400" />
        </div>

        <div className="mt-1">
          <div className="font-medium">
            {ticket.issue_type}
          </div>
          {ticket.sub_issue && (
            <div className="text-sm text-gray-500">
              {ticket.sub_issue}
            </div>
          )}
        </div>
      </div>
    ),
  },

  {
    key: "customer",
    header: "Customer",
    render: ticket => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
          <User size={16} />
        </div>

        <div>
          <div className="font-medium">
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
    ),
  },

  {
    key: "priority",
    header: "Priority",
    render: ticket => (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityBadgeClass(
          ticket.priority
        )}`}
      >
        {ticket.priority}
      </span>
    ),
  },

{
  key: "status",
  header: "Status",
  width: "140px",
  render: ticket => (
    <div className="flex">
      <span
        className={`inline-flex items-center gap-1 
        px-3 py-1 
        rounded-full 
        text-xs font-medium 
        border 
        whitespace-nowrap 
        min-w-max 
        ${getStatusBadgeClass(ticket.status)}`}
      >
        {
          statusOptions.find(
            s => s.value === ticket.status
          )?.icon
        }
        {ticket.status.replace("_", " ")}
      </span>
    </div>
  ),
},


  {
    key: "date",
    header: "Date",
    render: ticket => (
      <div className="text-sm">
        <div>{formatDate(ticket.created_at)}</div>
        <div className="text-xs text-gray-500">
          {formatDateTime(ticket.created_at).split(", ")[1]}
        </div>
      </div>
    ),
  },
];
