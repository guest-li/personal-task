import { PublicLayout } from "@/components/public/PublicLayout";
import Link from "next/link";

const officeDetails: Record<string, any> = {
  "1": {
    name: "Beijing Office",
    address: "123 Education Street, Chaoyang District, Beijing 100000",
    phone: "+86 10 1234 5678",
    email: "beijing@educationchina.com",
    hours: {
      weekday: "9:00 AM - 6:00 PM",
      weekend: "10:00 AM - 4:00 PM",
    },
    staff: 15,
    established: "2015",
  },
  "2": {
    name: "Shanghai Office",
    address: "456 Academic Ave, Pudong District, Shanghai 200000",
    phone: "+86 21 1234 5678",
    email: "shanghai@educationchina.com",
    hours: {
      weekday: "9:00 AM - 6:00 PM",
      weekend: "10:00 AM - 4:00 PM",
    },
    staff: 12,
    established: "2016",
  },
  "3": {
    name: "Xi'an Office",
    address: "789 Learning Lane, Beilin District, Xi'an 710000",
    phone: "+86 29 1234 5678",
    email: "xian@educationchina.com",
    hours: {
      weekday: "9:00 AM - 6:00 PM",
      weekend: "10:00 AM - 4:00 PM",
    },
    staff: 8,
    established: "2017",
  },
};

export async function generateMetadata({ params }: { params: { id: string } }) {
  const office = officeDetails[params.id];
  return {
    title: office?.name || "Office",
    description: office?.address || "Office details",
  };
}

export default function OfficeDetailPage({ params }: { params: { id: string } }) {
  const office = officeDetails[params.id];

  if (!office) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Office not found</h1>
            <Link href="/contact" className="text-blue-600 hover:underline mt-4 inline-block">
              Back to Contact
            </Link>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8">
        <Link href="/contact" className="text-blue-600 hover:underline mb-4 inline-block">
          ← Back to Contact
        </Link>

        <h1 className="text-4xl font-bold mb-8">{office.name}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg h-80 flex items-center justify-center text-white">
              <div className="text-center">
                <div className="text-6xl mb-4">📍</div>
                <p className="text-lg">{office.name}</p>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Location</h3>
                <p className="text-gray-700 leading-relaxed">{office.address}</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Contact</h3>
                <p className="text-gray-700 mb-2">
                  <strong>Phone:</strong> {office.phone}
                </p>
                <p className="text-gray-700">
                  <strong>Email:</strong> {office.email}
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Office Hours</h3>
                <p className="text-gray-700 mb-2">
                  <strong>Weekdays:</strong> {office.hours.weekday}
                </p>
                <p className="text-gray-700">
                  <strong>Weekends:</strong> {office.hours.weekend}
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Office Info</h3>
                <p className="text-gray-700 mb-2">
                  <strong>Staff:</strong> {office.staff} professionals
                </p>
                <p className="text-gray-700">
                  <strong>Established:</strong> {office.established}
                </p>
              </div>
            </div>

            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">What We Offer at This Location</h2>
              <ul className="space-y-2">
                {[
                  "Face-to-face consultations",
                  "Document verification",
                  "Application assistance",
                  "Visa guidance",
                  "Scholarship counseling",
                  "Test preparation support",
                ].map((service, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <span className="text-green-600 font-bold">✓</span>
                    <span className="text-gray-700">{service}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <aside className="bg-gray-50 rounded-lg p-6 h-fit">
            <h3 className="text-xl font-bold mb-4">Visit Us</h3>
            <p className="text-sm text-gray-600 mb-6">
              Book a consultation at our office to meet our team in person.
            </p>
            <div className="space-y-3">
              <button className="w-full bg-blue-600 text-white px-4 py-3 rounded hover:bg-blue-700 font-semibold transition">
                Schedule Office Visit
              </button>
              <button className="w-full border-2 border-blue-600 text-blue-600 px-4 py-3 rounded hover:bg-blue-50 font-semibold transition">
                Get Directions
              </button>
            </div>

            <hr className="my-6" />

            <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link href="/" className="block text-blue-600 hover:underline text-sm">
                Home
              </Link>
              <Link href="/services" className="block text-blue-600 hover:underline text-sm">
                Services
              </Link>
              <Link href="/get-free-consultation" className="block text-blue-600 hover:underline text-sm">
                Book Consultation
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </PublicLayout>
  );
}
