import http from "../../../../api/http";

export const getDepartmentRequests = () =>
  http.get("/api/admin/departments/requests");

export const resolveDepartmentRequest = (id: number) =>
  http.put(`/api/admin/departments/resolve/${id}`);

export const getDepartmentChat = (sessionId: number) =>
  http.get(`/api/admin/departments/chat/${sessionId}`);
