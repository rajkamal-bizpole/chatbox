// admin/components/AdminSidebar.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import type { AdminTab } from '../../types/admin';

interface AdminSidebarProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, onTabChange }) => {
  const menuItems = [
    { id: 'analytics' as AdminTab, label: 'Analytics Dashboard', icon: '📊' },
    { id: 'chat-logs' as AdminTab, label: 'Chat Logs', icon: '💬' },
    { id: 'users' as AdminTab, label: 'User Management', icon: '👥' },
    { id: 'tickets' as AdminTab, label: 'Support Tickets', icon: '🎫' },
        { id: 'chats' as AdminTab, label: 'Customer Chats', icon: '🎫' },
        { id: 'chatflows' as AdminTab, label: 'Chat Manager', icon: '🎫' },
         { id: 'departments' as AdminTab, label: 'Departments', icon: '🎫' },
  ];

  return (
    <div className="w-64 bg-gradient-to-b from-[#e76458] to-[#d4594e] text-white shadow-xl">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <img 
            src="chatlogo.png" 
            alt="BizAssist Admin" 
            className="w-10 h-10 object-contain"
          />
          <div>
            <h1 className="text-xl font-bold">BizAssist</h1>
            <p className="text-white/70 text-sm">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeTab === item.id
                    ? 'bg-white/20 text-white shadow-lg'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>

 
      </nav>

      {/* Stats Summary */}
      <div className="p-4 border-t border-white/10 mt-4">
        <div className="bg-white/10 rounded-lg p-4">
          <h3 className="font-semibold text-white/90 text-sm mb-3">Quick Stats</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/70">Active Chats</span>
              <span className="text-white font-semibold">12</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/70">Resolved Today</span>
              <span className="text-white font-semibold">47</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/70">Avg. Response</span>
              <span className="text-white font-semibold">2.3m</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;