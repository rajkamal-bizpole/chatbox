// admin/components/ChatAnalytics.tsx
import React from 'react';

interface AnalyticsData {
  totalChats: number;
  resolvedChats: number;
  averageResponseTime: string;
  popularCategories: { category: string; count: number }[];
  hourlyActivity: { hour: string; chats: number }[];
}

const ChatAnalytics: React.FC = () => {
  const analyticsData: AnalyticsData = {
    totalChats: 1247,
    resolvedChats: 1123,
    averageResponseTime: '2.3 minutes',
    popularCategories: [
      { category: 'Payment Issues', count: 345 },
      { category: 'Login Problems', count: 287 },
      { category: 'Technical Support', count: 198 },
      { category: 'Billing Query', count: 156 },
      { category: 'Product Support', count: 123 },
    ],
    hourlyActivity: [
      { hour: '9 AM', chats: 45 },
      { hour: '10 AM', chats: 78 },
      { hour: '11 AM', chats: 92 },
      { hour: '12 PM', chats: 85 },
      { hour: '1 PM', chats: 67 },
      { hour: '2 PM', chats: 89 },
      { hour: '3 PM', chats: 76 },
      { hour: '4 PM', chats: 63 },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Chat Analytics Dashboard</h1>
        <div className="text-sm text-gray-500">Last updated: Today, 3:45 PM</div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Chats</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{analyticsData.totalChats}</p>
            </div>
            <div className="w-12 h-12 bg-[#e76458]/10 rounded-full flex items-center justify-center">
              <span className="text-2xl text-[#e76458]">💬</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Resolved</span>
              <span className="text-green-600 font-semibold">{analyticsData.resolvedChats}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Avg. Response Time</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{analyticsData.averageResponseTime}</p>
            </div>
            <div className="w-12 h-12 bg-[#e76458]/10 rounded-full flex items-center justify-center">
              <span className="text-2xl text-[#e76458]">⏱️</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">Industry avg: 3.1m</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Resolution Rate</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">
                {((analyticsData.resolvedChats / analyticsData.totalChats) * 100).toFixed(1)}%
              </p>
            </div>
            <div className="w-12 h-12 bg-[#e76458]/10 rounded-full flex items-center justify-center">
              <span className="text-2xl text-[#e76458]">✅</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-sm text-green-600 font-semibold">+5.2% from last week</div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Categories */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Popular Chat Categories</h3>
          <div className="space-y-4">
            {analyticsData.popularCategories.map((category, index) => (
              <div key={category.category} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    index === 0 ? 'bg-[#e76458]' : 
                    index === 1 ? 'bg-[#f09188]' : 
                    index === 2 ? 'bg-[#f8b4af]' : 
                    'bg-gray-300'
                  }`}></div>
                  <span className="text-gray-700">{category.category}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        index === 0 ? 'bg-[#e76458]' : 
                        index === 1 ? 'bg-[#f09188]' : 
                        index === 2 ? 'bg-[#f8b4af]' : 
                        'bg-gray-400'
                      }`}
                      style={{ width: `${(category.count / analyticsData.popularCategories[0].count) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-gray-600 text-sm font-medium w-8">{category.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hourly Activity */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Hourly Chat Activity</h3>
          <div className="flex items-end justify-between h-40 space-x-2">
            {analyticsData.hourlyActivity.map((hour, index) => (
              <div key={hour.hour} className="flex flex-col items-center flex-1">
                <div 
                  className="w-full bg-gradient-to-t from-[#e76458] to-[#f09188] rounded-t transition-all duration-300 hover:opacity-80"
                  style={{ height: `${(hour.chats / 100) * 120}px` }}
                ></div>
                <span className="text-xs text-gray-600 mt-2">{hour.hour}</span>
                <span className="text-xs font-semibold text-gray-800">{hour.chats}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatAnalytics;