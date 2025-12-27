// common/hooks/useTable.ts
import { useState, useMemo } from "react";

export function useTable<T>(data: T[], options?: {
  pageSize?: number;
  searchFn?: (row: T, query: string) => boolean;
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!options?.searchFn || !search) return data;
    return data.filter(row => options.searchFn!(row, search));
  }, [data, search]);

  const pageSize = options?.pageSize ?? 10;
  const totalPages = Math.ceil(filtered.length / pageSize);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  return {
    search,
    setSearch,
    page,
    setPage,
    totalPages,
    paginated,
    totalItems: filtered.length,
  };
}
