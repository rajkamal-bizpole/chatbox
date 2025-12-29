
import React, { useState, useEffect } from 'react';
import { 
  
  Search, 
  UserCheck,
  UserX,
Activity,
MessageCircle,
  Shield,
  ChevronLeft,
  ChevronRight,
  CheckCircle
} from 'lucide-react';
import {
  getChatSessions,
  getChatSessionDetails,
} from '../api/chat.api';

import ChatSessionsTable from "../components/ChatSessionsTable";

import type { ChatSession, Message, SupportTicket } from '../types/chat.type';

import { useChatFilters } from '../hooks/useChatFilters';
import ConversationModal from "../components/ConversationModal";

import PageHeader from "../../../../common/components/header/PageHeader";
import { MessageSquare, RefreshCw } from "lucide-react";

const ITEMS_PER_PAGE = 10;

const CustomerChats: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [sessionDetails, setSessionDetails] = useState<{
    messages: Message[];
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
  sortConfig,
  handleSort,
  filteredAndSortedSessions,
} = useChatFilters(sessions);

  const [currentPage, setCurrentPage] = useState(1);
  const [isConversationModalOpen, setIsConversationModalOpen] = useState(false);


  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
        const response = await getChatSessions();
      if (response.data.success) {
        setSessions(response.data.sessions);
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessionDetails = async (sessionId: number) => {
    try {
      const response = await getChatSessionDetails(sessionId);

      if (response.data.success) {
        setSessionDetails(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch session details:', error);
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
  const totalPages = Math.ceil(filteredAndSortedSessions
.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedSessions = filteredAndSortedSessions
.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-white">
        <div className="text-sm text-gray-700">
          Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredAndSortedSessions
.length)} of{' '}
          {filteredAndSortedSessions
.length} results
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                currentPage === page
                  ? 'bg-[#e76458] text-white'
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    );
  };

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
      <div className="max-w-7xl mx-auto">
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
        <div className="grid grid-cols-1 md:grid-rows-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Sessions</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {sessions.filter(s => s.status === 'active').length}
                </p>
              </div>
              <Activity className="text-green-500" size={24} />
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Escalated</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {sessions.filter(s => s.status === 'escalated').length}
                </p>
              </div>
              <Shield className="text-yellow-500" size={24} />
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Existing Customers</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {sessions.filter(s => s.is_existing_customer).length}
                </p>
              </div>
              <UserCheck className="text-blue-500" size={24} />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New Customers</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {sessions.filter(s => !s.is_existing_customer).length}
                </p>
              </div>
              <UserX className="text-gray-500" size={24} />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search sessions by customer, phone, email, or ticket..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#e76458] focus:ring-2 focus:ring-[#e76458]/20 transition-all duration-200"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            
            <div className="flex gap-3">
              <select
                className="px-4 py-3 rounded-xl border border-gray-200 focus:border-[#e76458] focus:ring-2 focus:ring-[#e76458]/20 transition-all duration-200 bg-white"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="escalated">Escalated</option>
                <option value="completed">Completed</option>
              </select>
              
              <select
                className="px-4 py-3 rounded-xl border border-gray-200 focus:border-[#e76458] focus:ring-2 focus:ring-[#e76458]/20 transition-all duration-200 bg-white"
                value={customerTypeFilter}
                onChange={(e) => {
                  setCustomerTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">All Customers</option>
                <option value="existing">Existing</option>
                <option value="new">New</option>
              </select>
              <select
  className="px-4 py-3 rounded-xl border border-gray-200 bg-white"
  value={departmentFilter}
  onChange={(e) => {
    setDepartmentFilter(e.target.value);
    setCurrentPage(1);
  }}
>
  <option value="all">All Departments</option>
  <option value="support">Support</option>
  <option value="sales">Sales</option>
  <option value="billing">Billing</option>
  <option value="technical">Technical</option>
  <option value="unassigned">Unassigned</option>
</select>

            </div>
          </div>
        </div>

        {/* Sessions Table */}
  
          
          {filteredAndSortedSessions
.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="mx-auto text-gray-400" size={48} />
              <p className="text-gray-500 mt-4 text-lg">No chat sessions found</p>
              <p className="text-gray-400 mt-2">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
             <ChatSessionsTable
  sessions={paginatedSessions}
  sortConfig={sortConfig}
  onSort={handleSort}
  onOpenConversation={openConversationModal}
/>
            </div>
          )}
          
          {/* Pagination */}
          {renderPagination()}
        </div>

        {/* Conversation Modal */}
        <ConversationModal
  open={isConversationModalOpen}
  session={selectedSession}
  sessionDetails={sessionDetails}
  onClose={closeConversationModal}
/>

      </div>
   
  );
};

export default CustomerChats;