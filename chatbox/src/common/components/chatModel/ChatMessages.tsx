import { User, Bot, Clock } from "lucide-react";
import type { ChatUIMessage } from "../../types/chat-ui.types";

interface Props {
  messages: ChatUIMessage[];
}

const ChatMessages: React.FC<Props> = ({ messages }) => {
  return (
   <div className="h-full overflow-y-auto px-6 py-4 space-y-6 bg-gray-50">

      {messages.map((msg, i) => {
        const isUser = msg.role === "user";

        return (
          <div
            key={i}
            className={`flex items-end gap-3 ${
              isUser ? "justify-end" : "justify-start"
            }`}
          >
            {/* Avatar (Bot only) */}
            {!isUser && (
              <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center">
                <Bot size={16} className="text-gray-600" />
              </div>
            )}

            <div className="max-w-[75%]">
              {/* Meta */}
              <div
                className={`flex items-center gap-2 mb-1 text-xs ${
                  isUser ? "justify-end text-gray-400" : "text-gray-500"
                }`}
              >
                {isUser ? (
                  <>
                    <span className="font-medium text-gray-600">
                      Customer
                    </span>
                    <User size={14} />
                  </>
                ) : (
                  <>
                    <span className="font-medium text-gray-600">
                      Assistant
                    </span>
                  </>
                )}

                {msg.timestamp && (
                  <>
                    <Clock size={12} />
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </>
                )}
              </div>

              {/* Bubble */}
              <div
                className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  isUser
                    ? "bg-[#e76458] text-white rounded-br-none"
                    : "bg-white border border-gray-200 rounded-bl-none"
                }`}
              >
                {msg.text}
              </div>
            </div>

            {/* Avatar (User only) */}
            {isUser && (
              <div className="w-9 h-9 rounded-full bg-[#e76458]/10 flex items-center justify-center">
                <User size={16} className="text-[#e76458]" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ChatMessages;
