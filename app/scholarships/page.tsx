"use client";

import { PublicLayout } from "@/src/components/public/PublicLayout";
import { CatalogCard } from "@/src/components/public/CatalogCard";
import { SearchBar } from "@/src/components/public/SearchBar";
import { FilterBar } from "@/src/components/public/FilterBar";
import { useState, useEffect } from "react";

export default function ScholarshipsPage() {
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchScholarships();
  }, [pagination.page, filters, search]);

  const fetchScholarships = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", pagination.page.toString());
      params.append("limit", pagination.limit.toString());
      if (filters.type) params.append("type", filters.type);
      if (filters.degree) params.append("degree", filters.degree);
      if (search) params.append("search", search);

      const response = await fetch(`/api/v1/public/scholarships?${params}`);
      const data = await response.json();
      setScholarships(data.scholarships || []);
      setPagination(data.pagination || pagination);
    } catch (error) {
      console.error("Failed to fetch scholarships:", error);
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
        <h1 className="text-3xl font-bold mb-8">Available Scholarships</h1>

        <div className="mb-8">
          <SearchBar onSearch={handleSearch} />
        </div>

        <div className="mb-8">
          <FilterBar
            filters={[
              {
                name: "Scholarship Type",
                type: "select",
                options: [
                  { label: "Full Tuition", value: "full_tuition" },
                  { label: "Partial", value: "partial" },
                  { label: "Living Stipend", value: "living_stipend" },
                ],
              },
              {
                name: "Degree",
                type: "select",
                options: [
                  { label: "Bachelor", value: "bachelor" },
                  { label: "Master", value: "master" },
                  { label: "PhD", value: "phd" },
                ],
              },
            ]}
            onFilter={handleFilter}
          />
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading scholarships...</p>
          </div>
        ) : scholarships.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {scholarships.map((scholarship) => (
                <CatalogCard
                  key={scholarship.id}
                  title={scholarship.name}
                  details={{
                    Type: scholarship.type,
                    Degree: scholarship.degree,
                    Major: scholarship.major,
                    University: scholarship.university?.name || "N/A",
                    Location: `${scholarship.city}, ${scholarship.province}`,
                  }}
                  deadline={scholarship.intake}
                  link={`/scholarships/${scholarship.slug}`}
                  actionText="Apply Now"
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
            <p className="text-gray-600">No scholarships found matching your criteria.</p>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
