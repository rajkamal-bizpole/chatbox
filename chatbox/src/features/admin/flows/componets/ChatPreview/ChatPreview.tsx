import { useChatPreview } from "./useChatPreview";

const ChatPreview = ({ flow, currentStepKey, onStepChange }: any) => {
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
    <div className="w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col border overflow-hidden">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-[#e76458] to-[#f09188] text-white p-4 flex justify-between">
        <div>
          <h3 className="font-semibold">{flow.name || "BizAssist Support"}</h3>
          <p className="text-xs text-white/80">Preview Mode</p>
        </div>
        <span className="text-xs bg-black/20 px-3 py-1 rounded-full">
          {flow.is_active ? "Live" : "Test"}
        </span>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-3">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`mb-4 ${m.sender === "user" ? "text-right" : ""}`}
          >
            <div
              className={`inline-block max-w-[80%] px-4 py-2 rounded-2xl ${
                m.sender === "user"
                  ? "bg-[#e76458] text-white"
                  : "bg-white border"
              }`}
            >
              <p className="text-sm">{m.text}</p>
            </div>

            {m.type === "option" && m.options?.length && (
              <div className="mt-2 space-y-2">
                {m.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => sendUserInput(opt)}
                    className="block w-full text-left bg-white border rounded-xl px-4 py-3 text-sm hover:border-[#e76458]"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {isTyping && <p className="text-sm text-gray-500">BizAssist typing…</p>}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      {showInput && (
        <div className="p-3 border-t">
          <div className="flex gap-2">
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Type your response…"
              className="flex-1 border rounded-xl px-4 py-2"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              className="bg-[#e76458] text-white px-5 rounded-xl disabled:bg-gray-400"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPreview;
