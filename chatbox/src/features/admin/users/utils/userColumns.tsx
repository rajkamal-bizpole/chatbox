import {
  Edit,
  Trash2,
  Phone,
  Calendar,
  Clock,
} from "lucide-react";
import type { Column } from "../../../../common/types/table.types";
import type { User } from "../types/user.types";

export const userColumns = (
  onEdit: (user: User) => void,
  onDelete: (id: number) => void
): Column<User>[] => [
  {
    key: "username",
    header: "User",
    render: (user) => (
      <span className="font-medium text-gray-900">
        {user.username}
      </span>
    ),
  },
  {
    key: "contact",
    header: "Contact",
    render: (user) => (
      <div>
        <div className="text-gray-700">{user.email}</div>
        {user.phone && (
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
            <Phone size={14} />
            {user.phone}
          </div>
        )}
      </div>
    ),
  },
  {
    key: "role",
    header: "Role",
    render: (user) => (
      <span
        className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${
          user.role === "admin"
            ? "bg-purple-100 text-purple-800 border-purple-200"
            : "bg-blue-100 text-blue-800 border-blue-200"
        }`}
      >
        {user.role}
      </span>
    ),
  },
  {
    key: "created_at",
    header: "Created",
    render: (user) => {
      const d = new Date(user.created_at);
      return (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar size={14} />
            {d.toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock size={12} />
            {d.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      );
    },
  },
  {
    key: "actions",
    header: "",
    render: (user) => (
      <div className="flex justify-end gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(user);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg
            text-blue-600 hover:bg-blue-50"
        >
          <Edit size={16} />
          Edit
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(user.id);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg
            text-red-600 hover:bg-red-50"
        >
          <Trash2 size={16} />
          Delete
        </button>
      </div>
    ),
  },
];
