// common/components/table/DataTable.tsx
interface DataTableProps {
  header: React.ReactNode;
  rows: React.ReactNode;
}

const DataTable = ({ header, rows }: DataTableProps) => {
  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      <table className="w-full">
        <thead>{header}</thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
};

export default DataTable;
