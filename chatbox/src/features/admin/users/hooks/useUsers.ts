import { useEffect, useState } from "react";
import { usersApi } from "../api/users.api";
import type { User } from "../types/user.types";

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    const res = await usersApi.getAll();
    setUsers(res.data.users || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return { users, loading, refresh: fetchUsers };
};
