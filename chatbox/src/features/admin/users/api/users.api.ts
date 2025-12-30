import http from "../../../../api/http";

import type { UserForm } from "../types/user.types";

export const usersApi = {
  getAll: () => http.get("/api/admin/users"),
  create: (data: UserForm) => http.post("/api/admin/users", data),
  update: (id: number, data: Partial<UserForm>) =>
    http.put(`/api/admin/users/${id}`, data),
  delete: (id: number) =>
    http.delete(`/api/admin/users/${id}`),
};
