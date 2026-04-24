import { PublicLayout } from "@/components/public/PublicLayout";
import Link from "next/link";

async function getUniversityDetail(slug: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/v1/public/universities/${slug}`,
      { cache: "no-store" }
    );
    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    console.error("Failed to fetch university:", error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const university = await getUniversityDetail(params.slug);
  return {
    title: university?.name || "University",
    description: university?.location || "University details",
  };
}

export default async function UniversityDetailPage({ params }: { params: { slug: string } }) {
  const university = await getUniversityDetail(params.slug);

  if (!university) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">University not found</h1>
            <Link href="/universities" className="text-blue-600 hover:underline mt-4 inline-block">
              Back to Universities
            </Link>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8">
        <Link href="/universities" className="text-blue-600 hover:underline mb-4 inline-block">
          ← Back to Universities
        </Link>

        {university.banner && (
          <img
            src={university.banner}
            alt={university.name}
            className="w-full h-96 object-cover rounded-lg mb-8"
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h1 className="text-4xl font-bold mb-4">{university.name}</h1>

            <div className="flex flex-wrap gap-2 mb-8">
              {university.tags &&
                university.tags.map((tag: string) => (
                  <span key={tag} className="bg-blue-100 text-blue-700 px-3 py-1 rounded">
                    {tag}
                  </span>
                ))}
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4">University Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 text-sm">Location</p>
                  <p className="font-semibold">{university.location || "N/A"}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">World Rank</p>
                  <p className="font-semibold">{university.worldRank || "N/A"}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Student Count</p>
                  <p className="font-semibold">{university.studentCount || "N/A"}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Province</p>
                  <p className="font-semibold">{university.province || "N/A"}</p>
                </div>
              </div>
            </div>

            {university.deadline && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
                <p className="text-sm text-gray-600">Application Deadline</p>
                <p className="font-semibold text-lg">
                  {new Date(university.deadline).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          <aside className="bg-gray-50 rounded-lg p-6 h-fit">
            <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                href={`/courses?universityId=${university.id}`}
                className="block w-full bg-blue-600 text-white px-4 py-3 rounded text-center hover:bg-blue-700 font-semibold"
              >
                View Courses
              </Link>
              <Link
                href="/get-free-consultation"
                className="block w-full border-2 border-blue-600 text-blue-600 px-4 py-3 rounded text-center hover:bg-blue-50 font-semibold"
              >
                Get Free Consultation
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </PublicLayout>
  );
}
