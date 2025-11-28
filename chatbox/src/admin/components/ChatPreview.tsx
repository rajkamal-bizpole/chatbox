import React, { useEffect, useState, useRef } from "react";
import http from "../../api/http";
import type { ChatFlow, ChatStep } from "./types";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  type?: "option" | "input" | "message";
  options?: string[];
}

const ChatPreview: React.FC<{
  flow: ChatFlow;
  currentStepKey: string;
  onStepChange: (key: string) => void;
}> = ({ flow, currentStepKey, onStepChange }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [userData, setUserData] = useState<Record<string, any>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  /* Auto scroll */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
  if (shouldAutoScroll) {
    scrollToBottom();
  }
}, [messages, shouldAutoScroll]);


  /* Load step when key changes */
  useEffect(() => {
    const step = flow.steps?.find((s) => s.step_key === currentStepKey);
    if (!step) return;

    setMessages([
      {
        id: "1",
        text: step.message_text,
        sender: "bot",
        timestamp: new Date(),
        type: step.step_type === "options" ? "option" : "message",
        options: Array.isArray(step.options) ? step.options : [],
      },
    ]);
  }, [flow, currentStepKey]);

  /* Handle clicking an option or sending user input */
  const handleOptionClick = async (value: string) => {
    const step = flow.steps?.find((s) => s.step_key === currentStepKey);
    if (!step) return;

    // Add user message
  setShouldAutoScroll(false); // ⛔ stop auto scroll for user messages

setMessages((prev) => [
  ...prev,
  {
    id: Date.now().toString(),
    text: value,
    sender: "user",
    timestamp: new Date(),
  },
]);


    setIsTyping(true);

    // Save user input
    setUserData((prev) => ({
      ...prev,
      [step.step_key]: value,
    }));

    // Handle API call
    if (step.step_type === "api_call" && step.api_config?.endpoint) {
      try {
        const response = await http.post(step.api_config.endpoint, {
          user_input: value,
          user_data: userData,
          step_data: step,
        });

        if (response.data?.user_data) {
          setUserData((prev) => ({ ...prev, ...response.data.user_data }));
        }

        // If invalid number → block next step
        if (response.data?.user_data?.phone_valid === false) {
          setIsTyping(false);

          setShouldAutoScroll(true); // ✅ scroll for bot replies

setMessages((prev) => [
  ...prev,
  {
    id: Date.now().toString(),
    text: step.message_text,
    sender: "bot",
    timestamp: new Date(),
    type: step.step_type === "options" ? "option" : "message",
    options: step.options
  }
]);


          return;
        }
      } catch (err) {
        console.error("API FAILED:", err);
      }
    }

    // Determine next step
    let next =
      step.next_step_map[value] ||
      step.next_step_map["default"] ||
      null;

    // Dynamic logic
    if (step.api_config?.next_step_logic) {
      const logic = step.api_config.next_step_logic;

      for (const cond of logic.conditions) {
        if (userData[cond.field] === cond.value) {
          next = cond.next_step;
        }
      }
    }

    setTimeout(() => {
      setIsTyping(false);
      if (next) onStepChange(next);
    }, 800);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    handleOptionClick(inputValue.trim());
    setInputValue("");
  };

  const step = flow.steps?.find((s) => s.step_key === currentStepKey);

  const showInput =
    step?.step_type === "input" || step?.step_type === "api_call";

  return (
    <div className="w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col border border-gray-200 overflow-hidden">

      {/* HEADER (identical to ChatBox) */}
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

      {/* MESSAGES */}
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

              {/* OPTION BUTTONS */}
              {m.type === "option" && opts.length > 0 && (
                <div className="mt-2 space-y-2">
                  {opts.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handleOptionClick(opt)}
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

      {/* INPUT BOX (same as ChatBox) */}
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
