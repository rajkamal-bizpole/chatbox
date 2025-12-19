import React from "react";
import {
  MessageSquare,
  XCircle,
  User,
  Bot,
} from "lucide-react";

interface Props {
  chat: any[] | null;
  onClose: () => void;
}

const DepartmentChatModal: React.FC<Props> = ({ chat, onClose }) => {
  if (!chat) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#e76458] to-[#d4594e] px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <MessageSquare className="text-white" size={24} />
            <div>
              <h3 className="text-xl font-semibold text-white">
                Chat Conversation
              </h3>
              <p className="text-white/80 text-sm">
                {chat.length} messages
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <XCircle className="text-white" size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="h-[65vh] flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
            {Array.isArray(chat) && chat.length > 0 ? (
              <div className="space-y-4">
                {chat.map((msg, i) => {
                  const isUser =
                    msg.sender === "user" ||
                    msg.message_type === "user";

                  const text = msg.text || msg.content || "";
                  const time = msg.timestamp
                    ? new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "";

                  return (
                    <div
                      key={i}
                      className={`flex ${
                        isUser ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] ${
                          isUser ? "ml-auto" : "mr-auto"
                        }`}
                      >
                        {/* Meta */}
                        <div className="flex items-center gap-2 mb-1">
                          {isUser ? (
                            <User size={14} className="text-gray-500" />
                          ) : (
                            <Bot
                              size={14}
                              className="text-[#e76458]"
                            />
                          )}
                          <span className="text-xs font-medium text-gray-600">
                            {isUser ? "User" : "Assistant"}
                          </span>
                          <span className="text-xs text-gray-400">
                            {time}
                          </span>
                        </div>

                        {/* Bubble */}
                        <div
                          className={`p-4 rounded-2xl ${
                            isUser
                              ? "bg-gradient-to-r from-[#e76458] to-[#d4594e] text-white rounded-br-none"
                              : "bg-white border border-gray-200 rounded-bl-none shadow-sm"
                          }`}
                        >
                          <p className="leading-relaxed whitespace-pre-line">
                            {text}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center">
                <MessageSquare className="text-gray-300" size={48} />
                <p className="text-gray-500 mt-4">
                  No chat messages found
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-white border-t">
            <button
              onClick={onClose}
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Close Conversation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentChatModal;
