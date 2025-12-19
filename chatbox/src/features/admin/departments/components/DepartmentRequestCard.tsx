import React from "react";
import {
  Building,
  CheckCircle,
  AlertCircle,
  Eye,
  RefreshCw,
  User,
  Calendar,
} from "lucide-react";

interface Props {
  request: any;
  onViewChat: (sessionId: number) => void;
  onResolve: (id: number) => void;
  resolving: boolean;
}

const DepartmentRequestCard: React.FC<Props> = ({
  request,
  onViewChat,
  onResolve,
  resolving,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
      <div className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          {/* LEFT */}
          <div className="flex-1">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <Building className="text-[#e76458]" size={22} />
              </div>

              <div className="flex-1">
                {/* Title + Badges */}
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {request.department}
                  </h3>

                  {/* Status */}
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${
                      request.status === "resolved"
                        ? "bg-green-100 text-green-800 border-green-200"
                        : "bg-orange-100 text-orange-800 border-orange-200"
                    }`}
                  >
                    {request.status === "resolved" ? (
                      <CheckCircle size={14} />
                    ) : (
                      <AlertCircle size={14} />
                    )}
                    {request.status.charAt(0).toUpperCase() +
                      request.status.slice(1)}
                  </span>

                  {/* Priority */}
                  {request.priority && (
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                        request.priority === "high"
                          ? "bg-red-50 text-red-700 border-red-100"
                          : request.priority === "medium"
                          ? "bg-yellow-50 text-yellow-700 border-yellow-100"
                          : "bg-blue-50 text-blue-700 border-blue-100"
                      }`}
                    >
                      {request.priority.charAt(0).toUpperCase() +
                        request.priority.slice(1)}{" "}
                      Priority
                    </span>
                  )}
                </div>

                {/* Message */}
                <p className="text-gray-700 mb-4 leading-relaxed">
                  {request.message}
                </p>

                {/* Meta */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} />
                    Created:{" "}
                    {new Date(request.created_at).toLocaleString()}
                  </div>

                  {request.assigned_to && (
                    <div className="flex items-center gap-1.5">
                      <User size={14} />
                      {request.assigned_to}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2 min-w-[200px]">
            <button
              onClick={() => onViewChat(request.session_id)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Eye size={16} />
              View Chat
            </button>

            {request.status !== "resolved" && (
              <button
                onClick={() => onResolve(request.id)}
                disabled={resolving}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {resolving ? (
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
  );
};

export default DepartmentRequestCard;
