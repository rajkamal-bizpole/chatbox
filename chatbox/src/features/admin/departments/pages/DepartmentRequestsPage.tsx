import React from "react";

import { useDepartmentRequests } from "../hooks/useDepartmentRequests";
import { useDepartmentFilters } from "../hooks/useDepartmentFilters";



import DepartmentRequestCard from "../components/DepartmentRequestCard";
 import { Activity
} from "lucide-react";
import DepartmentChatModal from "../components/DepartmentChatModal";
import PageHeader from "../../../../common/components/header/PageHeader";
import { RefreshCw, FileText } from "lucide-react";
import StatsBar from "../../../../common/components/stats/StatsBar";
import { buildDepartmentStats } from "../utils/stats";
import FilterBar from "../../../../common/components/filter/FilterBar";
import Pagination from "../../../../common/components/pagination/Pagination";
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
   
   <PageHeader
  title="Department Requests"
  subtitle="Monitor and manage department assistance requests"

  actions={
  <button
            onClick={dept.loadRequests}
            className="px-4 py-2 bg-gradient-to-r from-[#e76458] to-[#f09188] text-white rounded-lg flex items-center gap-2 hover:opacity-90"
          >
            <Activity size={18} />
            Refresh 
          </button>
  }
/>

      {/* Stats */}
      <StatsBar items={buildDepartmentStats(dept.requests)} />


      {/* Filters */}



<FilterBar
  filters={[
    {
      key: "search",
      type: "search",
      value: filters.search,
      placeholder: "Search by department or message",
      onChange: filters.setSearch,
    },
    {
      key: "status",
      type: "select",
      value: filters.status,
      onChange: filters.setStatus,
      options: [
        { label: "All Status", value: "all" },
        { label: "Investigating", value: "investigating" },
        { label: "Resolved", value: "resolved" },
      ],
    },
  ]}
  onReset={() => {
    filters.setSearch("");
    filters.setStatus("all");
  }}
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

 <Pagination
  page={filters.currentPage}
  pageSize={filters.pageSize}
  total={filters.filtered.length}
  onChange={filters.setCurrentPage}
/>
    </div>
  );
};

export default DepartmentRequestsPage;
