import { useMemo, useState } from "react";
import type { User } from "../types/user.types";

export const useUserFilters = (users: User[]) => {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();

    return users.filter(u => {
      const matchesSearch =
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone && u.phone.includes(q));

      const matchesRole = role === "all" || u.role === role;

      return matchesSearch && matchesRole;
    });
  }, [users, search, role]);

  return {
    search,
    setSearch,
    role,
    setRole,
    filtered,
  };
};
