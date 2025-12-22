import http from "../../../../api/http";
import type { ChatFlow } from "../types/chatFlow.types";

export const chatFlowAPI = {
  getFlows: () => http.get("/api/chat/flows").then(r => r.data),
  getFlow: (id: number) =>
    http.get(`/api/chat/flows/${id}`).then(r => r.data),
  createFlow: (flow: ChatFlow) =>
    http.post("/api/chat/flows", flow).then(r => r.data),
  updateFlow: (id: number, flow: ChatFlow) =>
    http.put(`/api/chat/flows/${id}`, flow).then(r => r.data),
  deleteFlow: (id: number) =>
    http.delete(`/api/chat/flows/${id}`),
  toggleFlow: (id: number, active: boolean) =>
    http.patch(`/api/chat/flows/${id}/status`, { is_active: active }),
};
