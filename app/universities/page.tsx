"use client";

import { PublicLayout } from "@/components/public/PublicLayout";
import { CatalogCard } from "@/components/public/CatalogCard";
import { SearchBar } from "@/components/public/SearchBar";
import { FilterBar } from "@/components/public/FilterBar";
import { useState, useEffect } from "react";

export default function UniversitiesPage() {
  const [universities, setUniversities] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchUniversities();
  }, [pagination.page, filters, search]);

  const fetchUniversities = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", pagination.page.toString());
      params.append("limit", pagination.limit.toString());
      if (filters.province) params.append("province", filters.province);
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

  const handleFilter = (newFilters: Record<string, any>) => {
    setFilters(newFilters);
    setPagination({ ...pagination, page: 1 });
  };

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Universities in China</h1>

        <div className="mb-8">
          <SearchBar onSearch={handleSearch} />
        </div>

        <div className="mb-8">
          <FilterBar
            filters={[
              {
                name: "Province",
                type: "text",
                placeholder: "Filter by province",
              },
            ]}
            onFilter={handleFilter}
          />
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading universities...</p>
          </div>
        ) : universities.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {universities.map((uni) => (
                <CatalogCard
                  key={uni.id}
                  title={uni.name}
                  image={uni.banner}
                  details={{
                    "World Rank": uni.worldRank || "N/A",
                    Location: uni.location || "N/A",
                    Students: uni.studentCount || "N/A",
                  }}
                  tags={uni.tags || []}
                  link={`/universities/${uni.slug}`}
                  actionText="View Details"
                />
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
