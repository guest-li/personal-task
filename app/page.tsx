import { PublicLayout } from "@/src/components/public/PublicLayout";
import Link from "next/link";

export const metadata = {
  title: "Education Consultancy - Study in China",
  description: "Your gateway to quality education in China. Explore universities, courses, and scholarships.",
};

export default function HomePage() {
  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-12 mb-12">
          <h1 className="text-4xl font-bold mb-4">Welcome to Study in China</h1>
          <p className="text-lg mb-6">
            Your gateway to quality education and amazing opportunities in top Chinese universities.
          </p>
          <div className="flex gap-4 flex-wrap">
            <Link href="/universities" className="bg-white text-blue-600 px-6 py-3 rounded font-semibold hover:bg-gray-100">
              Explore Universities
            </Link>
            <Link href="/courses" className="bg-blue-500 text-white px-6 py-3 rounded font-semibold hover:bg-blue-400">
              Browse Courses
            </Link>
          </div>
        </section>

        {/* Quick Links */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Popular Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "Universities", href: "/universities", icon: "🏫" },
              { title: "Courses", href: "/courses", icon: "📚" },
              { title: "Scholarships", href: "/scholarships", icon: "🎓" },
              { title: "Blog", href: "/blog", icon: "📰" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="bg-white border border-gray-200 rounded-lg p-6 text-center hover:shadow-lg transition"
              >
                <div className="text-3xl mb-2">{item.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
              </Link>
            ))}
          </div>
        </section>

        {/* About Section */}
        <section className="bg-gray-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">About Us</h2>
          <p className="text-gray-600 mb-4">
            We are dedicated to helping students find the best educational opportunities in China. With partnerships with leading universities and a team of experienced consultants, we guide students through every step of their journey.
          </p>
          <Link href="/about" className="text-blue-600 hover:underline font-semibold">
            Learn more about us →
          </Link>
        </section>
      </div>
    </PublicLayout>
  );
}
