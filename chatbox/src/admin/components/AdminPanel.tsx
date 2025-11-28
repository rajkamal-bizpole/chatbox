// admin/components/AdminPanel.tsx
import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import ChatAnalytics from './ChatAnalytics';
import ChatLogs from './ChatLogs';
import UserManagement from './UserManagement';
import SupportTickets from './SupportTickets';
import type { AdminTab } from '../../types/admin'; // Add 'type' keyword
import  CustomerChats from './CustomerChats';
import ChatFlowManager from './ChatFlowManager';

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('analytics');

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
          return <CustomerChats/>
                  case 'chatflows':
          return <ChatFlowManager/>
      default:
        return <ChatAnalytics />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;