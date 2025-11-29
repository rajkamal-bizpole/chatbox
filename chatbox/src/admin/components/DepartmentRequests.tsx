import React, { useEffect, useState } from "react";
import http from "../../api/http";

interface DepartmentRequest {
  id: number;
  session_id: number;
  department: string;
  status: string;
  message: string;
  chat_logs: any;
  created_at: string;
}

const DepartmentRequests: React.FC = () => {
  const [requests, setRequests] = useState<DepartmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState<any | null>(null);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const res = await http.get("/api/admin/departments/requests");
      setRequests(res.data.requests || []);
    } catch (err) {
      console.error("Failed to load department requests", err);
    } finally {
      setLoading(false);
    }
  };

  const markResolved = async (id: number) => {
    try {
      await http.put(`/api/admin/departments/resolve/${id}`);
      loadRequests();
    } catch (err) {
      console.error("Failed to resolve", err);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  return (
    <div className="p-6">

      <h2 className="text-xl font-bold mb-4">Department Requests</h2>

      {loading ? (
        <p>Loading...</p>
      ) : requests.length === 0 ? (
        <p>No requests found.</p>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req.id}
              className="border rounded-lg p-4 bg-white shadow-sm"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-lg">{req.department}</h3>
                  <p className="text-gray-600 text-sm">
                    Created: {new Date(req.created_at).toLocaleString()}
                  </p>

                  <p className="mt-2 font-medium">{req.message}</p>

                  <span
                    className={`mt-2 inline-block px-3 py-1 text-sm rounded-full ${
                      req.status === "resolved"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {req.status}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={() => setSelectedChat(req.chat_logs)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                  >
                    View Chat
                  </button>

                  {req.status !== "resolved" && (
                    <button
                      onClick={() => markResolved(req.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chat Modal */}
     {/* Chat Modal */}
{selectedChat && (
  <div className="fixed inset-0 bg-black/40 flex justify-center items-center p-4 z-50">
    <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden">

      {/* Modal Header */}
      <div className="bg-[#e76458] text-white px-5 py-3 flex justify-between items-center">
        <h3 className="text-lg font-semibold">Chat Conversation</h3>
        <button onClick={() => setSelectedChat(null)}>
          ✕
        </button>
      </div>

      {/* Chat Body */}
      <div className="p-4 max-h-[70vh] overflow-y-auto bg-gray-50">
        {Array.isArray(selectedChat) ? (
          selectedChat.map((msg: any, i: number) => {
            const sender = msg.sender || msg.message_type || "bot";
            const text = msg.text || msg.content || "";
            const time = msg.timestamp
              ? new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit"
                })
              : "";

            return (
              <div
                key={i}
                className={`flex mb-4 ${
                  sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-xl shadow-sm ${
                    sender === "user"
                      ? "bg-[#e76458] text-white rounded-br-none"
                      : "bg-white border rounded-bl-none"
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{text}</p>
                  <p
                    className={`text-xs mt-2 ${
                      sender === "user" ? "text-white/70" : "text-gray-500"
                    }`}
                  >
                    {time}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <p>No chat logs found.</p>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t bg-white">
        <button
          onClick={() => setSelectedChat(null)}
          className="w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default DepartmentRequests;
