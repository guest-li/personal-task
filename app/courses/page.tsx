"use client";

import { PublicLayout } from "@/components/public/PublicLayout";
import { SearchBar } from "@/components/public/SearchBar";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [degree, setDegree] = useState("");
  const [language, setLanguage] = useState("");

  useEffect(() => {
    fetchCourses();
  }, [pagination.page, search, degree, language]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", pagination.page.toString());
      params.append("limit", pagination.limit.toString());
      if (search) params.append("search", search);
      if (degree) params.append("degree", degree);
      if (language) params.append("language", language);

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

  const handleDegreeChange = (value: string) => {
    setDegree(value);
    setPagination({ ...pagination, page: 1 });
  };

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    setPagination({ ...pagination, page: 1 });
  };

  return (
    <PublicLayout>
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-brand-700 to-brand-800 text-white py-16 md:py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Browse Courses</h1>
          <p className="text-xl text-brand-100 max-w-2xl">
            Explore comprehensive degree programs from undergraduate to doctoral studies in China
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <SearchBar onSearch={handleSearch} />

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Degree Level</label>
              <select
                value={degree}
                onChange={(e) => handleDegreeChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
              >
                <option value="">All Degrees</option>
                <option value="Bachelor">Bachelor</option>
                <option value="Master">Master</option>
                <option value="PhD">PhD</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Language</label>
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
              >
                <option value="">All Languages</option>
                <option value="English">English</option>
                <option value="Chinese">Chinese</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading courses...</p>
          </div>
        ) : courses.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {courses.map((course) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.slug}`}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition"
                >
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{course.name}</h3>

                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-gray-600">🎓 {course.degree}</p>
                      <p className="text-sm text-gray-600">🌐 {course.language}</p>
                      {course.university && (
                        <p className="text-sm text-gray-600">🏛️ {course.university.name}</p>
                      )}
                    </div>

                    {course.tuition && (
                      <div className="mb-3 pt-3 border-t border-gray-200">
                        <p className="text-sm text-gray-600">Tuition</p>
                        <p className="font-semibold">¥{parseFloat(course.tuition).toLocaleString()}/year</p>
                      </div>
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
            <p className="text-gray-600">No courses found.</p>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
