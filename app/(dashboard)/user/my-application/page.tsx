"use client";

import { useEffect, useState, useCallback } from "react";
import DataTable, { type Column } from "@/components/tables/DataTable";
import ExportButtons from "@/components/tables/ExportButtons";
import FilterBar from "@/components/tables/FilterBar";

interface Application {
  id: string;
  applicationCode: string;
  programName: string;
  universityName: string;
  status: string;
  fundType: string;
  appliedAt: string;
  [key: string]: unknown;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-800",
};

export default function MyApplicationPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1, limit: 10, total: 0, totalPages: 0,
  });
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortBy, setSortBy] = useState("appliedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(pagination.page),
      limit: String(pagination.limit),
      sortBy,
      sortOrder,
    });
    if (filters.fundType) params.set("fundType", filters.fundType);
    if (filters.status) params.set("status", filters.status);
    if (search) params.set("search", search);

    const res = await fetch(`/api/v1/applications?${params}`);
    const data = await res.json();
    setApplications(data.applications);
    setPagination(data.pagination);
    setLoading(false);
  }, [pagination.page, pagination.limit, sortBy, sortOrder, filters, search]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  async function handleCancel(id: string) {
    if (!confirm("Are you sure you want to cancel this application?")) return;
    await fetch(`/api/v1/applications/${id}`, { method: "PATCH" });
    fetchApplications();
  }

  const columns: Column<Application>[] = [
    { key: "sl", label: "SL", render: (_row, index) => index + 1 },
    { key: "applicationCode", label: "Application Code", sortable: true },
    { key: "programName", label: "Program Name", sortable: true },
    { key: "universityName", label: "University", sortable: true },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (row) => (
        <span className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_COLORS[row.status] ?? ""}`}>
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </span>
      ),
    },
    {
      key: "action",
      label: "Action",
      render: (row) => (
        <div className="flex gap-2">
          {row.status === "pending" && (
            <button
              onClick={() => handleCancel(row.id)}
              className="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
            >
              Cancel
            </button>
          )}
        </div>
      ),
    },
  ];

  const filterConfig = [
    {
      key: "fundType",
      label: "Fund Type",
      options: [
        { label: "Self-funded", value: "self_funded" },
        { label: "Scholarship", value: "scholarship" },
      ],
    },
    {
      key: "status",
      label: "Status",
      options: [
        { label: "Pending", value: "pending" },
        { label: "Approved", value: "approved" },
        { label: "Rejected", value: "rejected" },
        { label: "Cancelled", value: "cancelled" },
      ],
    },
  ];

  const exportColumns = [
    { key: "applicationCode", label: "Application Code" },
    { key: "programName", label: "Program Name" },
    { key: "universityName", label: "University" },
    { key: "status", label: "Status" },
    { key: "fundType", label: "Fund Type" },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Application</h1>
        <ExportButtons data={applications} columns={exportColumns} filename="my-applications" />
      </div>

      <FilterBar
        filters={filterConfig}
        values={filters}
        onChange={(key, value) => {
          setFilters((prev) => ({ ...prev, [key]: value }));
          setPagination((prev) => ({ ...prev, page: 1 }));
        }}
      />

      {loading ? (
        <div className="py-8 text-center text-gray-500">Loading...</div>
      ) : (
        <DataTable
          columns={columns}
          data={applications}
          pagination={pagination}
          onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
          onSort={(by, order) => { setSortBy(by); setSortOrder(order); }}
          onSearch={(s) => { setSearch(s); setPagination((prev) => ({ ...prev, page: 1 })); }}
          onLimitChange={(limit) => setPagination((prev) => ({ ...prev, limit, page: 1 }))}
        />
      )}
    </div>
  );
}
