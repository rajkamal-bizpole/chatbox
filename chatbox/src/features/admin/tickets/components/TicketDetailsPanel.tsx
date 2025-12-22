import {
  XCircle,
  User,
  Phone,
  Mail,
} from "lucide-react";
import type {
  SupportTicket,
  TicketPriority,
  TicketStatus,
} from "../types/tickets.types";

/* Mock agents – later replace with API */
const AGENTS = [
  { id: 1, name: "Unassigned" },
  { id: 2, name: "Billing Team" },
  { id: 3, name: "Tech Support" },
  { id: 4, name: "Accounts" },
];

interface Props {
  ticket: SupportTicket;
  onClose: () => void;
  onUpdate: (id: number, data: Partial<SupportTicket>) => void;

  getPriorityBadgeClass?: (priority: TicketPriority) => string;
  formatDateTime?: (date: string) => string;
}

const TicketDetailsPanel: React.FC<Props> = ({
  ticket,
  onClose,
  onUpdate,
  getPriorityBadgeClass,
  formatDateTime,
}) => {
  const formatDT =
    formatDateTime ??
    ((d: string) =>
      new Date(d).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }));

  return (
    <div className="lg:w-96 flex flex-col bg-white border rounded-xl shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">
          Ticket Details
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <XCircle size={20} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Ticket header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="font-mono font-bold text-lg text-gray-900">
              {ticket.ticket_number}
            </div>

            {getPriorityBadgeClass && (
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getPriorityBadgeClass(
                  ticket.priority
                )}`}
              >
                {ticket.priority.charAt(0).toUpperCase() +
                  ticket.priority.slice(1)}
              </span>
            )}
          </div>

          <div className="text-sm text-gray-500">
            Created {formatDT(ticket.created_at)}
          </div>
        </div>

        {/* Issue details */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">
            Issue Details
          </h4>

          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div>
              <div className="text-xs text-gray-500 font-medium">
                Main Issue
              </div>
              <div className="font-medium text-gray-900">
                {ticket.issue_type}
              </div>
            </div>

            {ticket.sub_issue && (
              <div>
                <div className="text-xs text-gray-500 font-medium">
                  Sub Issue
                </div>
                <div className="text-gray-700">
                  {ticket.sub_issue}
                </div>
              </div>
            )}

            <div>
              <div className="text-xs text-gray-500 font-medium">
                Description
              </div>
              <div className="text-gray-700 whitespace-pre-line mt-1">
                {ticket.description || "No description provided"}
              </div>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">
            Quick Actions
          </h4>

          <div className="grid grid-cols-2 gap-3">
            {/* Status */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Status
              </label>
              <select
                value={ticket.status}
                onChange={e =>
                  onUpdate(ticket.id, {
                    status: e.target.value as TicketStatus,
                  })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Priority
              </label>
              <select
                value={ticket.priority}
                onChange={e =>
                  onUpdate(ticket.id, {
                    priority: e.target.value as TicketPriority,
                  })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Assign */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Assign To
            </label>
            <select
              value={ticket.assigned_to || 1}
              onChange={e =>
                onUpdate(ticket.id, {
                  assigned_to: Number(e.target.value),
                })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              {AGENTS.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Customer info */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">
            Customer Information
          </h4>

          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <User size={20} className="text-gray-500" />
              </div>

              <div>
                <div className="font-medium text-gray-900">
                  {ticket.customer_name || "Guest User"}
                </div>
                <div className="text-sm text-gray-500">
                  Session #{ticket.session_id}
                </div>
              </div>
            </div>

            {(ticket.phone || ticket.email) && (
              <div className="space-y-2 border-t pt-3">
                {ticket.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone size={14} className="text-gray-400" />
                    <span>{ticket.phone}</span>
                  </div>
                )}

                {ticket.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail size={14} className="text-gray-400" />
                    <span>{ticket.email}</span>
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
              <span>{formatDT(ticket.created_at)}</span>
            </div>
            <div className="flex justify-between">
              <span>Last Updated:</span>
              <span>{formatDT(ticket.updated_at)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailsPanel;
