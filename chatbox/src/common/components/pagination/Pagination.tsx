import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onChange: (page: number) => void;
}

const MAX_VISIBLE_PAGES = 5;

const Pagination: React.FC<PaginationProps> = ({
  page,
  pageSize,
  total,
  onChange,
}) => {
  if (total === 0) return null;

  const totalPages = Math.ceil(total / pageSize);

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages) return;
    onChange(p);
  };

  const getVisiblePages = () => {
    if (totalPages <= MAX_VISIBLE_PAGES)
      return Array.from({ length: totalPages }, (_, i) => i + 1);

    if (page <= 3) return [1, 2, 3, 4, 5];
    if (page >= totalPages - 2)
      return [
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];

    return [page - 2, page - 1, page, page + 1, page + 2];
  };

  return (
    <div className="px-6 py-4 border-t bg-gray-50">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Info */}
        <div className="text-sm text-gray-700">
          Showing{" "}
          <span className="font-semibold">{start}</span> to{" "}
          <span className="font-semibold">{end}</span> of{" "}
          <span className="font-semibold">{total}</span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => goToPage(1)}
            disabled={page === 1}
            className="p-2 rounded-lg border disabled:opacity-50"
          >
            <ChevronsLeft size={16} />
          </button>

          <button
            onClick={() => goToPage(page - 1)}
            disabled={page === 1}
            className="p-2 rounded-lg border disabled:opacity-50"
          >
            <ChevronLeft size={16} />
          </button>

          {getVisiblePages().map(p => (
            <button
              key={p}
              onClick={() => goToPage(p)}
              className={`w-8 h-8 rounded-lg text-sm font-medium ${
                p === page
                  ? "bg-[#e76458] text-white"
                  : "border hover:bg-gray-100"
              }`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => goToPage(page + 1)}
            disabled={page === totalPages}
            className="p-2 rounded-lg border disabled:opacity-50"
          >
            <ChevronRight size={16} />
          </button>

          <button
            onClick={() => goToPage(totalPages)}
            disabled={page === totalPages}
            className="p-2 rounded-lg border disabled:opacity-50"
          >
            <ChevronsRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
