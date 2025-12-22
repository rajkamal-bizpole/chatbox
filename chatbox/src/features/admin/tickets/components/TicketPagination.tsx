import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import type { PaginationInfo } from "../types/tickets.types";

interface Props {
  pagination: PaginationInfo;
  total: number;
  setPagination: React.Dispatch<React.SetStateAction<PaginationInfo>>;
}

const MAX_VISIBLE_PAGES = 5;

const TicketPagination: React.FC<Props> = ({
  pagination,
  total,
  setPagination,
}) => {
  if (total === 0) return null;

  const totalPages = Math.ceil(total / pagination.pageSize);

  const start =
    (pagination.page - 1) * pagination.pageSize + 1;
  const end = Math.min(
    pagination.page * pagination.pageSize,
    total
  );

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setPagination(p => ({ ...p, page }));
  };

  const getVisiblePages = () => {
    if (totalPages <= MAX_VISIBLE_PAGES) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (pagination.page <= 3) {
      return [1, 2, 3, 4, 5];
    }

    if (pagination.page >= totalPages - 2) {
      return [
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      pagination.page - 2,
      pagination.page - 1,
      pagination.page,
      pagination.page + 1,
      pagination.page + 2,
    ];
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="px-6 py-4 border-t bg-gray-50">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Info */}
        <div className="text-sm text-gray-700">
          Showing{" "}
          <span className="font-semibold">{start}</span> to{" "}
          <span className="font-semibold">{end}</span> of{" "}
          <span className="font-semibold">{total}</span>{" "}
          results
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => goToPage(1)}
            disabled={pagination.page === 1}
            className="p-2 rounded-lg border border-gray-300 text-gray-700 disabled:opacity-50"
          >
            <ChevronsLeft size={16} />
          </button>

          <button
            onClick={() => goToPage(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="p-2 rounded-lg border border-gray-300 text-gray-700 disabled:opacity-50"
          >
            <ChevronLeft size={16} />
          </button>

          {visiblePages.map(page => (
            <button
              key={page}
              onClick={() => goToPage(page)}
              className={`w-8 h-8 rounded-lg text-sm font-medium ${
                pagination.page === page
                  ? "bg-[#e76458] text-white"
                  : "border border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
            >
              {page}
            </button>
          ))}

          {totalPages > MAX_VISIBLE_PAGES &&
            pagination.page < totalPages - 2 && (
              <span className="px-2 text-gray-500">…</span>
            )}

          <button
            onClick={() => goToPage(pagination.page + 1)}
            disabled={pagination.page === totalPages}
            className="p-2 rounded-lg border border-gray-300 text-gray-700 disabled:opacity-50"
          >
            <ChevronRight size={16} />
          </button>

          <button
            onClick={() => goToPage(totalPages)}
            disabled={pagination.page === totalPages}
            className="p-2 rounded-lg border border-gray-300 text-gray-700 disabled:opacity-50"
          >
            <ChevronsRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketPagination;
