
import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Users, 
  Phone, 
  Mail, 
  Clock, 
  Search, 
  ChevronDown, 
  ChevronUp,
  UserCheck,
  UserX,
  Ticket,
  Activity,
  Calendar,
  MessageCircle,
  Shield,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle
} from 'lucide-react';
import http from '../../../api/http';

interface ChatSession {
  id: number;
  session_token: string;
  phone: string;
  status: string;
  username: string;
  email: string;
  message_count: number;
  last_activity: string;
  latest_ticket: string;
  created_at: string;
  customer_name: string;
  is_existing_customer: boolean;
   department: string;
}

interface Message {
  id: number;
  content: string;
  message_type: 'user' | 'bot';
  created_at: string;
  step: string;
}

interface SupportTicket {
  id: number;
  ticket_number: string;
  priority: string;
  issue_type: string;
  sub_issue: string;
  status: string;
}

const ITEMS_PER_PAGE = 10;

const CustomerChats: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [sessionDetails, setSessionDetails] = useState<{
    messages: Message[];
    tickets: SupportTicket[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [customerTypeFilter, setCustomerTypeFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ 
    key: 'last_activity', 
    direction: 'desc' 
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [isConversationModalOpen, setIsConversationModalOpen] = useState(false);
const [departmentFilter, setDepartmentFilter] = useState('all');

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await http.get('/api/chat/admin/sessions');
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
      const response = await http.get(`/api/chat/admin/session/${sessionId}`);
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

  const getDisplayName = (session: ChatSession) => {
    if (session.is_existing_customer) {
      return session.customer_name || session.phone || session.email || 'Existing Customer';
    } else {
      return 'Anonymous User';
    }
  };

  const handleSort = (key: string) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
    setCurrentPage(1);
  };

  const getSortedSessions = () => {
    const filtered = sessions.filter(session => {
      const matchesSearch = 
        getDisplayName(session).toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.latest_ticket?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || session.status === statusFilter;
      const matchesCustomerType = 
        customerTypeFilter === 'all' || 
        (customerTypeFilter === 'existing' && session.is_existing_customer) ||
        (customerTypeFilter === 'new' && !session.is_existing_customer);
      
      return matchesSearch && matchesStatus && matchesCustomerType;
    });

    return filtered.sort((a, b) => {
      let aValue = a[sortConfig.key as keyof ChatSession];
      let bValue = b[sortConfig.key as keyof ChatSession];

      if (sortConfig.key === 'last_activity' || sortConfig.key === 'created_at') {
        aValue = new Date(aValue as string).getTime();
        bValue = new Date(bValue as string).getTime();
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Activity size={16} className="text-green-500" />;
      case 'escalated': return <Shield size={16} className="text-yellow-500" />;
      case "completed":
  return <CheckCircle size={16} className="text-blue-600" />;

      default: return <MessageCircle size={16} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'escalated': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case "completed":
  return "bg-blue-100 text-blue-800 border-blue-200";

      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const sortedSessions = getSortedSessions();
  
  // Pagination calculations
  const totalPages = Math.ceil(sortedSessions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedSessions = sortedSessions.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-white">
        <div className="text-sm text-gray-700">
          Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, sortedSessions.length)} of{' '}
          {sortedSessions.length} results
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
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100">
              <MessageSquare className="text-[#e76458]" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Chat Support Admin</h1>
              <p className="text-gray-600 mt-1">Monitor and manage customer chat sessions</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{sessions.length}</div>
                  <div className="text-sm text-gray-500">Total Sessions</div>
                </div>
                <div className="h-8 w-px bg-gray-200"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {sessions.filter(s => s.status === 'active').length}
                  </div>
                  <div className="text-sm text-gray-500">Active</div>
                </div>
              </div>
            </div>
          </div>
        </div>

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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Users size={20} />
              Chat Sessions ({sortedSessions.length})
            </h2>
          </div>
          
          {sortedSessions.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="mx-auto text-gray-400" size={48} />
              <p className="text-gray-500 mt-4 text-lg">No chat sessions found</p>
              <p className="text-gray-400 mt-2">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {[
                      { key: 'customer_name', label: 'Customer' },
                      { key: 'phone', label: 'Contact' },
                      { key: 'status', label: 'Status' },
                      { key: 'message_count', label: 'Messages' },
                      { key: 'last_activity', label: 'Last Activity' },
                      { key: 'is_existing_customer', label: 'Type' },
                      { key: 'latest_ticket', label: 'Ticket' },
                      { key: 'department', label: 'Department' }

                    ].map(({ key, label }) => (
                      <th 
                        key={key}
                        className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort(key)}
                      >
                        <div className="flex items-center gap-1">
                          {label}
                          {sortConfig.key === key && (
                            sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedSessions.map((session) => {
                    const { date, time } = formatDateTime(session.last_activity);
                    
                    return (
                      <tr key={session.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              session.is_existing_customer ? 'bg-blue-100' : 'bg-gray-100'
                            }`}>
                              {session.is_existing_customer ? 
                                <UserCheck size={16} className="text-blue-600" /> : 
                                <UserX size={16} className="text-gray-600" />
                              }
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {getDisplayName(session)}
                              </div>
                              {session.is_existing_customer && session.customer_name && (
                                <div className="text-xs text-green-600 flex items-center gap-1 mt-1">
                                  <UserCheck size={12} />
                                  Verified Customer
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            {session.phone && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Phone size={14} />
                                {session.phone}
                              </div>
                            )}
                            {session.email && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Mail size={14} />
                                {session.email}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(session.status)}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(session.status)}`}>
                              {session.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => openConversationModal(session)}
                            className="flex items-center gap-2 text-sm text-gray-900 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-all duration-200 group cursor-pointer"
                          >
                            <MessageSquare size={16} className="text-gray-400 group-hover:text-blue-500 group-hover:scale-110 transition-transform" />
                            <span className="font-medium group-hover:text-blue-700">
                              {session.message_count}
                            </span>
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar size={14} />
                              {date}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Clock size={12} />
                              {time}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                            session.is_existing_customer 
                              ? 'bg-blue-100 text-blue-800 border-blue-200' 
                              : 'bg-gray-100 text-gray-800 border-gray-200'
                          }`}>
                            {session.is_existing_customer ? 'Existing' : 'New'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {session.latest_ticket ? (
                            <div className="flex items-center gap-2 text-blue-600">
                              <Ticket size={16} />
                              <span className="text-sm font-medium">{session.latest_ticket}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">No ticket</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
  <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
    {session.department || 'Unassigned'}
  </span>
</td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Pagination */}
          {renderPagination()}
        </div>

        {/* Conversation Modal */}
        {isConversationModalOpen && selectedSession && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    selectedSession.is_existing_customer ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    {selectedSession.is_existing_customer ? 
                      <UserCheck size={20} className="text-blue-600" /> : 
                      <UserX size={20} className="text-gray-600" />
                    }
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Conversation with {getDisplayName(selectedSession)}
                    </h2>
                    <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                      <Calendar size={14} />
                      Started: {formatDateTime(selectedSession.created_at).date} at {formatDateTime(selectedSession.created_at).time}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
                      selectedSession.is_existing_customer 
                        ? 'bg-blue-100 text-blue-800 border-blue-200' 
                        : 'bg-gray-100 text-gray-800 border-gray-200'
                    }`}>
                      {selectedSession.is_existing_customer ? 'Existing Customer' : 'New Customer'}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedSession.status)}`}>
                      {selectedSession.status}
                    </span>
                  </div>
                  <button
                    onClick={closeConversationModal}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex flex-col h-[calc(90vh-120px)]">
                {/* Conversation History */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {sessionDetails ? (
                    sessionDetails.messages.length > 0 ? (
                      sessionDetails.messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.message_type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] p-4 rounded-2xl ${
                              message.message_type === 'user' 
                                ? 'bg-blue-500 text-white rounded-br-none' 
                                : 'bg-gray-100 text-gray-900 rounded-bl-none'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <div className={`flex items-center gap-2 mt-2 text-xs ${
                              message.message_type === 'user' ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              <Clock size={12} />
                              {new Date(message.created_at).toLocaleTimeString()}
                              <span className="px-2 py-0.5 bg-black bg-opacity-20 rounded">
                                {message.step}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <MessageSquare size={48} className="mx-auto mb-4 text-gray-300" />
                        <p>No messages found in this conversation</p>
                      </div>
                    )
                  ) : (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e76458] mx-auto"></div>
                      <p className="mt-2 text-gray-600">Loading conversation...</p>
                    </div>
                  )}
                </div>

                {/* Support Tickets Section */}
                {sessionDetails && sessionDetails.tickets.length > 0 && (
                  <div className="border-t border-gray-200 p-6 bg-gray-50">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Ticket size={18} />
                      Support Tickets ({sessionDetails.tickets.length})
                    </h3>
                    <div className="grid gap-3 max-h-40 overflow-y-auto">
                      {sessionDetails.tickets.map((ticket) => (
                        <div key={ticket.id} className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Ticket size={16} className="text-yellow-600" />
                              <span className="font-medium text-yellow-800">{ticket.ticket_number}</span>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              ticket.priority === 'high' ? 'bg-red-100 text-red-800' :
                              ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {ticket.priority}
                            </span>
                          </div>
                          <div className="text-sm text-yellow-700 space-y-1">
                            <p><strong>Issue:</strong> {ticket.issue_type} - {ticket.sub_issue}</p>
                            <p><strong>Status:</strong> {ticket.status}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerChats;