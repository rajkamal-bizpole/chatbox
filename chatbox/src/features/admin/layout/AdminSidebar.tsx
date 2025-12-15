// admin/components/AdminSidebar.tsx
import React from "react";
import type { AdminTab } from "../../../types/admin";

interface AdminSidebarProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onTabChange,
}) => {
  const menuItems = [
    { id: "analytics" as AdminTab, label: "Analytics Dashboard", icon: "📊" },
    { id: "users" as AdminTab, label: "User Management", icon: "👥" },
    { id: "tickets" as AdminTab, label: "Support Tickets", icon: "🎫" },
    { id: "chats" as AdminTab, label: "Customer Chats", icon: "💬" },
    { id: "chatflows" as AdminTab, label: "Chat Manager", icon: "⚙️" },
    { id: "departments" as AdminTab, label: "Departments", icon: "🏢" },
  ];

  return (
    <div className="w-64 bg-gradient-to-b from-[#e76458] to-[#d4594e] text-white shadow-xl flex flex-col">
      
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <img
            src="chatlogo.png"
            alt="BizAssist Admin"
            className="w-10 h-10 object-contain drop-shadow"
          />
          <div>
            <h1 className="text-xl font-bold tracking-wide">BizAssist</h1>
            <p className="text-white/70 text-sm">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 flex-1">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onTabChange(item.id)}
                className={`relative w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group overflow-hidden ${
                  activeTab === item.id
                    ? "bg-white/20 text-white shadow-lg"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="text-xl group-hover:scale-110 transition-transform">
                  {item.icon}
                </span>
                <span className="font-medium tracking-wide">
                  {item.label}
                </span>

                {/* Active highlight bar */}
                {activeTab === item.id && (
                  <span className="absolute left-0 top-0 h-full w-1 bg-white rounded-r-lg"></span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10 text-center text-white/60 text-sm">
        © {new Date().getFullYear()} BizAssist
      </div>
    </div>
  );
};

export default AdminSidebar;
