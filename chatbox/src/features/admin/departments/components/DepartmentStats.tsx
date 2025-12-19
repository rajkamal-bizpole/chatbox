import React, { useMemo } from "react";
import { FileText, AlertCircle, CheckCircle } from "lucide-react";
import type { DepartmentRequest } from "../types/department.types";

interface Props {
  requests: DepartmentRequest[];
}

const DepartmentStats: React.FC<Props> = ({ requests }) => {
  const stats = useMemo(
    () => ({
      total: requests.length,
      investigating: requests.filter(
        (r) => r.status === "investigating"
      ).length,
      resolved: requests.filter((r) => r.status === "resolved").length,
    }),
    [requests]
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500 font-medium">
              Total Requests
            </p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {stats.total}
            </p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <FileText className="text-blue-600" size={22} />
          </div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500 font-medium">
              Investigating
            </p>
            <p className="text-3xl font-bold text-orange-600 mt-1">
              {stats.investigating}
            </p>
          </div>
          <div className="p-3 bg-orange-50 rounded-lg">
            <AlertCircle className="text-orange-600" size={22} />
          </div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500 font-medium">
              Resolved
            </p>
            <p className="text-3xl font-bold text-green-600 mt-1">
              {stats.resolved}
            </p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <CheckCircle className="text-green-600" size={22} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentStats;
