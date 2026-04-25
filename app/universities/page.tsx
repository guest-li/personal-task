"use client";

import { PublicLayout } from "@/components/public/PublicLayout";
import { SearchBar } from "@/components/public/SearchBar";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function UniversitiesPage() {
  const [universities, setUniversities] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchUniversities();
  }, [pagination.page, search]);

  const fetchUniversities = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", pagination.page.toString());
      params.append("limit", pagination.limit.toString());
      if (search) params.append("search", search);

      const response = await fetch(`/api/v1/public/universities?${params}`);
      const data = await response.json();
      setUniversities(data.universities || []);
      setPagination(data.pagination || pagination);
    } catch (error) {
      console.error("Failed to fetch universities:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearch(query);
    setPagination({ ...pagination, page: 1 });
  };

  return (
    <PublicLayout>
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-brand-700 to-brand-800 text-white py-16 md:py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Explore Universities</h1>
          <p className="text-xl text-brand-100 max-w-2xl">
            Discover top universities in China with world-class education, diverse programs, and scholarship opportunities
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <SearchBar onSearch={handleSearch} />
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading universities...</p>
          </div>
        ) : universities.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {universities.map((university) => (
                <Link
                  key={university.id}
                  href={`/universities/${university.slug}`}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition"
                >
                  {university.banner && (
                    <img
                      src={university.banner}
                      alt={university.name}
                      className="w-full h-40 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{university.name}</h3>
                    {university.location && (
                      <p className="text-sm text-gray-600 mb-2">📍 {university.location}</p>
                    )}
                    {university.worldRank && (
                      <p className="text-sm text-gray-600 mb-3">🏆 World Rank: #{university.worldRank}</p>
                    )}
                    <span className="inline-block bg-brand-100 text-brand-700 px-3 py-1 rounded text-sm font-semibold">
                      View Details →
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center gap-2 items-center">
              <button
                onClick={() =>
                  setPagination({ ...pagination, page: Math.max(1, pagination.page - 1) })
                }
                disabled={pagination.page === 1}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() =>
                  setPagination({
                    ...pagination,
                    page: Math.min(pagination.totalPages, pagination.page + 1),
                  })
                }
                disabled={pagination.page === pagination.totalPages}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">No universities found.</p>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
