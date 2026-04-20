"use client";

import { useState } from "react";

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (row: T, index: number) => React.ReactNode;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  pagination: Pagination;
  onPageChange: (page: number) => void;
  onSort?: (sortBy: string, sortOrder: "asc" | "desc") => void;
  onSearch?: (search: string) => void;
  onLimitChange?: (limit: number) => void;
}

export default function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  pagination,
  onPageChange,
  onSort,
  onSearch,
  onLimitChange,
}: DataTableProps<T>) {
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [searchTerm, setSearchTerm] = useState("");

  function handleSort(key: string) {
    const newOrder = sortBy === key && sortOrder === "asc" ? "desc" : "asc";
    setSortBy(key);
    setSortOrder(newOrder);
    onSort?.(key, newOrder);
  }

  function handleSearch(value: string) {
    setSearchTerm(value);
    onSearch?.(value);
  }

  const startEntry = (pagination.page - 1) * pagination.limit + 1;
  const endEntry = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Show</span>
          <select
            value={pagination.limit}
            onChange={(e) => onLimitChange?.(parseInt(e.target.value))}
            className="rounded border border-gray-300 px-2 py-1 text-sm"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span className="text-sm text-gray-600">entries</span>
        </div>

        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="rounded border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left font-medium text-gray-600 ${
                    col.sortable ? "cursor-pointer select-none hover:text-gray-900" : ""
                  }`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  {col.label}
                  {col.sortable && sortBy === col.key && (
                    <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">
                  No data found
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b hover:bg-gray-50">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      {col.render
                        ? col.render(row, (pagination.page - 1) * pagination.limit + rowIndex)
                        : (row[col.key] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {pagination.total > 0
            ? `Showing ${startEntry} to ${endEntry} of ${pagination.total} entries`
            : "No entries"}
        </p>
        <div className="flex gap-1">
          <button
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="rounded border px-3 py-1 text-sm disabled:opacity-50"
          >
            Previous
          </button>
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
            .filter((p) => Math.abs(p - pagination.page) <= 2)
            .map((p) => (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`rounded border px-3 py-1 text-sm ${
                  p === pagination.page ? "bg-blue-600 text-white" : ""
                }`}
              >
                {p}
              </button>
            ))}
          <button
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="rounded border px-3 py-1 text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
