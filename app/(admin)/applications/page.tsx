import { listApplicationsAdmin } from "@/server/services/admin.service";
import Link from "next/link";

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: { page?: string; status?: string; search?: string };
}) {
  const page = parseInt(searchParams.page || "1", 10);
  const result = await listApplicationsAdmin(page, 10, {
    status: searchParams.status,
    search: searchParams.search,
  });

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Applications</h1>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <form method="get" className="flex gap-4">
          <select
            name="status"
            className="border border-gray-300 rounded px-3 py-2"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <input
            type="text"
            name="search"
            placeholder="Search by student name or email"
            className="border border-gray-300 rounded px-3 py-2 flex-1"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Filter
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="text-left px-6 py-3 font-semibold text-gray-900">
                Code
              </th>
              <th className="text-left px-6 py-3 font-semibold text-gray-900">
                Student
              </th>
              <th className="text-left px-6 py-3 font-semibold text-gray-900">
                Program
              </th>
              <th className="text-left px-6 py-3 font-semibold text-gray-900">
                University
              </th>
              <th className="text-left px-6 py-3 font-semibold text-gray-900">
                Status
              </th>
              <th className="text-left px-6 py-3 font-semibold text-gray-900">
                Applied
              </th>
              <th className="text-left px-6 py-3 font-semibold text-gray-900">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {result.applications.map((app: any) => (
              <tr key={app.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-3 font-mono text-sm text-gray-900">
                  {app.applicationCode}
                </td>
                <td className="px-6 py-3 text-gray-900">{app.user.name}</td>
                <td className="px-6 py-3 text-gray-900">{app.programName}</td>
                <td className="px-6 py-3 text-gray-900">
                  {app.universityName}
                </td>
                <td className="px-6 py-3">
                  <span
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      app.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : app.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {app.status}
                  </span>
                </td>
                <td className="px-6 py-3 text-sm text-gray-600">
                  {new Date(app.appliedAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-3">
                  <Link
                    href={`/admin/applications/${app.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    Review
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        <div className="text-sm text-gray-600">
          Page {result.pagination.page} of {result.pagination.totalPages}
        </div>
        <div className="flex gap-2">
          {result.pagination.page > 1 && (
            <Link
              href={`?page=${result.pagination.page - 1}`}
              className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-50"
            >
              Previous
            </Link>
          )}
          {result.pagination.page < result.pagination.totalPages && (
            <Link
              href={`?page=${result.pagination.page + 1}`}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Next
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
