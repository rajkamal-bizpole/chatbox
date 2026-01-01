import React from "react";
import {
  MessageSquare,
  CheckCircle,
  Clock,
  TrendingUp,
  Activity,
} from "lucide-react";

import { useAnalytics } from "../hooks/useAnalytics";
import StatCard from "../components/StatCard";
import PopularCategories from "../components/PopularCategories";
import HourlyActivityChart from "../components/HourlyActivity";
import PageHeader from "../../../../common/components/header/PageHeader";
const AnalyticsPage: React.FC = () => {
  const {
    overview,
    categories,
    hourly,
    loading,
    error,
    refetch,
  } = useAnalytics();

  /* -------------------- Loading -------------------- */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#f09188] border-t-[#e76458] rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">
            Loading analytics dashboard...
          </p>
        </div>
      </div>
    );
  }

  /* -------------------- Error -------------------- */
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center p-8 bg-[#fef6f5] rounded-xl border border-[#f09188] max-w-md">
          <div className="w-12 h-12 bg-[#f09188] rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity className="text-white" size={24} />
          </div>
          <h3 className="text-lg font-semibold text-[#e76458] mb-2">
            Error Loading Data
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-[#e76458] text-white rounded-lg hover:bg-[#f09188]"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* ---------------- Header ---------------- */}
            <PageHeader
        title="Analytics Dashboard"
        subtitle="Monitor chat performance and user activity"
        actions={
          <button
            onClick={refetch}
            className="px-4 py-2 bg-gradient-to-r from-[#e76458] to-[#f09188] text-white rounded-lg flex items-center gap-2 hover:opacity-90"
          >
            <Activity size={18} />
            Refresh 
          </button>
        }
      />

      {/* ---------------- Stats ---------------- */}
      {overview && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Chats"
            value={overview.totalChats.toString()}
            change="+12.5%"
            icon={<MessageSquare className="text-[#e76458]" size={24} />}
          />

          <StatCard
            title="Resolved Chats"
            value={overview.resolvedChats.toString()}
            change="+8.2%"
            color="success"
            icon={<CheckCircle className="text-green-600" size={24} />}
          />

          <StatCard
            title="Unresolved Chats"
            value={overview.unresolvedChats?.toString() || "0"}
            change="-4.3%"
            icon={<MessageSquare className="text-[#e76458]" size={24} />}
          />

          <StatCard
            title="Avg Response Time"
            value={overview.averageResponseTime}
            change="-15%"
            color="accent"
            icon={<Clock className="text-[#f09188]" size={24} />}
          />
        </div>
      )}

      {/* ---------------- Resolution Rate ---------------- */}
      {overview && (
        <div className="bg-gradient-to-r from-[#e76458] to-[#f09188] rounded-2xl p-6 text-white">
          <div className="flex flex-col md:flex-row justify-between">
            <div>
              <h3 className="text-lg font-semibold">
                Chat Resolution Rate
              </h3>
              <p className="text-white/90 text-sm mt-1">
                Percentage of successfully resolved chats
              </p>
            </div>

            <div className="mt-4 md:mt-0 text-right">
              <div className="text-4xl font-bold">
                {overview.resolutionRate}%
              </div>
              <p className="text-white/80 text-sm">
                {overview.resolvedChats} of{" "}
                {overview.totalChats} chats resolved
              </p>
            </div>
          </div>

          <div className="mt-6 bg-white/30 rounded-full h-3">
            <div
              className="bg-white h-3 rounded-full transition-all"
              style={{
                width: `${overview.resolutionRate}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* ---------------- Charts ---------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PopularCategories categories={categories} />
        <HourlyActivityChart hourly={hourly} />
      </div>

      {/* ---------------- Summary ---------------- */}
      <div className="bg-[#fef6f5] p-6 rounded-2xl border border-[#f09188]/30">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Performance Summary
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border">
            <div className="flex items-center gap-3">
              <TrendingUp className="text-[#e76458]" size={20} />
              <div>
                <p className="text-sm text-gray-600">
                  Response Time Trend
                </p>
                <p className="font-bold text-gray-800">Improving</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border">
            <p className="text-sm text-gray-600">Avg Chats / Hour</p>
            <p className="text-lg font-bold text-gray-800">
              {hourly.length
                ? Math.round(
                    hourly.reduce((s, h) => s + h.chats, 0) /
                      hourly.length
                  )
                : 0}
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border">
            <p className="text-sm text-gray-600">Top Category</p>
            <p className="text-lg font-bold text-gray-800">
              {categories[0]?.category || "N/A"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
