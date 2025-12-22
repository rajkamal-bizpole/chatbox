import { Eye, User, Phone, Mail, Filter } from "lucide-react";
import type { PaginationInfo, SupportTicket } from "../types/tickets.types";
import TicketPagination from "./TicketPagination";

interface Props {
  tickets: SupportTicket[];
  pagination: PaginationInfo;
  total: number;
  selectedId?: number;

  onSelect: (ticket: SupportTicket) => void;
  setPagination: React.Dispatch<React.SetStateAction<PaginationInfo>>;

  getPriorityBadgeClass: (priority: SupportTicket["priority"]) => string;
  getStatusBadgeClass: (status: SupportTicket["status"]) => string;
  statusOptions: {
    value: SupportTicket["status"];
    icon: React.ReactNode;
  }[];

  formatDate: (date: string) => string;
  formatDateTime: (date: string) => string;
}

const TicketsTable: React.FC<Props> = ({
  tickets,
  pagination,
  total,
  selectedId,
  onSelect,
  setPagination,
  getPriorityBadgeClass,
  getStatusBadgeClass,
  statusOptions,
  formatDate,
  formatDateTime,
}) => {
  return (
    <div className="flex-1 flex flex-col bg-white border rounded-xl shadow-sm overflow-hidden">
      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr className="border-b">
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Ticket Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {tickets.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <div className="text-gray-400">
                    <Filter className="mx-auto mb-3" size={32} />
                    <p className="font-medium">No tickets found</p>
                    <p className="text-sm mt-1">
                      Try adjusting your filters or search terms
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              tickets.map(ticket => (
                <tr
                  key={ticket.id}
                  onClick={() => onSelect(ticket)}
                  className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedId === ticket.id ? "bg-blue-50" : ""
                  }`}
                >
                  {/* Ticket details */}
                  <td className="px-6 py-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-gray-900">
                          {ticket.ticket_number}
                        </span>
                        <Eye size={14} className="text-gray-400" />
                      </div>

                      <div className="mt-1">
                        <div className="font-medium text-gray-900">
                          {ticket.issue_type}
                        </div>
                        {ticket.sub_issue && (
                          <div className="text-sm text-gray-500 mt-0.5">
                            {ticket.sub_issue}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Customer */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <User size={16} className="text-gray-500" />
                      </div>

                      <div>
                        <div className="font-medium text-gray-900">
                          {ticket.customer_name || "Guest User"}
                        </div>

                        <div className="text-sm text-gray-500 space-y-0.5">
                          {ticket.phone && (
                            <div className="flex items-center gap-1">
                              <Phone size={12} />
                              {ticket.phone}
                            </div>
                          )}
                          {ticket.email && (
                            <div className="flex items-center gap-1">
                              <Mail size={12} />
                              {ticket.email}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Priority */}
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getPriorityBadgeClass(
                        ticket.priority
                      )}`}
                    >
                      {ticket.priority.charAt(0).toUpperCase() +
                        ticket.priority.slice(1)}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadgeClass(
                        ticket.status
                      )}`}
                    >
                      {
                        statusOptions.find(
                          s => s.value === ticket.status
                        )?.icon
                      }
                      <span className="ml-1.5">
                        {ticket.status.replace("_", " ")}
                      </span>
                    </span>
                  </td>

                  {/* Date */}
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="text-gray-900">
                        {formatDate(ticket.created_at)}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {formatDateTime(ticket.created_at).split(", ")[1]}
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > 0 && (
        <TicketPagination
          pagination={pagination}
          total={total}
          setPagination={setPagination}
        />
      )}
    </div>
  );
};

export default TicketsTable;
