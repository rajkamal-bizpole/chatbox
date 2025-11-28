// components/ChatLogs.tsx
import React, { useState } from 'react';

interface ChatSession {
  id: string;
  userId: string;
  phone: string;
  issueType: string;
  subIssue?: string;
  startTime: Date;
  endTime: Date;
  duration: string;
  status: 'resolved' | 'escalated' | 'pending';
  messages: { sender: string; text: string; time: Date }[];
}

const ChatLogs: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState<ChatSession | null>(null);
  const [filter, setFilter] = useState<string>('all');

  // Mock data - in real app, this would come from your backend
  const chatSessions: ChatSession[] = [
    {
      id: 'CHAT-001',
      userId: 'USER-123',
      phone: '9876543210',
      issueType: 'Payment Issues',
      subIssue: 'Payment Failed',
      startTime: new Date('2024-01-15T10:30:00'),
      endTime: new Date('2024-01-15T10:45:00'),
      duration: '15m',
      status: 'resolved',
      messages: [
        { sender: 'user', text: "My payment failed", time: new Date('2024-01-15T10:30:00') },
        { sender: 'bot', text: "Let me help you with payment issues...", time: new Date('2024-01-15T10:31:00') },
      ]
    },
    {
      id: 'CHAT-002',
      userId: 'USER-456',
      phone: '8765432109',
      issueType: 'Login Problems',
      subIssue: 'Forgot Password',
      startTime: new Date('2024-01-15T11:15:00'),
      endTime: new Date('2024-01-15T11:25:00'),
      duration: '10m',
      status: 'resolved',
      messages: [
        { sender: 'user', text: "I forgot my password", time: new Date('2024-01-15T11:15:00') },
        { sender: 'bot', text: "Let's reset your password...", time: new Date('2024-01-15T11:16:00') },
      ]
    },
    // Add more mock sessions as needed
  ];

  const filteredChats = filter === 'all' 
    ? chatSessions 
    : chatSessions.filter(chat => chat.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Chat Logs</h1>
        <div className="flex space-x-2">
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#e76458]"
          >
            <option value="all">All Status</option>
            <option value="resolved">Resolved</option>
            <option value="escalated">Escalated</option>
            <option value="pending">Pending</option>
          </select>
          <input
            type="text"
            placeholder="Search chats..."
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#e76458]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat List */}
        <div className="lg:col-span-1 space-y-4">
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              className={`bg-white p-4 rounded-xl shadow-lg border cursor-pointer transition-all duration-200 hover:shadow-xl ${
                selectedChat?.id === chat.id ? 'border-[#e76458] ring-2 ring-[#e76458]/20' : 'border-gray-200'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-gray-800">{chat.issueType}</h3>
                  <p className="text-sm text-gray-600">{chat.subIssue}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  chat.status === 'resolved' ? 'bg-green-100 text-green-800' :
                  chat.status === 'escalated' ? 'bg-orange-100 text-orange-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {chat.status}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>{chat.phone}</span>
                <span>{chat.duration}</span>
              </div>
              <div className="text-xs text-gray-400 mt-2">
                {chat.startTime.toLocaleDateString()} • {chat.startTime.toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>

        {/* Chat Details */}
        <div className="lg:col-span-2">
          {selectedChat ? (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{selectedChat.issueType}</h2>
                  <p className="text-gray-600">{selectedChat.subIssue}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Chat ID: {selectedChat.id}</div>
                  <div className="text-sm text-gray-500">User: {selectedChat.phone}</div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
                {selectedChat.messages.map((message, index) => (
                  <div
                    key={index}
                    className={`mb-4 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}
                  >
                    <div
                      className={`inline-block max-w-[80%] rounded-2xl px-4 py-2 ${
                        message.sender === 'user'
                          ? 'bg-[#e76458] text-white rounded-br-none'
                          : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender === 'user' ? 'text-white/70' : 'text-gray-500'
                      }`}>
                        {message.time.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Summary */}
              <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-gray-600">Start Time</div>
                  <div className="font-semibold text-gray-800">
                    {selectedChat.startTime.toLocaleTimeString()}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-gray-600">Duration</div>
                  <div className="font-semibold text-gray-800">{selectedChat.duration}</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-600">Status</div>
                  <div className={`font-semibold ${
                    selectedChat.status === 'resolved' ? 'text-green-600' :
                    selectedChat.status === 'escalated' ? 'text-orange-600' :
                    'text-yellow-600'
                  }`}>
                    {selectedChat.status}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Select a Chat</h3>
              <p className="text-gray-600">Choose a chat session from the list to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatLogs;