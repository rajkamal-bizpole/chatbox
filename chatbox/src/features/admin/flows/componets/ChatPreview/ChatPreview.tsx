import React from "react";
import { useChatPreview } from "./useChatPreview";

interface ChatPreviewProps {
  flow: any;
  currentStepKey: string;
  onStepChange: (key: string) => void;
}

const ChatPreview: React.FC<ChatPreviewProps> = ({ 
  flow, 
  currentStepKey, 
  onStepChange 
}) => {
  const {
    messages,
    isTyping,
    step,
    inputValue,
    setInputValue,
    sendUserInput,
    handleSendMessage,
    showInput,
    messagesEndRef,
  } = useChatPreview(flow, currentStepKey, onStepChange);

  return (
    <div className="w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col border border-gray-200 overflow-hidden">

      {/* HEADER (identical to original) */}
      <div className="bg-gradient-to-r from-[#e76458] to-[#f09188] text-white p-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <img
            src="chatlogo.png"
            alt="BizAssist"
            className="w-10 h-10 object-contain"
          />
          <div>
            <h3 className="font-semibold">{flow.name || "BizAssist Support"}</h3>
            <p className="text-white/80 text-xs">Preview Mode</p>
          </div>
        </div>

        <span className="text-xs bg-black/20 px-3 py-1 rounded-full">
          {flow.is_active ? "Live" : "Test"}
        </span>
      </div>

      {/* MESSAGES (identical to original) */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-3">
        {messages.map((m) => {
          const opts = m.options ?? [];

          return (
            <div
              key={m.id}
              className={`mb-4 ${m.sender === "user" ? "text-right" : ""}`}
            >
              <div
                className={`inline-block max-w-[80%] px-4 py-2 rounded-2xl whitespace-pre-line ${
                  m.sender === "user"
                    ? "bg-[#e76458] text-white rounded-br-none"
                    : "bg-white text-gray-800 border border-gray-200 rounded-bl-none"
                }`}
              >
                <p className="text-sm">{m.text}</p>
                <p
                  className={`text-xs mt-1 ${
                    m.sender === "user" ? "text-white/70" : "text-gray-500"
                  }`}
                >
                  {m.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              {/* OPTION BUTTONS (identical to original) */}
              {m.type === "option" && opts.length > 0 && (
                <div className="mt-2 space-y-2">
                  {opts.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => sendUserInput(opt)}
                      className="block w-full text-left bg-white border border-gray-300 hover:border-[#e76458] hover:bg-[#e76458]/5 rounded-xl px-4 py-3 text-sm text-gray-700 hover:text-[#e76458] transition-all"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* TYPING INDICATOR (identical to original) */}
        {isTyping && (
          <div className="flex items-center space-x-2 text-gray-500 text-sm">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: ".1s" }}
              ></div>
              <div
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: ".2s" }}
              ></div>
            </div>
            <span>BizAssist is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT BOX (identical to original) */}
      {showInput && (
        <div className="p-3 border-t bg-white">
          <div className="flex space-x-2">
            <input
              type={step?.step_key === "phone" ? "tel" : "text"}
              inputMode={step?.step_key === "phone" ? "numeric" : "text"}
              value={inputValue}
              onChange={(e) => {
                const val = e.target.value;

                if (step?.step_key === "phone") {
                  if (/^\d*$/.test(val) && val.length <= 10) {
                    setInputValue(val);
                  }
                } else {
                  setInputValue(val);
                }
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder={
                step?.validation_rules?.placeholder || "Type your response..."
              }
              className="flex-1 border rounded-xl px-4 py-3 text-sm
                border-gray-300 focus:border-[#e76458] focus:ring-[#e76458] focus:ring-1"
            />

            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              className="bg-[#e76458] text-white rounded-xl px-6 py-3 
                hover:bg-[#e76458]/90 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPreview;