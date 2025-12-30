// features/users/utils/stats.ts
import { Users, Phone, Shield } from "lucide-react";
import type { User } from "../types/user.types";
import type { StatItem } from "../../../../common/types/stats.types";

export const buildUserStats = (users: User[]): StatItem[] => [
  {
    key: "total",
    label: "Total Users",
    value: users.length,
    icon: <Users size={22} />,
    className: "bg-blue-50 text-blue-700",
  },
  {
    key: "admins",
    label: "Admins",
    value: users.filter(u => u.role === "admin").length,
    icon: <Shield size={22} />,
    className: "bg-purple-50 text-purple-700",
  },
  {
    key: "with_phone",
    label: "With Phone",
    value: users.filter(u => u.phone).length,
    icon: <Phone size={22} />,
    className: "bg-green-50 text-green-700",
  },
];
