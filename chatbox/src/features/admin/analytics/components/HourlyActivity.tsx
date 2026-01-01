import React, { useMemo } from "react";
import { BarChart3 } from "lucide-react";
import type { HourActivity } from "../types/analytics.types";

interface Props {
  hourly: HourActivity[];
}

const HourlyActivityChart: React.FC<Props> = ({ hourly }) => {
  const maxChats = useMemo(() => {
    if (!hourly.length) return 1;
    return Math.max(...hourly.map((h) => h.chats));
  }, [hourly]);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800">
            Hourly Activity
          </h3>
          <p className="text-gray-600 text-sm mt-1">
            Chat volume throughout the day
          </p>
        </div>
        <BarChart3 className="text-[#e76458]" size={20} />
      </div>

      <div className="h-64 flex items-end justify-between gap-2 px-4 border-b border-gray-200">
        {hourly.map((h) => {
          const height = (h.chats / maxChats) * 100;

          return (
            <div key={h.hour} className="flex-1 group flex flex-col items-center">
              <div className="relative w-full">
                <div
                  className="w-full rounded-t-lg transition-all duration-300"
                  style={{
                    height: `${Math.max(height * 0.9, 10)}px`,
                    background:
                      "linear-gradient(to top, #e76458, #f09188)",
                  }}
                />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[#e76458] text-white text-xs rounded opacity-0 group-hover:opacity-100">
                  {h.chats} chats
                </div>
              </div>

              <div className="mt-3 text-center">
                <span className="text-xs text-gray-600 font-medium">
                  {h.hour}
                </span>
                <div className="text-xs text-[#e76458] font-semibold mt-1">
                  {h.chats}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(HourlyActivityChart);
