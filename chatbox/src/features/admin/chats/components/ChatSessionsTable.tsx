import React from "react";
import {
  MessageSquare,
  Phone,
  Mail,
  UserCheck,
  UserX,
  Ticket,
  Calendar,
  Clock,
  ChevronUp,
  ChevronDown,
  Users,
} from "lucide-react";
import type { ChatSession } from "../types/chat.type";

interface Props {
  sessions: ChatSession[];
  sortConfig: {
    key: keyof ChatSession;
    direction: "asc" | "desc";
  };
  onSort: (key: keyof ChatSession) => void;
  onOpenConversation: (session: ChatSession) => void;
}

const TABLE_COLUMNS: {
  key: keyof ChatSession;
  label: string;
}[] = [
  { key: "customer_name", label: "Customer" },
  { key: "phone", label: "Contact" },
  { key: "status", label: "Status" },
  { key: "message_count", label: "Messages" },
  { key: "last_activity", label: "Last Activity" },
  { key: "is_existing_customer", label: "Type" },
  { key: "latest_ticket", label: "Ticket" },
  { key: "department", label: "Department" },
];

const ChatSessionsTable: React.FC<Props> = ({
  sessions,
  sortConfig,
  onSort,
  onOpenConversation,
}) => {
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };
const getStatusColor = (status?: string) => {
  switch (status?.toLowerCase()) {
    case "active":
      return "bg-green-100 text-green-800 border-green-200";
    case "escalated":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "resolved":
      return "bg-blue-100 text-blue-800 border-blue-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};
const getMessageBadgeColor = (count: number) => {
  if (count === 0)
    return "bg-gray-100 text-gray-600 border-gray-200";

  if (count <= 5)
    return "bg-blue-100 text-blue-700 border-blue-200";

  if (count <= 10)
    return "bg-green-100 text-green-700 border-green-200";

  return "bg-purple-100 text-purple-800 border-purple-200";
};
const getCustomerTypeColor = (isExisting: boolean) =>
  isExisting
    ? "bg-blue-100 text-blue-800 border-blue-200"
    : "bg-gray-100 text-gray-800 border-gray-200";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Users size={20} />
          Chat Sessions ({sessions.length})
        </h2>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="mx-auto text-gray-400" size={48} />
          <p className="text-gray-500 mt-4 text-lg">No chat sessions found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {TABLE_COLUMNS.map(({ key, label }) => (
                  <th
                    key={key}
                    onClick={() => onSort(key)}
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-1">
                      {label}
                      {sortConfig.key === key &&
                        (sortConfig.direction === "asc" ? (
                          <ChevronUp size={14} />
                        ) : (
                          <ChevronDown size={14} />
                        ))}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {sessions.map((session) => {
                const { date, time } = formatDateTime(
                  session.last_activity
                );

                return (
                  <tr
                    key={session.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            session.is_existing_customer
                              ? "bg-blue-100"
                              : "bg-gray-100"
                          }`}
                        >
                          {session.is_existing_customer ? (
                            <UserCheck
                              size={16}
                              className="text-blue-600"
                            />
                          ) : (
                            <UserX
                              size={16}
                              className="text-gray-600"
                            />
                          )}
                        </div>
                        <div className="font-medium text-gray-900">
                          {session.customer_name ||
                            session.phone ||
                            session.email ||
                            "Anonymous"}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 space-y-1">
                      {session.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone size={14} />
                          {session.phone}
                        </div>
                      )}
                      {session.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail size={14} />
                          {session.email}
                        </div>
                      )}
                    </td>

                 <td className="px-6 py-4">
  <span
    className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
      session.status
    )}`}
  >
    {session.status}
  </span>
</td>


                    <td className="px-6 py-4">
  <button
    onClick={() => onOpenConversation(session)}
    className="flex items-center gap-2"
  >
    <span
      className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getMessageBadgeColor(
        session.message_count
      )}`}
    >
      <MessageSquare size={14} />
      {session.message_count}
    </span>
  </button>
</td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar size={14} />
                          {date}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock size={12} />
                          {time}
                        </div>
                      </div>
                    </td>

<td className="px-6 py-4">
  <div className="flex items-center">
    <span
      className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium border ${getCustomerTypeColor(
        session.is_existing_customer
      )}`}
    >
      {session.is_existing_customer ? "Existing" : "New"}
    </span>
  </div>
</td>


                    <td className="px-6 py-4">
                      {session.latest_ticket ? (
                        <div className="flex items-center gap-2 text-blue-600">
                          <Ticket size={16} />
                          {session.latest_ticket}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">
                          No ticket
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-800 border">
                        {session.department || "Unassigned"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ChatSessionsTable;
