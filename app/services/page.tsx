import { PublicLayout } from "@/components/public/PublicLayout";
import Link from "next/link";

export const metadata = {
  title: "Our Services",
  description: "Comprehensive education and consultation services for studying in China.",
};

export default function ServicesPage() {
  const services = [
    {
      id: "1",
      title: "University Selection",
      description: "Get personalized recommendations based on your profile and goals.",
      icon: "🎓",
    },
    {
      id: "2",
      title: "Application Assistance",
      description: "Expert guidance through the entire application process.",
      icon: "📝",
    },
    {
      id: "3",
      title: "Scholarship Guidance",
      description: "Find and apply for scholarships that match your qualifications.",
      icon: "💰",
    },
    {
      id: "4",
      title: "Visa Consultation",
      description: "Complete support for your student visa application.",
      icon: "📜",
    },
    {
      id: "5",
      title: "Language Preparation",
      description: "Prepare for language proficiency tests with our guidance.",
      icon: "🗣️",
    },
    {
      id: "6",
      title: "Post-Arrival Support",
      description: "Assistance after arrival including accommodation and orientation.",
      icon: "🏠",
    },
  ];

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Our Services</h1>
        <p className="text-lg text-gray-600 mb-12">
          Comprehensive support to help you achieve your educational goals in China
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {services.map((service) => (
            <Link
              key={service.id}
              href={`/services/${service.id}`}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition cursor-pointer"
            >
              <div className="text-4xl mb-4">{service.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
              <p className="text-gray-600">{service.description}</p>
              <div className="mt-4 text-blue-600 font-semibold">Learn more →</div>
            </Link>
          ))}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Why Choose Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "Expert consultants with 10+ years of experience",
              "Partnerships with top Chinese universities",
              "High student acceptance rate (95%+)",
              "24/7 customer support",
              "Transparent pricing",
              "Personalized guidance for each student",
            ].map((reason, index) => (
              <div key={index} className="flex items-start gap-3">
                <span className="text-green-500 font-bold text-lg">✓</span>
                <span className="text-gray-700">{reason}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-gray-600 mb-6">
            Schedule a free consultation with our expert advisors
          </p>
          <Link
            href="/get-free-consultation"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded font-semibold hover:bg-blue-700"
          >
            Get Free Consultation
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
