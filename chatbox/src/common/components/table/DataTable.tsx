import React from "react";
import type { DataTableProps } from "../../types/table.types";

function DataTable<T>({
  data,
  columns,
  loading = false,
  emptyMessage = "No data found",
  className = "",
    onRowClick,
  getRowClassName,
}: DataTableProps<T>) {
  return (
    <div className={`bg-white border rounded-xl shadow-sm overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr className="border-b">
              {columns.map(col => (
                <th
                  key={col.key}
                  onClick={col.sortable ? col.onSort : undefined}
                  style={{ width: col.width }}
                  className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700
                    ${col.sortable ? "cursor-pointer hover:bg-gray-100" : ""}
                  `}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-10 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-400">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
               <tr
  key={rowIndex}
  onClick={() => onRowClick?.(row)}
  className={`hover:bg-gray-50 transition-colors cursor-pointer ${
    getRowClassName?.(row) || ""
  }`}
>

                  {columns.map(col => (
                    <td key={col.key} className="px-6 py-4 align-top">
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable;
