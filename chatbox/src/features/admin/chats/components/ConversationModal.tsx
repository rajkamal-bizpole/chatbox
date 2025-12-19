import React from "react";
import {
  UserCheck,
  UserX,
  Calendar,
  Clock,
  X,
  MessageSquare,
  Ticket,
} from "lucide-react";
import type {
  ChatSession,
  Message,
  SupportTicket,
} from "../types/chat.type";

interface Props {
  open: boolean;
  session: ChatSession | null;
  sessionDetails: {
    messages: Message[];
    tickets: SupportTicket[];
  } | null;
  onClose: () => void;
}

const ConversationModal: React.FC<Props> = ({
  open,
  session,
  sessionDetails,
  onClose,
}) => {
  if (!open || !session) return null;

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

  const getDisplayName = () => {
    if (session.is_existing_customer) {
      return (
        session.customer_name ||
        session.phone ||
        session.email ||
        "Existing Customer"
      );
    }
    return "Anonymous User";
  };

const getStatusColor = (status?: string) => {
  switch (status?.toLowerCase()) {
    case "active":
      return "bg-green-100 text-green-800 border-green-200";
    case "escalated":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "completed":
      return "bg-blue-100 text-blue-800 border-blue-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${
                session.is_existing_customer
                  ? "bg-blue-100"
                  : "bg-gray-100"
              }`}
            >
              {session.is_existing_customer ? (
                <UserCheck size={20} className="text-blue-600" />
              ) : (
                <UserX size={20} className="text-gray-600" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold">
                Conversation with {getDisplayName()}
              </h2>
              <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                <Calendar size={14} />
                Started: {formatDateTime(session.created_at).date} at{" "}
                {formatDateTime(session.created_at).time}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                session.status
              )}`}
            >
              {session.status}
            </span>

            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col h-[calc(90vh-120px)]">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {sessionDetails ? (
              sessionDetails.messages.length > 0 ? (
                sessionDetails.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.message_type === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] p-4 rounded-2xl ${
                        message.message_type === "user"
                          ? "bg-blue-500 text-white rounded-br-none"
                          : "bg-gray-100 text-gray-900 rounded-bl-none"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <div
                        className={`flex items-center gap-2 mt-2 text-xs ${
                          message.message_type === "user"
                            ? "text-blue-100"
                            : "text-gray-500"
                        }`}
                      >
                        <Clock size={12} />
                        {new Date(message.created_at).toLocaleTimeString()}
                        <span className="px-2 py-0.5 bg-black/20 rounded">
                          {message.step}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <MessageSquare
                    size={48}
                    className="mx-auto mb-4 text-gray-300"
                  />
                  No messages found
                </div>
              )
            ) : (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e76458] mx-auto" />
                <p className="mt-2 text-gray-600">
                  Loading conversation...
                </p>
              </div>
            )}
          </div>

          {/* Tickets */}
          {sessionDetails?.tickets.length ? (
            <div className="border-t p-6 bg-gray-50">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Ticket size={18} />
                Support Tickets ({sessionDetails.tickets.length})
              </h3>

              <div className="grid gap-3 max-h-40 overflow-y-auto">
                {sessionDetails.tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="bg-yellow-50 border border-yellow-200 rounded-xl p-4"
                  >
                    <div className="font-medium text-yellow-800">
                      {ticket.ticket_number}
                    </div>
                    <div className="text-sm text-yellow-700">
                      {ticket.issue_type} - {ticket.sub_issue}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ConversationModal;
