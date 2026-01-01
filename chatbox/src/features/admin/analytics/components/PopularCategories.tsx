import React from "react";
import { PieChart } from "lucide-react";
import type { Category } from "../types/analytics.types";

interface Props {
  categories: Category[];
}

const COLORS = [
  "#e76458",
  "#f09188",
  "#f8b4b0",
  "#f5a6a1",
  "#f09188",
  "#e76458",
];

const PopularCategories: React.FC<Props> = ({ categories }) => {
  const maxCount = categories[0]?.count || 1;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800">
            Popular Categories
          </h3>
          <p className="text-gray-600 text-sm mt-1">
            Most frequent chat topics
          </p>
        </div>
        <PieChart className="text-[#e76458]" size={20} />
      </div>

      <div className="space-y-4">
        {categories.map((c, index) => {
          const percentage = Math.round((c.count / maxCount) * 100);
          const color = COLORS[index % COLORS.length];

          return (
            <div key={c.category} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">
                  {c.category}
                </span>
                <span className="text-gray-900 font-semibold">
                  {c.count}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                />

                <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                  <div
                    className="h-2.5 rounded-full transition-all duration-500"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>

                <span className="text-gray-600 text-sm w-12 text-right">
                  {percentage}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(PopularCategories);
