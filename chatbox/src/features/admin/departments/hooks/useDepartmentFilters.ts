import { useMemo, useState } from "react";
import type { DepartmentRequest } from "../types/department.types";

const PAGE_SIZE = 8;

export const useDepartmentFilters = (requests: DepartmentRequest[]) => {
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // 🔍 Filtering
  const filtered = useMemo(() => {
    return requests.filter((r) => {
      const matchesStatus = status === "all" || r.status === status;
      const matchesSearch =
        !search ||
        r.department.toLowerCase().includes(search.toLowerCase()) ||
        r.message.toLowerCase().includes(search.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [requests, status, search]);

  // 📄 Pagination
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  // 🔁 Reset page on filter change
  const resetPage = () => setCurrentPage(1);

  return {
    // filters
    status,
    setStatus,
    search,
    setSearch,

    // pagination
    currentPage,
    setCurrentPage,
    totalPages,
    pageSize: PAGE_SIZE,

    // data
    filtered,
    paginated,

    // helpers
    resetPage,
  };
};
