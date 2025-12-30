import { FileText, AlertCircle, CheckCircle } from "lucide-react";
import type { DepartmentRequest } from "../types/department.types";
import type { StatItem } from "../../../../common/types/stats.types";

export const buildDepartmentStats = (
  requests: DepartmentRequest[]
): StatItem[] => {
  const total = requests.length;
  const investigating = requests.filter(
    r => r.status === "investigating"
  ).length;
  const resolved = requests.filter(
    r => r.status === "resolved"
  ).length;

  return [
    {
      key: "total",
      label: "Total Requests",
      value: total,
      icon: <FileText size={26} />,
      className: "bg-blue-50 text-blue-700",
    },
    {
      key: "investigating",
      label: "Investigating",
      value: investigating,
      icon: <AlertCircle size={26} />,
      className: "bg-orange-50 text-orange-700",
    },
    {
      key: "resolved",
      label: "Resolved",
      value: resolved,
      icon: <CheckCircle size={26} />,
      className: "bg-green-50 text-green-700",
    },
  ];
};
