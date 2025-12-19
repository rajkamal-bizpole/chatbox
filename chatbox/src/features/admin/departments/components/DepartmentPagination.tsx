import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  setPage: (page: number) => void;
}

const DepartmentPagination: React.FC<Props> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  setPage,
}) => {
  if (totalPages <= 1) return null;

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  // 🔢 Page numbers logic (max 5 buttons)
  const getPages = () => {
    const pages: number[] = [];

    let from = Math.max(1, currentPage - 2);
    let to = Math.min(totalPages, from + 4);

    // adjust if we are near the end
    if (to - from < 4) {
      from = Math.max(1, to - 4);
    }

    for (let i = from; i <= to; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm">
      {/* Info */}
      <div className="text-sm text-gray-700">
        Showing{" "}
        <span className="font-semibold">{start}</span> to{" "}
        <span className="font-semibold">{end}</span> of{" "}
        <span className="font-semibold">{totalItems}</span> requests
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        {/* Prev */}
        <button
          onClick={() => setPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={18} />
        </button>

        {/* Page numbers */}
        {getPages().map((page) => (
          <button
            key={page}
            onClick={() => setPage(page)}
            className={`min-w-[40px] px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              page === currentPage
                ? "bg-[#e76458] text-white"
                : "border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {page}
          </button>
        ))}

        {/* Next */}
        <button
          onClick={() => setPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default DepartmentPagination;
