import { useEffect, useState } from "react";
import { Filter, Search } from "lucide-react";
import type {
  SupportTicket,
  TicketPriority,
  TicketStatus,
} from "../types/tickets.types";

interface Props {
  tickets: SupportTicket[];
  onFilter: (data: SupportTicket[]) => void;
}

const TicketFilters: React.FC<Props> = ({ tickets, onFilter }) => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | TicketStatus>("all");
  const [priority, setPriority] = useState<"all" | TicketPriority>("all");

  useEffect(() => {
    let data = [...tickets];

    if (status !== "all") data = data.filter(t => t.status === status);
    if (priority !== "all") data = data.filter(t => t.priority === priority);

    if (search.trim()) {
      const s = search.toLowerCase();
      data = data.filter(
        t =>
          t.ticket_number.toLowerCase().includes(s) ||
          t.issue_type.toLowerCase().includes(s) ||
          (t.customer_name || "").toLowerCase().includes(s)
      );
    }

    onFilter(data);
  }, [tickets, search, status, priority]);

  return (
    <div className="bg-white border rounded-xl p-4 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <Filter size={18} />
        <h3 className="font-medium">Filters</h3>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tickets..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
          />
        </div>

        <select
          value={status}
          onChange={e => setStatus(e.target.value as any)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>

        <select
          value={priority}
          onChange={e => setPriority(e.target.value as any)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="all">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>
    </div>
  );
};

export default TicketFilters;
