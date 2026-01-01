import React from "react";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  icon: React.ReactNode;
  color?: "primary" | "success" | "warning" | "accent";
}

const colorClasses = {
  primary: "bg-[#fef6f5] border-[#f09188]",
  success: "bg-green-50 border-green-100",
  warning: "bg-[#fef6f5] border-[#f09188]",
  accent: "bg-[#fef6f5] border-[#f09188]",
};

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon,
  color = "primary",
}) => {
  const changeColor = change?.startsWith("+")
    ? "text-green-600"
    : "text-[#e76458]";

  return (
    <div
      className={`p-6 rounded-2xl border-2 ${
        colorClasses[color]
      } transition-transform hover:scale-[1.02]`}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
          {change && (
            <p className={`text-sm font-medium mt-2 ${changeColor}`}>
              {change} from last week
            </p>
          )}
        </div>

        <div
          className={`p-3 rounded-xl ${
            color === "success" ? "bg-green-100" : "bg-[#f09188]"
          }`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

export default React.memo(StatCard);
