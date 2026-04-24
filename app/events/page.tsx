import { PublicLayout } from "@/components/public/PublicLayout";
import Link from "next/link";

export const metadata = {
  title: "Events & Webinars",
  description: "Join our educational events and webinars about studying in China.",
};

export default function EventsPage() {
  const mockEvents = [
    {
      id: "1",
      name: "China Higher Education Webinar",
      startDate: "2024-05-15",
      endDate: "2024-05-15",
      price: "0",
      category: "Webinar",
      location: "Online",
      description: "Learn about higher education opportunities in China",
    },
    {
      id: "2",
      name: "University Campus Virtual Tour",
      startDate: "2024-05-20",
      endDate: "2024-05-20",
      price: "0",
      category: "Virtual Tour",
      location: "Online",
      description: "Take a virtual tour of top Chinese universities",
    },
    {
      id: "3",
      name: "Scholarship Application Workshop",
      startDate: "2024-05-25",
      endDate: "2024-05-25",
      price: "0",
      category: "Workshop",
      location: "Online",
      description: "Master the scholarship application process",
    },
  ];

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Events & Webinars</h1>
        <p className="text-gray-600 mb-8">
          Join our upcoming events to learn more about studying in China
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white border border-gray-200 rounded-lg shadow hover:shadow-lg transition overflow-hidden"
            >
              <div className="h-40 bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                <span className="text-white text-4xl">{event.category[0]}</span>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{event.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{event.description}</p>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <p>
                    <strong>Date:</strong> {new Date(event.startDate).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Category:</strong> {event.category}
                  </p>
                  <p>
                    <strong>Location:</strong> {event.location}
                  </p>
                  {event.price !== "0" && (
                    <p>
                      <strong>Price:</strong> ¥{event.price}
                    </p>
                  )}
                </div>

                <button className="block w-full bg-blue-600 text-white text-center px-4 py-2 rounded hover:bg-blue-700 font-semibold">
                  Register Now
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Can't find what you're looking for?</h2>
          <p className="text-gray-600 mb-6">
            Contact us for personalized consultation sessions
          </p>
          <Link
            href="/get-free-consultation"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded font-semibold hover:bg-blue-700"
          >
            Book a Free Consultation
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
