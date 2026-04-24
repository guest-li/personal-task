import { PublicLayout } from "@/src/components/public/PublicLayout";
import Link from "next/link";

export const metadata = {
  title: "About Us",
  description: "Learn about our mission, vision, and commitment to student success.",
};

export default function AboutPage() {
  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-6">About Us</h1>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div>
            <h2 className="text-2xl font-bold mb-4">Who We Are</h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              Founded in 2015, we are a leading education consultancy dedicated to helping international
              students pursue their dreams of studying in China. With headquarters in multiple cities and
              partnerships with over 50 top universities, we've successfully guided thousands of students
              to achieve their educational goals.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Our team of experienced consultants brings diverse expertise and genuine passion for
              transforming lives through education. We pride ourselves on our personalized approach,
              comprehensive support, and unwavering commitment to our students' success.
            </p>
          </div>
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-8 flex flex-col justify-center">
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">10K+</div>
              <p className="text-blue-100 mb-6">Students Successfully Placed</p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { number: "95%", label: "Acceptance Rate" },
                  { number: "50+", label: "Partner Universities" },
                ].map((stat, index) => (
                  <div key={index}>
                    <div className="text-3xl font-bold">{stat.number}</div>
                    <p className="text-sm text-blue-100">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Our Mission & Vision</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-xl font-bold text-blue-900 mb-3">Our Mission</h3>
              <p className="text-gray-700">
                To provide transparent, personalized, and comprehensive educational guidance, helping
                students from around the world gain access to quality higher education in China and
                achieve their full potential.
              </p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-xl font-bold text-green-900 mb-3">Our Vision</h3>
              <p className="text-gray-700">
                To be the most trusted bridge connecting aspiring students with world-class educational
                opportunities in China, fostering global understanding and cultural exchange.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Integrity",
                description: "We operate with honesty and transparency in all our dealings",
              },
              {
                title: "Excellence",
                description: "We strive for the highest quality in our services and support",
              },
              {
                title: "Student-Centric",
                description: "Your success is our primary focus and driving motivation",
              },
              {
                title: "Innovation",
                description: "We continuously improve our processes and services",
              },
              {
                title: "Empathy",
                description: "We understand and support students through every challenge",
              },
              {
                title: "Partnership",
                description: "We work collaboratively with universities and students",
              },
            ].map((value, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-gray-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-gray-600 mb-6">
            Join thousands of successful students who've achieved their dreams with us
          </p>
          <Link
            href="/get-free-consultation"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded font-semibold hover:bg-blue-700"
          >
            Schedule Your Consultation
          </Link>
        </section>
      </div>
    </PublicLayout>
  );
}
