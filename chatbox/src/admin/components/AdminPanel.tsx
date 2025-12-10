// admin/components/AdminPanel.tsx
import React, { useEffect, useState } from 'react';
import AdminSidebar from './AdminSidebar';
import ChatAnalytics from './ChatAnalytics';
import ChatLogs from './ChatLogs';
import UserManagement from './UserManagement';
import SupportTickets from './SupportTickets';
import type { AdminTab } from '../../types/admin';
import CustomerChats from './CustomerChats';
import ChatFlowManager from './ChatFlowManager';
import DepartmentRequests from './DepartmentRequests';

const AdminPanel: React.FC = () => {

  // ✅ Load from localStorage BEFORE the first render
  const [activeTab, setActiveTab] = useState<AdminTab>(() => {
    return (localStorage.getItem("admin_active_tab") as AdminTab) || "analytics";
  });

  // ✅ Save to localStorage whenever updated
  useEffect(() => {
    localStorage.setItem("admin_active_tab", activeTab);
  }, [activeTab]);

  const renderContent = () => {
    switch (activeTab) {
      case 'analytics':
        return <ChatAnalytics />;
      case 'chat-logs':
        return <ChatLogs />;
      case 'users':
        return <UserManagement />;
      case 'tickets':
        return <SupportTickets />;
      case 'chats':
        return <CustomerChats />;
      case 'chatflows':
        return <ChatFlowManager />;
      case 'departments':
        return <DepartmentRequests />;
      default:
        return <ChatAnalytics />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 overflow-auto">
        <div className="p-6">{renderContent()}</div>
      </main>
    </div>
  );
};

export default AdminPanel;
