import { PublicLayout } from "@/components/public/PublicLayout";
import Link from "next/link";

async function getCourseDetail(slug: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/v1/public/courses/${slug}`,
      { cache: "no-store" }
    );
    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    console.error("Failed to fetch course:", error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const course = await getCourseDetail(params.slug);
  return {
    title: course?.name || "Course",
    description: course?.major || "Course details",
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h1 className="text-4xl font-bold mb-2">{course.name}</h1>
            <p className="text-lg text-gray-600 mb-6">{course.major}</p>

            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4">Course Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 text-sm">Degree Level</p>
                  <p className="font-semibold">{course.degree}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Language</p>
                  <p className="font-semibold">{course.language}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">University</p>
                  <p className="font-semibold">{course.university?.name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Intake</p>
                  <p className="font-semibold">{course.intake || "N/A"}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Location</p>
                  <p className="font-semibold">
                    {course.city}, {course.province}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Rating</p>
                  <p className="font-semibold">
                    {course.rating ? `${course.rating.toFixed(1)}/5` : "Not rated"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h3 className="text-xl font-bold mb-4">Program Fees</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-gray-600 text-sm">Tuition</p>
                  <p className="font-semibold text-lg">¥{course.tuition}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Accommodation</p>
                  <p className="font-semibold text-lg">¥{course.accommodation}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Service Charge</p>
                  <p className="font-semibold text-lg">¥{course.serviceCharge}</p>
                </div>
              </div>
            </div>

            {course.tags && course.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {course.tags.map((tag: string) => (
                  <span key={tag} className="bg-green-100 text-green-700 px-3 py-1 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <aside className="bg-gray-50 rounded-lg p-6 h-fit">
            <h3 className="text-xl font-bold mb-4">Take Action</h3>
            <div className="space-y-3">
              <Link
                href={`/universities/${course.university?.slug}`}
                className="block w-full bg-blue-600 text-white px-4 py-3 rounded text-center hover:bg-blue-700 font-semibold"
              >
                View University
              </Link>
              <Link
                href="/get-free-consultation"
                className="block w-full border-2 border-blue-600 text-blue-600 px-4 py-3 rounded text-center hover:bg-blue-50 font-semibold"
              >
                Get Free Consultation
              </Link>
              <Link
                href="/contact"
                className="block w-full bg-gray-300 text-gray-700 px-4 py-3 rounded text-center hover:bg-gray-400 font-semibold"
              >
                Contact Us
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </PublicLayout>
  );
}
