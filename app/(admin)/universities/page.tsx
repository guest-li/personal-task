import { listUniversitiesAdmin } from "@/server/services/admin.service";
import Link from "next/link";

export default async function UniversitiesPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string; province?: string };
}) {
  const page = parseInt(searchParams.page || "1", 10);
  const result = await listUniversitiesAdmin(page, 10, {
    search: searchParams.search,
    province: searchParams.province,
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Universities</h1>
        <Link
          href="/admin/universities/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Add University
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <form method="get" className="flex gap-4">
          <input
            type="text"
            name="search"
            placeholder="Search by university name"
            className="border border-gray-300 rounded px-3 py-2 flex-1"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Search
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="text-left px-6 py-3 font-semibold text-gray-900">
                Name
              </th>
              <th className="text-left px-6 py-3 font-semibold text-gray-900">
                Slug
              </th>
              <th className="text-left px-6 py-3 font-semibold text-gray-900">
                Location
              </th>
              <th className="text-left px-6 py-3 font-semibold text-gray-900">
                World Rank
              </th>
              <th className="text-left px-6 py-3 font-semibold text-gray-900">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {result.universities.map((university: any) => (
              <tr key={university.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-3 text-gray-900">{university.name}</td>
                <td className="px-6 py-3 text-sm text-gray-600">
                  {university.slug}
                </td>
                <td className="px-6 py-3 text-sm text-gray-600">
                  {university.location || "-"}
                </td>
                <td className="px-6 py-3 text-sm text-gray-600">
                  {university.worldRank || "-"}
                </td>
                <td className="px-6 py-3">
                  <Link
                    href={`/admin/universities/${university.id}`}
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
