import { listPendingPartnersAdmin } from "@/server/services/admin.service";
import Link from "next/link";

export default async function PartnersPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = parseInt(searchParams.page || "1", 10);
  const result = await listPendingPartnersAdmin(page, 10);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Partner Applications
      </h1>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="text-left px-6 py-3 font-semibold text-gray-900">
                Name
              </th>
              <th className="text-left px-6 py-3 font-semibold text-gray-900">
                Email
              </th>
              <th className="text-left px-6 py-3 font-semibold text-gray-900">
                Experience
              </th>
              <th className="text-left px-6 py-3 font-semibold text-gray-900">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {result.partners.map((user: any) => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-3 text-gray-900">{user.name}</td>
                <td className="px-6 py-3 text-gray-900">{user.email}</td>
                <td className="px-6 py-3 text-sm text-gray-600">
                  {user.partnerProfile?.experience || "—"}
                </td>
                <td className="px-6 py-3">
                  <Link
                    href={`/admin/partners/${user.id}`}
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
