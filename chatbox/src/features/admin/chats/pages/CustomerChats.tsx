
import React, { useState, useEffect } from 'react';

import {
  getChatSessions,
  getChatSessionDetails,
} from '../api/chat.api';


import type { ChatUIMessage } from "../../../../common/types/chat-ui.types";
import type { ChatSession, Message, SupportTicket } from '../types/chat.type';

import { useChatFilters } from '../hooks/useChatFilters';

import ChatModalBase from "../../../../common/components/chatModel/ChatModalBase";

import PageHeader from "../../../../common/components/header/PageHeader";
import { MessageSquare} from "lucide-react";
import StatsBar from "../../../../common/components/stats/StatsBar";
import { buildChatStats } from "../utils/stats";
import FilterBar from "../../../../common/components/filter/FilterBar";
import DataTable from "../../../../common/components/table/DataTable";
import { chatColumns } from "../utils/chatColumns";
import Pagination from "../../../../common/components/pagination/Pagination";
const ITEMS_PER_PAGE = 10;

const CustomerChats: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
const [sessionDetails, setSessionDetails] = useState<{
  messages: ChatUIMessage[];
  tickets: SupportTicket[];
} | null>(null);

  const [loading, setLoading] = useState(true);



const {
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  customerTypeFilter,
  setCustomerTypeFilter,
  departmentFilter,
  setDepartmentFilter,
  filteredAndSortedSessions,
} = useChatFilters(sessions);
useEffect(() => {
  setCurrentPage(1);
}, [searchTerm, statusFilter, customerTypeFilter, departmentFilter]);

  const [currentPage, setCurrentPage] = useState(1);
  const [isConversationModalOpen, setIsConversationModalOpen] = useState(false);


  useEffect(() => {
    fetchSessions();
  }, []);

const fetchSessions = async () => {
  try {
    setLoading(true);
    const response = await getChatSessions();
    if (response.data.success) {
      setSessions(response.data.sessions);
    }
  } catch (error) {
    console.error("Failed to fetch sessions:", error);
  } finally {
    setLoading(false);
  }
};

const fetchSessionDetails = async (sessionId: number) => {
  try {
    const response = await getChatSessionDetails(sessionId);

    if (response.data.success) {
      const normalizedMessages: ChatUIMessage[] =
        response.data.messages.map((m: any) => ({
          role: m.message_type === "user" ? "user" : "bot",
          text: m.content,
          timestamp: m.created_at,
          meta: m.step,
        }));

      setSessionDetails({
        messages: normalizedMessages,
        tickets: response.data.tickets,
      });
    }
  } catch (error) {
    console.error("Failed to fetch session details:", error);
  }
};
  const openConversationModal = async (session: ChatSession) => {
    setSelectedSession(session);
    setIsConversationModalOpen(true);
    await fetchSessionDetails(session.id);
  };

  const closeConversationModal = () => {
    setIsConversationModalOpen(false);
    setSelectedSession(null);
    setSessionDetails(null);
  };


  
  // Pagination calculations

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedSessions = filteredAndSortedSessions
.slice(startIndex, startIndex + ITEMS_PER_PAGE);

 

 

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e76458] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-5">
        {/* Header */}
<PageHeader
  title="Chat Support Admin"
  subtitle="Monitor and manage customer chat sessions"
  rightContent={
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center gap-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {sessions.length}
          </div>
          <div className="text-sm text-gray-500">
            Total Sessions
          </div>
        </div>

        <div className="h-10 w-px bg-gray-200" />

        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {sessions.filter(s => s.status === "active").length}
          </div>
          <div className="text-sm text-gray-500">
            Active
          </div>
        </div>
      </div>
    </div>
  }

/>


        {/* Stats Cards */}
       <StatsBar items={buildChatStats(sessions)} />

        {/* Filters and Search */}
     <FilterBar
  filters={[
    {
      key: "search",
      type: "search",
      value: searchTerm,
      placeholder: "Search customer, phone, email or ticket",
      onChange: setSearchTerm,
    },
    {
      key: "status",
      type: "select",
      value: statusFilter,
      onChange: setStatusFilter,
      options: [
        { label: "All Status", value: "all" },
        { label: "Active", value: "active" },
        { label: "Escalated", value: "escalated" },
        { label: "Completed", value: "completed" },
      ],
    },
    {
      key: "customerType",
      type: "select",
      value: customerTypeFilter,
      onChange: setCustomerTypeFilter,
      options: [
        { label: "All Customers", value: "all" },
        { label: "Existing", value: "existing" },
        { label: "New", value: "new" },
      ],
    },
    {
      key: "department",
      type: "select",
      value: departmentFilter,
      onChange: setDepartmentFilter,
      options: [
        { label: "All Departments", value: "all" },
        { label: "Support", value: "support" },
        { label: "Sales", value: "sales" },
        { label: "Billing", value: "billing" },
      ],
    },
  ]}
  onReset={() => {
    setSearchTerm("");
    setStatusFilter("all");
    setCustomerTypeFilter("all");
    setDepartmentFilter("all");
  }}
/>

        {/* Sessions Table */}
  
          
          {filteredAndSortedSessions
.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="mx-auto text-gray-400" size={48} />
              <p className="text-gray-500 mt-4 text-lg">No chat sessions found</p>
              <p className="text-gray-400 mt-2">Try adjusting your search or filters</p>
            </div>
          ) : (
           
<DataTable
  data={paginatedSessions}
  columns={chatColumns(openConversationModal)}
  emptyMessage="No chat sessions found"
  onRowClick={openConversationModal}
/>

          )}
          
      <Pagination
  page={currentPage}
  pageSize={ITEMS_PER_PAGE}
  total={filteredAndSortedSessions.length}
  onChange={setCurrentPage}
/>
        </div>

        {/* Conversation Modal */}
 <ChatModalBase
  open={isConversationModalOpen}
  title={`Conversation with ${
    selectedSession?.customer_name ||
    selectedSession?.phone ||
    "Anonymous User"
  }`}
  subtitle={`Status: ${selectedSession?.status}`}
  messages={sessionDetails?.messages ?? null}
  onClose={closeConversationModal}
  footer={
    sessionDetails?.tickets.length ? (
      <div className="p-4 bg-gray-50 border-t">
        <h3 className="font-semibold mb-3">
          Support Tickets ({sessionDetails.tickets.length})
        </h3>
        <div className="grid gap-2 max-h-40 overflow-y-auto">
          {sessionDetails.tickets.map((t) => (
            <div
              key={t.id}
              className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm"
            >
              <div className="font-medium">{t.ticket_number}</div>
              <div className="text-yellow-700">
                {t.issue_type} – {t.sub_issue}
              </div>
            </div>
          ))}
        </div>
      </div>
    ) : null
  }
/>


      </div>
   
  );
};

export default CustomerChats;