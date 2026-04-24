import { PublicLayout } from "@/components/public/PublicLayout";
import Link from "next/link";

export const metadata = {
  title: "Updates & News",
  description: "Latest updates and news from our organization.",
};

export default function UpdatesPage() {
  const updates = [
    {
      id: "1",
      title: "New Partnership with Top 10 University",
      date: "2024-04-20",
      category: "Partnership",
      excerpt: "We're excited to announce our new partnership with one of China's top universities...",
    },
    {
      id: "2",
      title: "Scholarship Program Expansion",
      date: "2024-04-18",
      category: "Scholarships",
      excerpt: "We've expanded our scholarship offerings with new programs for international students...",
    },
    {
      id: "3",
      title: "New Office Opening in Guangzhou",
      date: "2024-04-15",
      category: "Business",
      excerpt: "We're opening a new office in Guangzhou to better serve our students in South China...",
    },
    {
      id: "4",
      title: "2024 Student Success Stories",
      date: "2024-04-10",
      category: "Success",
      excerpt: "Read inspiring stories of our students who achieved their dreams in Chinese universities...",
    },
    {
      id: "5",
      title: "Spring Intake Statistics Released",
      date: "2024-04-05",
      category: "News",
      excerpt: "Our latest statistics show a 98% visa approval rate for Spring 2024 intake...",
    },
    {
      id: "6",
      title: "Virtual Campus Tours Available Now",
      date: "2024-03-30",
      category: "Services",
      excerpt: "Explore partner universities through our new virtual campus tour platform...",
    },
  ];

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-2">Updates & News</h1>
        <p className="text-lg text-gray-600 mb-12">
          Stay informed with our latest updates and announcements
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* News Feed */}
          <div className="lg:col-span-2 space-y-6">
            {updates.map((update) => (
              <article
                key={update.id}
                className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition p-6"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="inline-block text-xs font-semibold bg-blue-100 text-blue-700 px-3 py-1 rounded">
                    {update.category}
                  </span>
                  <time className="text-sm text-gray-600">
                    {new Date(update.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </time>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{update.title}</h3>
                <p className="text-gray-700 mb-4">{update.excerpt}</p>
                <Link href="#" className="text-blue-600 hover:underline font-semibold">
                  Read More →
                </Link>
              </article>
            ))}
          </div>

          {/* Sidebar */}
          <aside>
            {/* Categories */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Categories</h3>
              <ul className="space-y-2">
                {["All Updates", "Partnerships", "Scholarships", "Success Stories", "Events"].map(
                  (category) => (
                    <li key={category}>
                      <button className="text-blue-600 hover:underline text-sm font-semibold">
                        {category}
                      </button>
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* Newsletter Signup */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Subscribe to Updates</h3>
              <p className="text-sm text-gray-600 mb-4">
                Get the latest news and updates delivered to your inbox
              </p>
              <form className="space-y-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700"
                >
                  Subscribe
                </button>
              </form>
            </div>

            {/* Quick Links */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Links</h3>
              <ul className="space-y-2">
                {[
                  { label: "Blog", href: "/blog" },
                  { label: "Events", href: "/events" },
                  { label: "Notices", href: "/notices" },
                  { label: "Contact Us", href: "/contact" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-blue-600 hover:underline text-sm">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </PublicLayout>
  );
}
