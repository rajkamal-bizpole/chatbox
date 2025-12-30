export interface User {
  id: number;
  username: string;
  email: string;
  phone?: string;
  created_at: string;
  role: "admin" | "user";
}

export interface UserForm {
  username: string;
  email: string;
  phone: string;
  role: "admin" | "user";
  password?: string;
}
