import { PublicLayout } from "@/components/public/PublicLayout";
import Link from "next/link";

async function getCourseDetail(slug: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/v1/public/courses/${slug}`,
      { cache: "no-store" }
    );
    if (!response.ok) return null;
    const data = await response.json();
    return data.course;
  } catch (error) {
    console.error("Failed to fetch course:", error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const course = await getCourseDetail(params.slug);
  return {
    title: course?.name || "Course",
    description: course?.degree || "Course details",
  };
}

export default async function CourseDetailPage({ params }: { params: { slug: string } }) {
  const course = await getCourseDetail(params.slug);

  if (!course) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Course not found</h1>
            <Link href="/courses" className="text-blue-600 hover:underline mt-4 inline-block">
              Back to Courses
            </Link>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8">
        <Link href="/courses" className="text-blue-600 hover:underline mb-4 inline-block">
          ← Back to Courses
        </Link>

        <article className="max-w-3xl">
          <div className="mb-6">
            <h1 className="text-4xl font-bold mb-4">{course.name}</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 rounded-lg p-6 mb-6">
              <div>
                <p className="text-sm text-gray-600">Degree Level</p>
                <p className="font-semibold">{course.degree}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Language</p>
                <p className="font-semibold">{course.language}</p>
              </div>
              {course.major && (
                <div>
                  <p className="text-sm text-gray-600">Major</p>
                  <p className="font-semibold">{course.major}</p>
                </div>
              )}
              {course.university && (
                <div>
                  <p className="text-sm text-gray-600">University</p>
                  <Link href={`/universities/${course.university.slug}`} className="font-semibold text-blue-600 hover:underline">
                    {course.university.name}
                  </Link>
                </div>
              )}
            </div>

            {/* Financial Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-blue-50 rounded-lg p-6 mb-6">
              {course.tuition && (
                <div>
                  <p className="text-sm text-gray-600">Annual Tuition</p>
                  <p className="font-semibold text-lg">¥{parseFloat(course.tuition).toLocaleString()}</p>
                </div>
              )}
              {course.accommodation && (
                <div>
                  <p className="text-sm text-gray-600">Accommodation</p>
                  <p className="font-semibold text-lg">¥{parseFloat(course.accommodation).toLocaleString()}</p>
                </div>
              )}
              {course.serviceCharge && (
                <div>
                  <p className="text-sm text-gray-600">Service Charge</p>
                  <p className="font-semibold text-lg">¥{parseFloat(course.serviceCharge).toLocaleString()}</p>
                </div>
              )}
            </div>

            {/* Program Info */}
            <div className="space-y-6 mb-6">
              {course.intake && (
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Intake</p>
                  <p className="mt-1">{course.intake}</p>
                </div>
              )}

              {course.rating && (
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Course Rating</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-2xl font-bold">{parseFloat(course.rating).toFixed(1)}</span>
                    <span className="text-yellow-400">★★★★★</span>
                  </div>
                </div>
              )}

              {course.tags && course.tags.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 font-semibold mb-2">Program Highlights</p>
                  <div className="flex flex-wrap gap-2">
                    {course.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="bg-brand-100 text-brand-700 px-3 py-1 rounded text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {(course.province || course.city) && (
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Location</p>
                  <p className="mt-1">
                    {course.city && `${course.city}, `}{course.province}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-8">
              <Link
                href="/get-free-consultation"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded font-semibold hover:bg-blue-700"
              >
                Get Free Consultation
              </Link>
            </div>
          </div>
        </article>
      </div>
    </PublicLayout>
  );
}
