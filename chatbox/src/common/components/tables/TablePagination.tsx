import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import type { PaginationState } from "../../types/pagination.types";

interface Props {
  pagination: PaginationState;
  total: number;
  onPageChange: (page: number) => void;
  maxVisiblePages?: number;
}

export const TablePagination: React.FC<Props> = ({
  pagination,
  total,
  onPageChange,
  maxVisiblePages = 5,
}) => {
  if (total === 0) return null;

  const totalPages = Math.ceil(total / pagination.pageSize);

  const start =
    (pagination.page - 1) * pagination.pageSize + 1;
  const end = Math.min(
    pagination.page * pagination.pageSize,
    total
  );

  const getVisiblePages = () => {
    if (totalPages <= maxVisiblePages)
      return Array.from({ length: totalPages }, (_, i) => i + 1);

    if (pagination.page <= 3) return [1, 2, 3, 4, 5];

    if (pagination.page >= totalPages - 2)
      return [
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];

    return [
      pagination.page - 2,
      pagination.page - 1,
      pagination.page,
      pagination.page + 1,
      pagination.page + 2,
    ];
  };

  const pages = getVisiblePages();

  return (
    <div className="px-6 py-4 border-t bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Info */}
      <div className="text-sm text-gray-700">
        Showing <b>{start}</b> to <b>{end}</b> of <b>{total}</b>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={pagination.page === 1}
          className="p-2 border rounded disabled:opacity-50"
        >
          <ChevronsLeft size={16} />
        </button>

        <button
          onClick={() => onPageChange(pagination.page - 1)}
          disabled={pagination.page === 1}
          className="p-2 border rounded disabled:opacity-50"
        >
          <ChevronLeft size={16} />
        </button>

        {pages.map(p => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-8 h-8 rounded text-sm ${
              p === pagination.page
                ? "bg-[#e76458] text-white"
                : "border"
            }`}
          >
            {p}
          </button>
        ))}

        <button
          onClick={() => onPageChange(pagination.page + 1)}
          disabled={pagination.page === totalPages}
          className="p-2 border rounded disabled:opacity-50"
        >
          <ChevronRight size={16} />
        </button>

        <button
          onClick={() => onPageChange(totalPages)}
          disabled={pagination.page === totalPages}
          className="p-2 border rounded disabled:opacity-50"
        >
          <ChevronsRight size={16} />
        </button>
      </div>
    </div>
  );
};
