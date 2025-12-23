import { useEffect, useRef, useState, useCallback } from "react";
import { executeStepApi } from "../../api/chatStep.api";
import type { ChatFlow, ChatStep } from "../../types/chatFlow.types";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  type?: "option" | "input" | "message";
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
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const isProcessingRef = useRef(false);

  /* ---------------- Auto scroll ---------------- */
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (shouldAutoScroll) {
      scrollToBottom();
    }
  }, [messages, shouldAutoScroll, scrollToBottom]);

  /* ---------------- Load step ---------------- */
  useEffect(() => {
    isProcessingRef.current = false;
    const step = flow.steps?.find((s: ChatStep) => s.step_key === currentStepKey);
    if (!step) return;

    const botMessage: Message = {
      id: "bot-init-" + Date.now(),
      text: step.message_text,
      sender: "bot",
      timestamp: new Date(),
      type: step.step_type === "options" || step.step_type === "api_call" 
        ? "option" 
        : "message",
      options: Array.isArray(step.options) ? step.options : [],
    };

    setMessages([botMessage]);
    setInputValue("");
    setIsTyping(false);
    setShouldAutoScroll(true);
  }, [flow, currentStepKey]);

  /* ---------------- Core handler ---------------- */
  const sendUserInput = async (value: string) => {
    // FIX: This should check if IS processing, not if NOT processing
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    
    const step = flow.steps?.find((s: ChatStep) => s.step_key === currentStepKey);
    if (!step) {
      isProcessingRef.current = false;
      return;
    }

    // Add user message
    setShouldAutoScroll(false);
    setMessages((prev) => [
      ...prev,
      {
        id: "user-" + Date.now(),
        text: value,
        sender: "user",
        timestamp: new Date(),
      },
    ]);

    setIsTyping(true);

    // Update user data
    const updatedUserData = { ...userData, [step.step_key]: value };
    setUserData(updatedUserData);

    /* API step */
    if (step.step_type === "api_call" && step.api_config?.endpoint) {
      try {
        const res = await executeStepApi(step.api_config.endpoint, {
          user_input: value,
          user_data: updatedUserData,
          step_data: step,
        });

        if (res?.user_data) {
          const newUserData = { ...updatedUserData, ...res.user_data };
          setUserData(newUserData);
        }

        // If invalid phone number
        if (res?.user_data?.phone_valid === false) {
          setIsTyping(false);
          isProcessingRef.current = false;
          
          setShouldAutoScroll(true);
          setMessages((prev) => [
            ...prev,
            {
              id: "error-" + Date.now(),
              text: step.message_text,
              sender: "bot",
              timestamp: new Date(),
              type: step.step_type === "options" ? "option" : "message",
              options: step.options ?? []
            }
          ]);
          return;
        }
      } catch (e) {
        console.error("API failed", e);
        // Show error message
        setMessages(prev => [...prev, {
          id: `error-${Date.now()}`,
          text: "Sorry, something went wrong. Please try again.",
          sender: "bot",
          timestamp: new Date(),
          type: "message",
        }]);
        setIsTyping(false);
        isProcessingRef.current = false;
        setShouldAutoScroll(true);
        return;
      }
    }

    // Determine next step
    let nextStep = step.next_step_map[value] ||
                   step.next_step_map["default"] ||
                   null;

    // Dynamic logic from API config
    if (step.api_config?.next_step_logic) {
      const logic = step.api_config.next_step_logic;
      for (const cond of logic.conditions) {
        if (userData[cond.field] === cond.value) {
          nextStep = cond.next_step;
          break;
        }
      }
    }

    // Add delay for typing indicator
    setTimeout(() => {
      setIsTyping(false);
      if (nextStep) {
        onStepChange(nextStep);
      }
      isProcessingRef.current = false;
      setShouldAutoScroll(true);
    }, 800);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim() || isProcessingRef.current) return;
    sendUserInput(inputValue.trim());
    setInputValue("");
  };

  const step = flow.steps?.find((s: ChatStep) => s.step_key === currentStepKey);
  const showInput = step?.step_type === "input" || step?.step_type === "api_call";

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