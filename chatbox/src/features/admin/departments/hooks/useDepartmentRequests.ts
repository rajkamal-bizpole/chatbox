import { useEffect, useState } from "react";
import {
  getDepartmentRequests,
  resolveDepartmentRequest,
  getDepartmentChat,
} from "../api/department.api";
import type { DepartmentRequest } from "../types/department.types";

export const useDepartmentRequests = () => {
  const [requests, setRequests] = useState<DepartmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState<any | null>(null);
  const [resolvingId, setResolvingId] = useState<number | null>(null);

  const loadRequests = async () => {
    setLoading(true);
    const res = await getDepartmentRequests();
    setRequests(res.data.requests || []);
    setLoading(false);
  };

  const markResolved = async (id: number) => {
    setResolvingId(id);
    await resolveDepartmentRequest(id);
    await loadRequests();
    setResolvingId(null);
  };

const loadChat = async (sessionId: number) => {
  try {
    const res = await getDepartmentChat(sessionId);

    if (res.data.success) {
      const normalized = res.data.messages.map((m: any) => ({
        role:
          m.sender === "user" ||
          m.message_type === "user" ||
          m.from === "customer"
            ? "user"
            : "bot",

        text: m.text || m.content || m.message || "",
        timestamp: m.timestamp || m.created_at,
      }));

      setSelectedChat(normalized);
    }
  } catch (error) {
    console.error("Failed to load department chat", error);
  }
};
;


  useEffect(() => {
    loadRequests();
  }, []);

  return {
    requests,
    loading,
    resolvingId,
    selectedChat,
    loadRequests,
    markResolved,
    loadChat,
    closeChat: () => setSelectedChat(null),
  };
};
