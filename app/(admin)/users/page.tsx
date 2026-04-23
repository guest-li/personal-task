import { listUsersAdmin } from "@/server/services/admin.service";
import Link from "next/link";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: { page?: string; role?: string; status?: string; search?: string };
}) {
  const page = parseInt(searchParams.page || "1", 10);
  const result = await listUsersAdmin(page, 10, {
    role: searchParams.role,
    status: searchParams.status,
    search: searchParams.search,
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Users</h1>
        <Link
          href="/admin/users/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Create User
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <form method="get" className="flex gap-4">
          <select
            name="role"
            className="border border-gray-300 rounded px-3 py-2"
          >
            <option value="">All Roles</option>
            <option value="student">Student</option>
            <option value="counselor">Counselor</option>
            <option value="admin">Admin</option>
            <option value="partner">Partner</option>
          </select>
          <select
            name="status"
            className="border border-gray-300 rounded px-3 py-2"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
          <input
            type="text"
            name="search"
            placeholder="Search by email or name"
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
                Email
              </th>
              <th className="text-left px-6 py-3 font-semibold text-gray-900">
                Name
              </th>
              <th className="text-left px-6 py-3 font-semibold text-gray-900">
                Role
              </th>
              <th className="text-left px-6 py-3 font-semibold text-gray-900">
                Status
              </th>
              <th className="text-left px-6 py-3 font-semibold text-gray-900">
                Created
              </th>
              <th className="text-left px-6 py-3 font-semibold text-gray-900">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {result.users.map((user: any) => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-3">{user.email}</td>
                <td className="px-6 py-3">{user.name}</td>
                <td className="px-6 py-3 capitalize">{user.role}</td>
                <td className="px-6 py-3">
                  <span
                    className={`px-3 py-1 rounded text-sm ${
                      user.status === "active"
                        ? "bg-green-100 text-green-800"
                        : user.status === "inactive"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-3 text-sm text-gray-600">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-3">
                  <Link
                    href={`/admin/users/${user.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
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
