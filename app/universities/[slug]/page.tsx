import { PublicLayout } from "@/components/public/PublicLayout";
import Link from "next/link";

async function getUniversityDetail(slug: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/v1/public/universities/${slug}`,
      { cache: "no-store" }
    );
    if (!response.ok) return null;
    const data = await response.json();
    return data.university;
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

        <article className="max-w-3xl">
          <div className="mb-6">
            <h1 className="text-4xl font-bold mb-4">{university.name}</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 rounded-lg p-6 mb-6">
              {university.location && (
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-semibold">{university.location}</p>
                </div>
              )}
              {university.worldRank && (
                <div>
                  <p className="text-sm text-gray-600">World Rank</p>
                  <p className="font-semibold">#{university.worldRank}</p>
                </div>
              )}
              {university.studentCount && (
                <div>
                  <p className="text-sm text-gray-600">Student Count</p>
                  <p className="font-semibold">{university.studentCount.toLocaleString()}</p>
                </div>
              )}
            </div>

            {university.tags && university.tags.length > 0 && (
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {university.tags.map((tag: string) => (
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

            {university.intake && (
              <div className="mb-6">
                <p className="text-sm text-gray-600">Intake</p>
                <p className="font-semibold">{university.intake}</p>
              </div>
            )}

            {university.deadline && (
              <div className="mb-6">
                <p className="text-sm text-gray-600">Application Deadline</p>
                <p className="font-semibold">
                  {new Date(university.deadline).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
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
        </article>
      </div>
    </PublicLayout>
  );
}
