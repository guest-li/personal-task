import { PublicLayout } from "@/src/components/public/PublicLayout";

export const metadata = {
  title: "Activity Gallery",
  description: "Photos from student activities, cultural events, and campus life.",
};

export default function ActivityGalleryPage() {
  const activities = [
    { id: "1", title: "Sports Day Competition", month: "March" },
    { id: "2", title: "Cultural Exchange Program", month: "April" },
    { id: "3", title: "Research Symposium", month: "May" },
    { id: "4", title: "Volunteer Community Service", month: "June" },
    { id: "5", title: "International Food Festival", month: "July" },
    { id: "6", title: "Tech Innovation Hackathon", month: "August" },
    { id: "7", title: "Business Case Competition", month: "September" },
    { id: "8", title: "Career Development Summit", month: "October" },
    { id: "9", title: "Year-End Celebration Gala", month: "December" },
  ];

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-2">Activity Gallery</h1>
        <p className="text-lg text-gray-600 mb-12">
          Discover the vibrant student life and activities on campus
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition"
            >
              <div className="h-48 bg-gradient-to-br from-green-400 to-green-600 flex flex-col items-center justify-center">
                <div className="text-5xl mb-2">🎉</div>
                <span className="text-white font-semibold text-sm">{activity.month}</span>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">{activity.title}</h3>
                <button className="w-full border-2 border-blue-600 text-blue-600 px-4 py-2 rounded hover:bg-blue-50 font-semibold transition">
                  View Photos
                </button>
              </div>
            </div>
          ))}
        </div>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { icon: "🎓", title: "Academic Activities", desc: "Seminars, workshops, competitions" },
            { icon: "🌍", title: "Cultural Events", desc: "Festivals, exchanges, celebrations" },
            { icon: "💪", title: "Sports & Wellness", desc: "Games, fitness, health activities" },
          ].map((item, index) => (
            <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
              <div className="text-4xl mb-3">{item.icon}</div>
              <h3 className="text-lg font-bold mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm">{item.desc}</p>
            </div>
          ))}
        </section>

        <div className="bg-gradient-to-r from-green-500 to-green-700 text-white rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Get Involved in Campus Life</h2>
          <p className="text-green-100 mb-6">
            Experience diverse activities and build lasting friendships with international students
          </p>
          <button className="bg-white text-green-600 px-8 py-3 rounded font-semibold hover:bg-gray-100">
            Learn More
          </button>
        </div>
      </div>
    </PublicLayout>
  );
}
