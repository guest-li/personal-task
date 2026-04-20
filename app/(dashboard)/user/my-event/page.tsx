"use client";

import { useEffect, useState, useCallback } from "react";
import DataTable, { type Column } from "@/components/tables/DataTable";
import ExportButtons from "@/components/tables/ExportButtons";

interface EventRegistration {
  id: string;
  orderDate: string;
  paymentStatus: string;
  event: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    price: number;
  };
  [key: string]: unknown;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const PAYMENT_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
};

export default function MyEventPage() {
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1, limit: 10, total: 0, totalPages: 0,
  });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchRegistrations = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(pagination.page),
      limit: String(pagination.limit),
    });
    if (search) params.set("search", search);

    const res = await fetch(`/api/v1/events/my-registrations?${params}`);
    const data = await res.json();
    setRegistrations(data.registrations);
    setPagination(data.pagination);
    setLoading(false);
  }, [pagination.page, pagination.limit, search]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  const columns: Column<EventRegistration>[] = [
    { key: "sl", label: "SL", render: (_row, index) => index + 1 },
    { key: "eventName", label: "Event Name", sortable: true, render: (row) => row.event.name },
    {
      key: "startDate", label: "Start Date", sortable: true,
      render: (row) => new Date(row.event.startDate).toLocaleDateString(),
    },
    {
      key: "endDate", label: "End Date", sortable: true,
      render: (row) => new Date(row.event.endDate).toLocaleDateString(),
    },
    {
      key: "price", label: "Price", sortable: true,
      render: (row) => `$${Number(row.event.price).toFixed(2)}`,
    },
    {
      key: "orderDate", label: "Order Date", sortable: true,
      render: (row) => new Date(row.orderDate).toLocaleDateString(),
    },
    {
      key: "paymentStatus", label: "Payment Status",
      render: (row) => (
        <span className={`rounded-full px-2 py-1 text-xs font-medium ${PAYMENT_COLORS[row.paymentStatus] ?? ""}`}>
          {row.paymentStatus.charAt(0).toUpperCase() + row.paymentStatus.slice(1)}
        </span>
      ),
    },
  ];

  const exportColumns = [
    { key: "eventName", label: "Event Name" },
    { key: "startDate", label: "Start Date" },
    { key: "endDate", label: "End Date" },
    { key: "price", label: "Price" },
    { key: "orderDate", label: "Order Date" },
    { key: "paymentStatus", label: "Payment Status" },
  ];

  const exportData = registrations.map((r) => ({
    eventName: r.event.name,
    startDate: new Date(r.event.startDate).toLocaleDateString(),
    endDate: new Date(r.event.endDate).toLocaleDateString(),
    price: Number(r.event.price).toFixed(2),
    orderDate: new Date(r.orderDate).toLocaleDateString(),
    paymentStatus: r.paymentStatus,
  }));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Events</h1>
        <ExportButtons data={exportData} columns={exportColumns} filename="my-events" />
      </div>

      {loading ? (
        <div className="py-8 text-center text-gray-500">Loading...</div>
      ) : (
        <DataTable
          columns={columns}
          data={registrations}
          pagination={pagination}
          onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
          onSort={() => {}}
          onSearch={(s) => { setSearch(s); setPagination((prev) => ({ ...prev, page: 1 })); }}
          onLimitChange={(limit) => setPagination((prev) => ({ ...prev, limit, page: 1 }))}
        />
      )}
    </div>
  );
}
