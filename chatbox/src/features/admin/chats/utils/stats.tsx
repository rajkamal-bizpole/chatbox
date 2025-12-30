import {
  Activity,
  Shield,
  UserCheck,
  UserX,
} from "lucide-react";
import type { ChatSession } from "../types/chat.type";
import type { StatItem } from "../../../../common/types/stats.types";

export const buildChatStats = (
  sessions: ChatSession[]
): StatItem[] => [
  {
    key: "active",
    label: "Active Sessions",
    value: sessions.filter(s => s.status === "active").length,
    icon: <Activity size={24} />,
    className: "bg-green-50 text-green-700",
  },
  {
    key: "escalated",
    label: "Escalated",
    value: sessions.filter(s => s.status === "escalated").length,
    icon: <Shield size={24} />,
    className: "bg-yellow-50 text-yellow-700",
  },
  {
    key: "existing",
    label: "Existing Customers",
    value: sessions.filter(s => s.is_existing_customer).length,
    icon: <UserCheck size={24} />,
    className: "bg-blue-50 text-blue-700",
  },
  {
    key: "new",
    label: "New Customers",
    value: sessions.filter(s => !s.is_existing_customer).length,
    icon: <UserX size={24} />,
    className: "bg-gray-50 text-gray-700",
  },
];
