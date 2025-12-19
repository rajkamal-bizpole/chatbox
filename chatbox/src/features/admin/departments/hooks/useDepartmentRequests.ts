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
    const res = await getDepartmentChat(sessionId);
    if (res.data.success) setSelectedChat(res.data.messages);
  };

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
