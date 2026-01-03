import { createPortal } from "react-dom";
import type { ChatUIMessage } from "../../types/chat-ui.types";
import ChatMessages from "./ChatMessages";

interface ChatModalBaseProps {
  open: boolean;
  title: string;
  subtitle?: string;
  headerRight?: React.ReactNode;
  messages: ChatUIMessage[] | null;
  footer?: React.ReactNode;
  onClose: () => void;
}

// ✅ modal root (must exist in index.html)
const modalRoot = document.getElementById("modal-root")!;

const ChatModalBase: React.FC<ChatModalBaseProps> = ({
  open,
  title,
  subtitle,
  headerRight,
  messages,
  footer,
  onClose,
}) => {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/50 z-[9999]">
      {/* Center wrapper */}
      <div className="flex justify-center pt-10 h-full">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl h-[calc(100vh-6rem)] overflow-hidden flex flex-col">
          
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b bg-white">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {title}
              </h2>
              {subtitle && (
                <p className="text-sm text-gray-500">
                  {subtitle}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              {headerRight}
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-hidden bg-gray-50">
            {messages ? (
              <ChatMessages messages={messages} />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">
                Loading conversation...
              </div>
            )}
          </div>

          {/* Footer */}
          {footer && (
            <div className="border-t px-6 py-4 bg-white">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>,
    modalRoot
  );
};

export default ChatModalBase;
