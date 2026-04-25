import { PublicLayout } from "@/components/public/PublicLayout";
import Link from "next/link";

async function getScholarshipDetail(slug: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/v1/public/scholarships/${slug}`,
      { cache: "no-store" }
    );
    if (!response.ok) return null;
    const data = await response.json();
    return data.scholarship;
  } catch (error) {
    console.error("Failed to fetch scholarship:", error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const scholarship = await getScholarshipDetail(params.slug);
  return {
    title: scholarship?.name || "Scholarship",
    description: scholarship?.type || "Scholarship details",
  };
}

export default async function ScholarshipDetailPage({ params }: { params: { slug: string } }) {
  const scholarship = await getScholarshipDetail(params.slug);

  if (!scholarship) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Scholarship not found</h1>
            <Link href="/scholarships" className="text-blue-600 hover:underline mt-4 inline-block">
              Back to Scholarships
            </Link>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8">
        <Link href="/scholarships" className="text-blue-600 hover:underline mb-4 inline-block">
          ← Back to Scholarships
        </Link>

        <article className="max-w-3xl">
          <div className="mb-6">
            <div className="mb-4">
              <span className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded font-semibold text-lg">
                {scholarship.type}
              </span>
            </div>

            <h1 className="text-4xl font-bold mb-4">{scholarship.name}</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 rounded-lg p-6 mb-6">
              <div>
                <p className="text-sm text-gray-600">Degree Level</p>
                <p className="font-semibold">{scholarship.degree}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Major</p>
                <p className="font-semibold">{scholarship.major}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Language</p>
                <p className="font-semibold">{scholarship.language}</p>
              </div>
              {scholarship.university && (
                <div>
                  <p className="text-sm text-gray-600">University</p>
                  <Link href={`/universities/${scholarship.university.slug}`} className="font-semibold text-blue-600 hover:underline">
                    {scholarship.university.name}
                  </Link>
                </div>
              )}
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50 rounded-lg p-6 mb-6">
              <div>
                <p className="text-sm text-gray-600">Province</p>
                <p className="font-semibold">{scholarship.province}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">City</p>
                <p className="font-semibold">{scholarship.city}</p>
              </div>
            </div>

            {/* Financial Coverage */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-green-50 rounded-lg p-6 mb-6">
              {scholarship.tuition && (
                <div>
                  <p className="text-sm text-gray-600">Tuition Coverage</p>
                  <p className="font-semibold text-lg">¥{parseFloat(scholarship.tuition).toLocaleString()}</p>
                </div>
              )}
              {scholarship.accommodation && (
                <div>
                  <p className="text-sm text-gray-600">Accommodation Coverage</p>
                  <p className="font-semibold text-lg">¥{parseFloat(scholarship.accommodation).toLocaleString()}</p>
                </div>
              )}
            </div>

            {/* Program Info */}
            <div className="space-y-6 mb-6">
              {scholarship.intake && (
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Intake</p>
                  <p className="mt-1">{scholarship.intake}</p>
                </div>
              )}

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <p className="text-sm font-semibold text-gray-900">Application Information</p>
                <p className="text-sm text-gray-700 mt-2">
                  For detailed eligibility requirements, application timeline, and benefits breakdown,
                  please contact our consultation team.
                </p>
              </div>
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
