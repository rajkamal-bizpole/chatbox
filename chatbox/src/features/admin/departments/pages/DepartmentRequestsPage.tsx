import React from "react";

import { useDepartmentRequests } from "../hooks/useDepartmentRequests";
import { useDepartmentFilters } from "../hooks/useDepartmentFilters";

import DepartmentStats from "../components/DepartmentStats";
import DepartmentFilters from "../components/DepartmentFilters";
import DepartmentRequestCard from "../components/DepartmentRequestCard";
import DepartmentPagination from "../components/DepartmentPagination";
import DepartmentChatModal from "../components/DepartmentChatModal";

import { RefreshCw, FileText } from "lucide-react";

const DepartmentRequestsPage: React.FC = () => {
  const dept = useDepartmentRequests();
  const filters = useDepartmentFilters(dept.requests);

  // 🔄 Loading state
  if (dept.loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto text-[#e76458]" size={32} />
          <p className="text-gray-600 mt-3">Loading department requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <div className="p-2 bg-[#e76458] rounded-lg">
            <FileText className="text-white" size={22} />
          </div>
          Department Requests
        </h1>
        <p className="text-gray-600 mt-1">
          Monitor and manage department assistance requests
        </p>
      </div>

      {/* Stats */}
      <DepartmentStats requests={dept.requests} />

      {/* Filters */}



<DepartmentFilters
  searchQuery={filters.search}
  setSearchQuery={filters.setSearch}
  statusFilter={filters.status}
  setStatusFilter={filters.setStatus}
/>


      {/* Requests */}
      {filters.paginated.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <FileText className="mx-auto text-gray-300" size={48} />
          <h3 className="text-lg font-semibold text-gray-600 mt-4">
            No department requests found
          </h3>
          <p className="text-gray-500 mt-1">
            Try adjusting your filters or search
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filters.paginated.map((req) => (
            <DepartmentRequestCard
              key={req.id}
              request={req}
              onViewChat={dept.loadChat}
              onResolve={dept.markResolved}
              resolving={dept.resolvingId === req.id}
            />
          ))}
        </div>
      )}

      {/* Pagination */}



      {/* Chat Modal */}
      <DepartmentChatModal
        chat={dept.selectedChat}
        onClose={dept.closeChat}
      />

      <DepartmentPagination
  currentPage={filters.currentPage}
  totalPages={filters.totalPages}
  totalItems={filters.filtered.length}
  pageSize={filters.pageSize}
  setPage={filters.setCurrentPage}
/>
    </div>
  );
};

export default DepartmentRequestsPage;
