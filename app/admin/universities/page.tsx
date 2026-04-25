"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function UniversitiesPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string; province?: string };
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [universities, setUniversities] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [deleting, setDeleting] = useState<string | null>(null);

  const page = parseInt(searchParams.page || "1", 10);
  const search = searchParams.search || "";
  const province = searchParams.province || "";

  useEffect(() => {
    fetchUniversities();
  }, [page, search, province]);

  const fetchUniversities = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      if (search) params.append("search", search);
      if (province) params.append("province", province);

      const response = await fetch(`/api/v1/admin/universities?${params}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to load universities");
      }

      const data = await response.json();
      setUniversities(data.universities || []);
      setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      setError("Failed to load universities. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This action cannot be undone.`)) return;

    setDeleting(id);
    try {
      const response = await fetch(`/api/v1/admin/universities/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setUniversities(universities.filter((u) => u.id !== id));
      } else {
        alert("Failed to delete university. Please try again.");
      }
    } catch (err) {
      alert("Error deleting university. Please try again.");
      console.error(err);
    } finally {
      setDeleting(null);
    }
  };

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
            defaultValue={search}
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

      {/* Loading State */}
      {loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-blue-800">
          Loading universities...
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-800">
          {error}
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
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
              {universities.map((university: any) => (
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
                  <td className="px-6 py-3 flex gap-2">
                    <Link
                      href={`/admin/universities/${university.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(university.id, university.name)}
                      disabled={deleting === university.id}
                      className="text-red-600 hover:underline disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      {deleting === university.id ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {universities.length === 0 && (
            <div className="px-6 py-8 text-center text-gray-500">
              No universities found.
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-600">
            Page {pagination.page} of {pagination.totalPages}
          </div>
          <div className="flex gap-2">
            {pagination.page > 1 && (
              <Link
                href={`?page=${pagination.page - 1}`}
                className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-50"
              >
                Previous
              </Link>
            )}
            {pagination.page < pagination.totalPages && (
              <Link
                href={`?page=${pagination.page + 1}`}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
