import React, { useEffect, useState, useMemo } from "react";
import http from "../../api/http";
import { 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Building,
  RefreshCw,
  User,
  Bot,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Search,
  AlertCircle,
  Eye,
  FileText
} from "lucide-react";

interface DepartmentRequest {
  id: number;
  session_id: number;
  department: string;
  status: "investigating" | "resolved";
  priority?: "low" | "medium" | "high";
  message: string;
  chat_logs: any;
  created_at: string;
  updated_at?: string | null;
  assigned_to?: string;
}

const ITEMS_PER_PAGE = 8;

const DepartmentRequests: React.FC = () => {
  const [requests, setRequests] = useState<DepartmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState<any | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [resolvingId, setResolvingId] = useState<number | null>(null);

  // Load requests
  const loadRequests = async () => {
    try {
      setLoading(true);
      const res = await http.get("/api/admin/departments/requests");
      // Transform any 'pending' status to 'investigating'
      const data = res.data.requests?.map((req: any) => ({
        ...req,
        status: req.status === "pending" ? "investigating" : req.status,
        priority: req.priority || "medium"
      })) || [];
      setRequests(data);
    } catch (err) {
      console.error("Failed to load department requests", err);
    } finally {
      setLoading(false);
    }
  };

  // Mark as resolved
  const markResolved = async (id: number) => {
    try {
      setResolvingId(id);
      await http.put(`/api/admin/departments/resolve/${id}`);
      await loadRequests();
    } catch (err) {
      console.error("Failed to resolve", err);
    } finally {
      setResolvingId(null);
    }
  };

  // Filter requests
  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      const matchesStatus = statusFilter === "all" || req.status === statusFilter;
      const matchesSearch = !searchQuery || 
        req.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.assigned_to?.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesStatus && matchesSearch;
    });
  }, [requests, statusFilter, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE);
  const paginatedRequests = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredRequests.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredRequests, currentPage]);

  // Stats
  const stats = useMemo(() => ({
    total: requests.length,
    investigating: requests.filter(r => r.status === "investigating").length,
    resolved: requests.filter(r => r.status === "resolved").length
  }), [requests]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredRequests]);

  // Initial load
  useEffect(() => {
    loadRequests();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-[#e76458] rounded-lg">
              <FileText className="text-white" size={24} />
            </div>
            Department Requests
          </h1>
          <p className="text-gray-600 mt-1">Monitor and manage department assistance requests</p>
        </div>
        <button
          onClick={loadRequests}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Requests</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <FileText className="text-blue-600" size={22} />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500 font-medium">Investigating</p>
              <p className="text-3xl font-bold text-orange-600 mt-1">{stats.investigating}</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <AlertCircle className="text-orange-600" size={22} />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500 font-medium">Resolved</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.resolved}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle className="text-green-600" size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by department, message, or assignee..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e76458] focus:border-transparent"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e76458] focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <RefreshCw className="animate-spin mx-auto text-[#e76458]" size={32} />
            <p className="text-gray-600 mt-3">Loading requests...</p>
          </div>
        </div>
      ) : paginatedRequests.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm">
          <FileText className="mx-auto text-gray-400" size={48} />
          <h3 className="text-xl font-semibold text-gray-600 mt-4">No requests found</h3>
          <p className="text-gray-500 mt-2">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            {paginatedRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    {/* Left Section */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <Building className="text-[#e76458]" size={22} />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-3 mb-3">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {req.department}
                            </h3>
                            
                            {/* Status Badge */}
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                              req.status === "resolved"
                                ? "bg-green-100 text-green-800 border border-green-200"
                                : "bg-orange-100 text-orange-800 border border-orange-200"
                            }`}>
                              {req.status === "resolved" ? (
                                <CheckCircle size={14} />
                              ) : (
                                <AlertCircle size={14} />
                              )}
                              {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                            </span>
                            
                            {/* Priority Badge */}
                            {req.priority && (
                              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                                req.priority === "high" 
                                  ? "bg-red-50 text-red-700 border border-red-100"
                                  : req.priority === "medium"
                                  ? "bg-yellow-50 text-yellow-700 border border-yellow-100"
                                  : "bg-blue-50 text-blue-700 border border-blue-100"
                              }`}>
                                {req.priority.charAt(0).toUpperCase() + req.priority.slice(1)} Priority
                              </span>
                            )}
                          </div>
                          
                          <p className="text-gray-700 mb-4 leading-relaxed">
                            {req.message}
                          </p>
                          
                          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1.5">
                              <Calendar size={14} />
                              Created: {new Date(req.created_at).toLocaleString()}
                            </div>
                            
                            {req.updated_at && (
                              <div className="flex items-center gap-1.5 text-green-600">
                                <CheckCircle size={14} />
                                Resolved: {new Date(req.updated_at).toLocaleDateString()}
                              </div>
                            )}
                            
                            {req.assigned_to && (
                              <div className="flex items-center gap-1.5">
                                <User size={14} />
                                {req.assigned_to}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-2 min-w-[200px]">
                      <button
                        onClick={() => setSelectedChat(req.chat_logs)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Eye size={16} />
                        View Chat
                      </button>
                      
                      {req.status !== "resolved" && (
                        <button
                          onClick={() => markResolved(req.id)}
                          disabled={resolvingId === req.id}
                          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                          {resolvingId === req.id ? (
                            <>
                              <RefreshCw className="animate-spin" size={16} />
                              Processing...
                            </>
                          ) : (
                            <>
                              <CheckCircle size={16} />
                              Mark Resolved
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm">
              <div className="text-sm text-gray-700">
                Showing <span className="font-semibold">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{" "}
                <span className="font-semibold">{Math.min(currentPage * ITEMS_PER_PAGE, filteredRequests.length)}</span> of{" "}
                <span className="font-semibold">{filteredRequests.length}</span> requests
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={18} />
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`min-w-[40px] px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === pageNum
                          ? "bg-[#e76458] text-white"
                          : "border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Chat Modal */}
      {selectedChat && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#e76458] to-[#d4594e] px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <MessageSquare className="text-white" size={24} />
                <div>
                  <h3 className="text-xl font-semibold text-white">Chat Conversation</h3>
                  <p className="text-white/80 text-sm">{selectedChat.length} messages</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedChat(null)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <XCircle className="text-white" size={24} />
              </button>
            </div>

            {/* Chat Body */}
            <div className="h-[65vh] flex flex-col">
              <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                {Array.isArray(selectedChat) && selectedChat.length > 0 ? (
                  <div className="space-y-4">
                    {selectedChat.map((msg: any, i: number) => {
                      const isUser = msg.sender === "user" || msg.message_type === "user";
                      const text = msg.text || msg.content || "";
                      const time = msg.timestamp
                        ? new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "";

                      return (
                        <div
                          key={i}
                          className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                        >
                          <div className={`max-w-[80%] ${isUser ? "ml-auto" : "mr-auto"}`}>
                            <div className="flex items-center gap-2 mb-1">
                              {isUser ? (
                                <User className="text-gray-500" size={14} />
                              ) : (
                                <Bot className="text-[#e76458]" size={14} />
                              )}
                              <span className="text-xs font-medium text-gray-600">
                                {isUser ? "User" : "Assistant"}
                              </span>
                              <span className="text-xs text-gray-400">{time}</span>
                            </div>
                            <div
                              className={`p-4 rounded-2xl ${
                                isUser
                                  ? "bg-gradient-to-r from-[#e76458] to-[#d4594e] text-white rounded-br-none"
                                  : "bg-white border border-gray-200 rounded-bl-none shadow-sm"
                              }`}
                            >
                              <p className="leading-relaxed whitespace-pre-line">{text}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center">
                    <MessageSquare className="text-gray-300" size={48} />
                    <p className="text-gray-500 mt-4">No chat messages found</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 bg-white border-t">
                <button
                  onClick={() => setSelectedChat(null)}
                  className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Close Conversation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentRequests;