// admin/components/AdminPanel.tsx
import React, { useEffect, useState } from 'react';
import AdminSidebar from './AdminSidebar';
import ChatAnalytics from '../analytics/ChatAnalytics';

import UserManagement from '../users/UserManagement';
import SupportTickets from '../tickets/pages/SupportTicketsPage';
import type { AdminTab } from '../../../types/admin';
import CustomerChats from '../chats/pages/CustomerChats';
import ChatFlowManager from '../flows/pages/ChatBuilderAdmin';
import DepartmentRequests from '../departments/pages/DepartmentRequestsPage';

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
