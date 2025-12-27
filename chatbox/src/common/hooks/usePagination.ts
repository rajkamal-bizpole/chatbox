import { useState } from "react";
import type { PaginationState } from "../types/pagination.types";

interface Params {
  initialPage?: number;
  pageSize?: number;
}

export const usePagination = ({
  initialPage = 1,
  pageSize = 10,
}: Params = {}) => {
  const [pagination, setPagination] = useState<PaginationState>({
    page: initialPage,
    pageSize,
  });

  const goToPage = (page: number) => {
    setPagination(p => ({ ...p, page }));
  };

  const nextPage = () =>
    setPagination(p => ({ ...p, page: p.page + 1 }));

  const prevPage = () =>
    setPagination(p => ({ ...p, page: Math.max(1, p.page - 1) }));

  return {
    pagination,
    setPagination,
    goToPage,
    nextPage,
    prevPage,
  };
};
