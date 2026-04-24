import { PublicLayout } from "@/components/public/PublicLayout";

export const metadata = {
  title: "Important Notices & Updates",
  description: "Stay updated with important notices and announcements.",
};

export default function NoticesPage() {
  const notices = [
    {
      id: "1",
      title: "Application Deadline Extended",
      date: "2024-04-20",
      content:
        "The application deadline for Spring 2024 intake has been extended to May 31st. All students are encouraged to submit their applications before the new deadline.",
      type: "important",
    },
    {
      id: "2",
      title: "New Scholarship Programs Available",
      date: "2024-04-18",
      content:
        "We are pleased to announce new scholarship programs for international students. Check the scholarships page for more details.",
      type: "announcement",
    },
    {
      id: "3",
      title: "University Portal Maintenance",
      date: "2024-04-15",
      content:
        "The university portal will be under maintenance on April 22nd from 10 PM to 6 AM. We apologize for any inconvenience.",
      type: "maintenance",
    },
    {
      id: "4",
      title: "COVID-19 Safety Guidelines Updated",
      date: "2024-04-10",
      content:
        "All students and staff are required to follow the updated COVID-19 safety guidelines. Please read the full guidelines on our health page.",
      type: "important",
    },
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case "important":
        return "bg-red-100 text-red-800";
      case "announcement":
        return "bg-blue-100 text-blue-800";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Important Notices</h1>
        <p className="text-gray-600 mb-8">
          Stay updated with important announcements and notices
        </p>

        <div className="space-y-4 max-w-3xl">
          {notices.map((notice) => (
            <div
              key={notice.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow transition"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold px-3 py-1 rounded ${getTypeColor(notice.type)}`}>
                    {notice.type.toUpperCase()}
                  </span>
                  <time className="text-sm text-gray-600">
                    {new Date(notice.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </time>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{notice.title}</h3>
              <p className="text-gray-700 leading-relaxed">{notice.content}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Subscribe to Updates</h2>
          <p className="text-gray-600 mb-6">
            Get the latest news and announcements delivered to your inbox
          </p>
          <div className="flex gap-2 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
