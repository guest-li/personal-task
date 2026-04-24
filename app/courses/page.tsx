"use client";

import { PublicLayout } from "@/components/public/PublicLayout";
import { CatalogCard } from "@/components/public/CatalogCard";
import { SearchBar } from "@/components/public/SearchBar";
import { FilterBar } from "@/components/public/FilterBar";
import { useState, useEffect } from "react";

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCourses();
  }, [pagination.page, filters, search]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", pagination.page.toString());
      params.append("limit", pagination.limit.toString());
      if (filters.degree) params.append("degree", filters.degree);
      if (filters.language) params.append("language", filters.language);
      if (filters.major) params.append("major", filters.major);
      if (search) params.append("search", search);

      const response = await fetch(`/api/v1/public/courses?${params}`);
      const data = await response.json();
      setCourses(data.courses || []);
      setPagination(data.pagination || pagination);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
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
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-brand-700 to-brand-800 text-white py-16 md:py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Browse Courses</h1>
          <p className="text-xl text-brand-100 max-w-2xl">
            Explore 700+ courses across diverse fields of study at top Chinese universities
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <SearchBar />
        </div>

        <div className="mb-8">
          <FilterBar
            filters={[
              {
                name: "Degree",
                type: "select",
                options: [
                  { label: "Bachelor", value: "bachelor" },
                  { label: "Master", value: "master" },
                  { label: "PhD", value: "phd" },
                ],
              },
              {
                name: "Language",
                type: "select",
                options: [
                  { label: "English", value: "english" },
                  { label: "Chinese", value: "chinese" },
                ],
              },
              {
                name: "Major",
                type: "text",
                placeholder: "Search by major",
              },
            ]}
            onFilter={handleFilter}
          />
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading courses...</p>
          </div>
        ) : courses.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {courses.map((course) => (
                <CatalogCard
                  key={course.id}
                  title={course.name}
                  details={{
                    Degree: course.degree,
                    Language: course.language,
                    Major: course.major,
                    University: course.university?.name || "N/A",
                    "Tuition": `¥${course.tuition}`,
                  }}
                  tags={course.tags || []}
                  link={`/courses/${course.slug}`}
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
            <p className="text-gray-600">No courses found.</p>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
