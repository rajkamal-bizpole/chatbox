import { useEffect, useState } from "react";
import StatsBar from "../../../../common/components/stats/StatsBar";
import FilterBar from "../../../../common/components/filter/FilterBar"

import UserModal from "../components/UserModal";
import { usersApi } from "../api/users.api";
import type { User } from "../types/user.types";
import { buildUserStats } from "../utils/Stats";
import PageHeader from "../../../../common/components/header/PageHeader";
import DataTable from "../../../../common/components/table/DataTable";
import { userColumns } from "../utils/userColumns";
import Pagination from "../../../../common/components/pagination/Pagination"
 import { Activity
} from "lucide-react";
export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // 🔥 modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    const res = await usersApi.getAll();
    setUsers(res.data.users || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);
  const PAGE_SIZE = 10;
const [page, setPage] = useState(1);

useEffect(() => {
  setPage(1);
}, [search, roleFilter]);

const startIndex = (page - 1) * PAGE_SIZE;



  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      (user.phone && user.phone.includes(search));

    const matchesRole =
      roleFilter === "all" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });
const paginatedUsers = filteredUsers.slice(
  startIndex,
  startIndex + PAGE_SIZE
);
  /* ---------- ACTIONS ---------- */

  const handleAdd = () => {
    setSelectedUser(null);      // add mode
    setIsModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);      // edit mode
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this user?")) return;
    await usersApi.delete(id);
    fetchUsers();
  };

  return (
    <div className="p-6 space-y-6">
     
      <PageHeader
      title="User Management"
      subtitle="Manage application users and permissions"
      rightContent={
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-[#e76458] text-white px-5 py-2.5 rounded-lg"
        >
          + Add User
        </button>
      }
      actions={
        <button
          onClick={fetchUsers}
            className="px-4 py-2 bg-gradient-to-r from-[#e76458] to-[#f09188] text-white rounded-lg flex items-center gap-2 hover:opacity-90"
        >
            <Activity size={18} />
          Refresh
        </button>
      }
    />

    {/* Stats */}
    <StatsBar items={buildUserStats(users)} />

    {/* Filters */}
    <FilterBar
      filters={[
        {
          key: "search",
          type: "search",
          value: search,
          placeholder: "Search username, email or phone",
          onChange: setSearch,
        },
        {
          key: "role",
          type: "select",
          value: roleFilter,
          onChange: setRoleFilter,
          options: [
            { label: "All Roles", value: "all" },
            { label: "Admin", value: "admin" },
            { label: "User", value: "user" },
          ],
        },
      ]}
      onReset={() => {
        setSearch("");
        setRoleFilter("all");
      }}
    />


<DataTable
  data={paginatedUsers}
  loading={loading}
  columns={userColumns(handleEdit, handleDelete)}
  emptyMessage="No users found"
/>

<Pagination
  page={page}
  pageSize={PAGE_SIZE}
  total={filteredUsers.length}
  onChange={setPage}
/>


      {/* 🔥 THIS WAS MISSING / WRONG BEFORE */}
      <UserModal
        open={isModalOpen}
        user={selectedUser}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchUsers}
      />
    </div>
  );
}
