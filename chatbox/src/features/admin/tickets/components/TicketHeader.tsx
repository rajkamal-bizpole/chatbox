import { RefreshCw } from "lucide-react";

interface Props {
  onRefresh: () => void;
}

const TicketHeader: React.FC<Props> = ({ onRefresh }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
          Support Tickets
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Manage and track customer support requests
        </p>
      </div>

      <button
        onClick={onRefresh}
        className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
      >
        <RefreshCw size={16} />
        Refresh
      </button>
    </div>
  );
};

export default TicketHeader;
