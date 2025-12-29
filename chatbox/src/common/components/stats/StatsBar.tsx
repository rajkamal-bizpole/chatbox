import React from "react";
import type { StatsBarProps } from "../../types/stats.types";

const StatsBar: React.FC<StatsBarProps> = ({ items }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {items.map(item => (
        <div
          key={item.key}
          className="bg-white border rounded-2xl p-6 shadow-sm"
        >
          <div className="flex items-center justify-between">
            {/* Text */}
            <div>
              <p className="text-sm font-medium text-gray-500">
                {item.label}
              </p>
              <p className="mt-1 text-3xl font-bold text-gray-900">
                {item.value}
              </p>
            </div>

            {/* Icon */}
            <div
              className={`flex items-center justify-center 
              w-14 h-14 rounded-xl 
              ${item.className ?? ""}`}
            >
              <div className="text-xl">
                {item.icon}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsBar;
