import React from "react";

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  render: (row: T) => React.ReactNode;

  sortable?: boolean;
  onSort?: () => void;
  width?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];

  loading?: boolean;
  emptyMessage?: string;
  className?: string;
   onRowClick?: (row: T) => void;
  getRowClassName?: (row: T) => string;
}
