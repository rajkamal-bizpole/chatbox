import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  BarChart3, 
  MessageSquare, 
  CheckCircle, 
  Clock,
  TrendingUp,
  PieChart,
  Activity
} from "lucide-react";

interface Overview {
  totalChats: number;
  resolvedChats: number;
  averageResponseTime: string;
  unresolvedChats?: number;
  resolutionRate?: number;
}

interface Category {
  category: string;
  count: number;
}

interface HourActivity {
  hour: string;
  chats: number;
}

const http = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true,
});

const AnalyticsPage = () => {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [hourly, setHourly] = useState<HourActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const [overviewRes, categoriesRes, hourlyRes] = await Promise.all([
        http.get("/api/admin/analytics/overview"),
        http.get("/api/admin/analytics/popular-categories"),
        http.get("/api/admin/analytics/hourly-activity")
      ]);

      const overviewData = overviewRes.data;
      const categoriesData = categoriesRes.data.categories || [];
      const hourlyData = hourlyRes.data.hourlyActivity || [];

      // Calculate additional metrics
      if (overviewData) {
        const total = overviewData.totalChats || 0;
        const resolved = overviewData.resolvedChats || 0;
        const unresolved = total - resolved;
        const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

        setOverview({
          ...overviewData,
          unresolvedChats: unresolved,
          resolutionRate
        });
      }

      setCategories(categoriesData);
      
      // Sort hourly data properly
      const sortedHourly = [...hourlyData].sort((a, b) => {
        const hourA = parseInt(a.hour.split(' ')[0]);
        const hourB = parseInt(b.hour.split(' ')[0]);
        const isPM_A = a.hour.includes('PM') && hourA !== 12;
        const isPM_B = b.hour.includes('PM') && hourB !== 12;
        const timeA = hourA + (isPM_A ? 12 : 0);
        const timeB = hourB + (isPM_B ? 12 : 0);
        return timeA - timeB;
      });
      
      setHourly(sortedHourly);
    } catch (err: any) {
      console.error("Analytics Load Error:", err);
      setError(err.response?.data?.message || "Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const getMaxChats = () => {
    if (hourly.length === 0) return 1;
    return Math.max(...hourly.map(h => h.chats));
  };

  const getCategoryColors = (index: number) => {
    const colors = [
      "#e76458", "#f09188", "#f8b4b0", "#f5a6a1", 
      "#f09188", "#e76458", "#f8b4b0", "#f5a6a1",
      "#e76458", "#f09188"
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#f09188] border-t-[#e76458] rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center p-8 bg-[#fef6f5] rounded-xl border border-[#f09188] max-w-md">
          <div className="w-12 h-12 bg-[#f09188] rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity className="text-white" size={24} />
          </div>
          <h3 className="text-lg font-semibold text-[#e76458] mb-2">Error Loading Data</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-[#e76458] text-white rounded-lg hover:bg-[#f09188] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">Monitor chat performance and user activity</p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="px-4 py-2 bg-gradient-to-r from-[#e76458] to-[#f09188] text-white rounded-lg hover:opacity-90 transition-all flex items-center gap-2 self-start md:self-center"
        >
          <Activity size={18} />
          Refresh Data
        </button>
      </div>

      {/* Top Stats */}
      {overview && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Chats" 
            value={overview.totalChats.toString()} 
            change="+12.5%" 
            icon={<MessageSquare className="text-[#e76458]" size={24} />}
            color="primary"
          />
          <StatCard 
            title="Resolved Chats" 
            value={overview.resolvedChats.toString()} 
            change="+8.2%" 
            icon={<CheckCircle className="text-[#38a169]" size={24} />}
            color="success"
          />
          <StatCard 
            title="Unresolved Chats" 
            value={overview.unresolvedChats?.toString() || "0"} 
            change="-4.3%" 
            icon={<MessageSquare className="text-[#e76458]" size={24} />}
            color="warning"
          />
          <StatCard 
            title="Avg Response Time" 
            value={overview.averageResponseTime} 
            change="-15%" 
            icon={<Clock className="text-[#f09188]" size={24} />}
            color="accent"
          />
        </div>
      )}

      {/* Resolution Rate Card */}
      {overview && (
        <div className="bg-gradient-to-r from-[#e76458] to-[#f09188] rounded-2xl p-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Chat Resolution Rate</h3>
              <p className="text-white/90">Percentage of successfully resolved chats</p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="text-4xl font-bold">{overview.resolutionRate || 0}%</div>
              <p className="text-white/80 text-sm mt-1">
                {overview.resolvedChats} of {overview.totalChats} chats resolved
              </p>
            </div>
          </div>
          <div className="mt-6 bg-white/30 rounded-full h-3">
            <div 
              className="bg-white h-3 rounded-full transition-all duration-500"
              style={{ width: `${overview.resolutionRate || 0}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Categories */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-800">Popular Categories</h3>
              <p className="text-gray-600 text-sm mt-1">Most frequent chat topics</p>
            </div>
            <PieChart className="text-[#e76458]" size={20} />
          </div>

          <div className="space-y-4">
            {categories.map((c, index) => {
              const maxCount = categories[0]?.count || 1;
              const percentage = Math.round((c.count / maxCount) * 100);
              
              return (
                <div key={c.category} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">{c.category}</span>
                    <span className="text-gray-900 font-semibold">{c.count}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full flex-shrink-0">
                      <div className="w-full h-full rounded-full" style={{ backgroundColor: getCategoryColors(index) }}></div>
                    </div>
                    <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                      <div
                        className="h-2.5 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: getCategoryColors(index)
                        }}
                      ></div>
                    </div>
                    <span className="text-gray-600 text-sm w-12 text-right">{percentage}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hourly Activity */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-800">Hourly Activity</h3>
              <p className="text-gray-600 text-sm mt-1">Chat volume throughout the day</p>
            </div>
            <BarChart3 className="text-[#e76458]" size={20} />
          </div>

          <div className="h-64 flex items-end justify-between gap-2 px-4 border-b border-gray-200">
            {hourly.map((h, index) => {
              const maxChats = getMaxChats();
              const heightPercentage = (h.chats / maxChats) * 100;
              
              return (
                <div key={h.hour} className="flex flex-col items-center flex-1 group">
                  <div className="relative">
                    <div
                      className="w-full rounded-t-lg transition-all duration-300 hover:opacity-90"
                      style={{ 
                        height: `${Math.max(heightPercentage * 0.9, 10)}px`,
                        background: `linear-gradient(to top, #e76458, #f09188)`
                      }}
                    ></div>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-[#e76458] text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {h.chats} chats
                    </div>
                  </div>
                  <div className="mt-3 text-center">
                    <span className="text-xs text-gray-600 font-medium">{h.hour}</span>
                    <div className="text-xs text-[#e76458] font-semibold mt-1">{h.chats}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex justify-center">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#e76458] rounded"></div>
                <span>Chat Volume</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#f09188] rounded"></div>
                <span>Peak Hours</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-[#fef6f5] p-6 rounded-2xl border border-[#f09188]/30">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#fef6f5] rounded-lg flex items-center justify-center">
                <TrendingUp className="text-[#e76458]" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Response Time Trend</p>
                <p className="text-lg font-bold text-gray-800">Improving</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#fef6f5] rounded-lg flex items-center justify-center">
                <MessageSquare className="text-[#e76458]" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg. Chats per Hour</p>
                <p className="text-lg font-bold text-gray-800">
                  {hourly.length > 0 
                    ? Math.round(hourly.reduce((sum, h) => sum + h.chats, 0) / hourly.length)
                    : 0
                  }
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#fef6f5] rounded-lg flex items-center justify-center">
                <CheckCircle className="text-[#e76458]" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Top Category</p>
                <p className="text-lg font-bold text-gray-800">
                  {categories[0]?.category || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ 
  title, 
  value, 
  change, 
  icon, 
  color = "primary" 
}: { 
  title: string; 
  value: string; 
  change?: string; 
  icon: React.ReactNode;
  color?: string;
}) => {
  const colorClasses = {
    primary: "bg-[#fef6f5] border-[#f09188]",
    success: "bg-green-50 border-green-100",
    warning: "bg-[#fef6f5] border-[#f09188]",
    accent: "bg-[#fef6f5] border-[#f09188]",
  };

  const changeColor = change?.startsWith("+") ? "text-green-600" : "text-[#e76458]";

  return (
    <div className={`p-6 rounded-2xl border-2 ${colorClasses[color as keyof typeof colorClasses]} transition-transform hover:scale-[1.02]`}>
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
        <div className={`p-3 rounded-xl ${color === 'primary' || color === 'warning' || color === 'accent' ? 'bg-[#f09188]' : 'bg-green-100'}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;