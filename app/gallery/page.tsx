import { PublicLayout } from "@/components/public/PublicLayout";

export const metadata = {
  title: "Gallery",
  description: "Visual highlights from our events, universities, and student life.",
};

export default function GalleryPage() {
  const galleryItems = [
    { id: "1", title: "Campus Tour - Tsinghua University", category: "Universities" },
    { id: "2", title: "Student Orientation Program", category: "Events" },
    { id: "3", title: "Graduation Ceremony", category: "Celebrations" },
    { id: "4", title: "Beijing National University", category: "Universities" },
    { id: "5", title: "Student Networking Event", category: "Events" },
    { id: "6", title: "Scholarship Award Ceremony", category: "Celebrations" },
    { id: "7", title: "Shanghai University Campus", category: "Universities" },
    { id: "8", title: "Language Workshop", category: "Events" },
    { id: "9", title: "International Student Gathering", category: "Celebrations" },
  ];

  const categories = ["All", "Universities", "Events", "Celebrations"];

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-2">Gallery</h1>
        <p className="text-lg text-gray-600 mb-8">
          Explore photos from our events, university partnerships, and student celebrations
        </p>

        <div className="flex gap-2 mb-8 flex-wrap">
          {categories.map((category) => (
            <button
              key={category}
              className={`px-4 py-2 rounded font-semibold transition ${
                category === "All"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {galleryItems.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition cursor-pointer group"
            >
              <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center overflow-hidden relative">
                <div className="text-6xl text-blue-100">📷</div>
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition flex items-center justify-center">
                  <button className="opacity-0 group-hover:opacity-100 bg-white text-blue-600 px-4 py-2 rounded font-semibold transition">
                    View
                  </button>
                </div>
              </div>
              <div className="p-4">
                <span className="inline-block text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded mb-2">
                  {item.category}
                </span>
                <h3 className="font-bold text-gray-900">{item.title}</h3>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Share Your Experience</h2>
          <p className="text-gray-600 mb-6">
            Have photos from your journey? Share them with us and be featured in our gallery
          </p>
          <button className="bg-blue-600 text-white px-6 py-3 rounded font-semibold hover:bg-blue-700">
            Submit Photos
          </button>
        </div>
      </div>
    </PublicLayout>
  );
}
