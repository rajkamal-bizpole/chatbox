import { useEffect, useRef, useState } from "react";
import { executeStepApi } from "../../api/chatStep.api";
import type { ChatFlow } from "../../types/chatFlow.types";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  type?: "option" | "message";
  options?: string[];
}

export const useChatPreview = (
  flow: ChatFlow,
  currentStepKey: string,
  onStepChange: (k: string) => void
) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [userData, setUserData] = useState<Record<string, any>>({});
  const [inputValue, setInputValue] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const step = flow.steps.find((s) => s.step_key === currentStepKey);

  /* ---------------- Auto scroll ---------------- */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  /* ---------------- Load step ---------------- */
  useEffect(() => {
    if (!step) return;

    setMessages([
      {
        id: "bot-init",
        text: step.message_text,
        sender: "bot",
        timestamp: new Date(),
        type:
          step.step_type === "options" || step.step_type === "api_call"
            ? "option"
            : "message",
        options: step.options ?? [],
      },
    ]);

    setInputValue("");
  }, [currentStepKey]);

  /* ---------------- Core handler ---------------- */
  const sendUserInput = async (value: string) => {
    if (!step) return;

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

    setUserData((prev) => ({
      ...prev,
      [step.step_key]: value,
    }));

    /* API step */
    if (step.step_type === "api_call" && step.api_config?.endpoint) {
      try {
        const res = await executeStepApi(step.api_config.endpoint, {
          user_input: value,
          user_data: userData,
          step_data: step,
        });

        if (res?.user_data) {
          setUserData((p) => ({ ...p, ...res.user_data }));
        }

        if (res?.user_data?.phone_valid === false) {
          setIsTyping(false);
          setMessages((prev) => [
            ...prev,
            {
              id: "bot-retry",
              text: step.message_text,
              sender: "bot",
              timestamp: new Date(),
              type: "option",
              options: step.options ?? [],
            },
          ]);
          return;
        }
      } catch (e) {
        console.error("API failed", e);
      }
    }

    let next =
      step.next_step_map[value] ||
      step.next_step_map["default"] ||
      null;

    setTimeout(() => {
      setIsTyping(false);
      if (next) onStepChange(next);
    }, 700);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    sendUserInput(inputValue.trim());
    setInputValue("");
  };

  const showInput =
    step?.step_type === "input" || step?.step_type === "api_call";

  return {
    messages,
    isTyping,
    step,
    inputValue,
    setInputValue,
    sendUserInput,
    handleSendMessage,
    showInput,
    messagesEndRef,
  };
};
