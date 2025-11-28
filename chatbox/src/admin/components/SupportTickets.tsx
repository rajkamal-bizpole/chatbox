// components/SupportTickets.tsx
import React from 'react';

const SupportTickets: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Support Tickets</h1>
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
        <div className="text-6xl mb-4">🎫</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Support Tickets</h3>
        <p className="text-gray-600">View and manage escalated support tickets from chat sessions</p>
      </div>
    </div>
  );
};

export default SupportTickets;