import {
  MessageSquare,
  Phone,
  Mail,
  UserCheck,
  UserX,
  Ticket,
  Calendar,
  Clock,
} from "lucide-react";
import type { Column } from "../../../../common/types/table.types";
import type { ChatSession } from "../types/chat.type";

export const chatColumns = (
  onOpenConversation: (session: ChatSession) => void
): Column<ChatSession>[] => [
  {
    key: "customer",
    header: "Customer",
    render: session => (
      <div className="flex items-center gap-3">
        <div
          className={`p-2 rounded-lg ${
            session.is_existing_customer
              ? "bg-blue-100"
              : "bg-gray-100"
          }`}
        >
          {session.is_existing_customer ? (
            <UserCheck size={16} className="text-blue-600" />
          ) : (
            <UserX size={16} className="text-gray-600" />
          )}
        </div>
        <div className="font-medium text-gray-900">
          {session.customer_name ||
            session.phone ||
            session.email ||
            "Anonymous"}
        </div>
      </div>
    ),
  },

  {
    key: "contact",
    header: "Contact",
    render: session => (
      <div className="space-y-1 text-sm text-gray-600">
        {session.phone && (
          <div className="flex items-center gap-2">
            <Phone size={14} />
            {session.phone}
          </div>
        )}
        {session.email && (
          <div className="flex items-center gap-2">
            <Mail size={14} />
            {session.email}
          </div>
        )}
      </div>
    ),
  },

  {
    key: "status",
    header: "Status",
    render: session => (
      <span className="px-3 py-1 rounded-full text-xs font-medium border
        bg-green-100 text-green-800 border-green-200">
        {session.status}
      </span>
    ),
  },

  {
    key: "messages",
    header: "Messages",
    render: session => (
      <button
        onClick={() => onOpenConversation(session)}
        className="inline-flex items-center gap-2 px-3 py-1 rounded-full
          text-xs font-medium border bg-blue-100 text-blue-700"
      >
        <MessageSquare size={14} />
        {session.message_count}
      </button>
    ),
  },

  {
    key: "last_activity",
    header: "Last Activity",
    render: session => {
      const date = new Date(session.last_activity);
      return (
        <div className="text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar size={14} />
            {date.toLocaleDateString()}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock size={12} />
            {date.toLocaleTimeString()}
          </div>
        </div>
      );
    },
  },

  {
    key: "ticket",
    header: "Ticket",
    render: session =>
      session.latest_ticket ? (
        <div className="flex items-center gap-2 text-blue-600">
          <Ticket size={16} />
          {session.latest_ticket}
        </div>
      ) : (
        <span className="text-gray-400 text-sm">No ticket</span>
      ),
  },

  {
    key: "department",
    header: "Department",
    render: session => (
      <span className="px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-800 border">
        {session.department || "Unassigned"}
      </span>
    ),
  },
];
