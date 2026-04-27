import { PublicLayout } from "@/components/public/PublicLayout";
import Link from "next/link";

export const metadata = {
  title: "About MalishaEdu - Our Mission & Story",
  description: "Learn about MalishaEdu's mission to help students find their perfect education path in China.",
};

export default function AboutPage() {
  return (
    <PublicLayout>
      <section className="bg-gradient-to-r from-brand-700 to-brand-800 text-white py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About MalishaEdu</h1>
          <p className="text-xl text-brand-100 max-w-2xl mx-auto">
            Empowering students worldwide to achieve their educational dreams in China
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <div className="bg-brand-50 p-8 rounded-lg">
              <h2 className="text-3xl font-bold text-brand-700 mb-4">Our Mission</h2>
              <p className="text-gray-700 text-lg leading-relaxed">
                To connect international students with world-class universities in China and provide expert guidance
                through every step of their educational journey. We believe every student deserves access to quality
                education regardless of their background.
              </p>
            </div>
            <div className="bg-brand-50 p-8 rounded-lg">
              <h2 className="text-3xl font-bold text-brand-700 mb-4">Our Vision</h2>
              <p className="text-gray-700 text-lg leading-relaxed">
                To be the most trusted platform for international students seeking education in China, known for our
                expert guidance, transparent service, and genuine care for student success. We envision a world where
                geography is no barrier to quality education.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                title: "Student-First Approach",
                description: "Every decision we make prioritizes student success and well-being above all else.",
              },
              {
                title: "Transparency",
                description: "We believe in honest communication and full transparency in all our dealings.",
              },
              {
                title: "Excellence",
                description: "We maintain the highest standards in everything we do, from advice to service delivery.",
              },
            ].map((value) => (
              <div key={value.title} className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-xl font-bold text-brand-700 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-12">Our Team</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
            Our team consists of education consultants, university liaisons, and customer service professionals with
            years of experience in international education.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { role: "15+", desc: "Years of combined experience" },
              { role: "50+", desc: "Expert consultants on staff" },
              { role: "10,000+", desc: "Students successfully placed" },
            ].map((item) => (
              <div key={item.role} className="p-6">
                <p className="text-5xl font-bold text-brand-700 mb-2">{item.role}</p>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Our Journey</h2>
          <div className="max-w-3xl mx-auto">
            {[
              { year: "2008", event: "MalishaEdu founded with a vision to bridge international education" },
              { year: "2012", event: "Expanded to serve students from 50+ countries" },
              { year: "2016", event: "Partnered with 70+ Chinese universities" },
              { year: "2020", event: "Launched digital platform serving 10,000+ students" },
            ].map((milestone) => (
              <div key={milestone.year} className="flex gap-6 mb-8">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-brand-600 text-white font-bold">
                    {milestone.year.slice(-2)}
                  </div>
                </div>
                <div className="pt-2">
                  <h3 className="font-bold text-lg text-gray-900">{milestone.year}</h3>
                  <p className="text-gray-600">{milestone.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-brand-700 text-white text-center">
        <h2 className="text-4xl font-bold mb-6">Ready to Join Our Success Stories?</h2>
        <Link
          href="/get-free-consultation"
          className="inline-block bg-white text-brand-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
        >
          Book Free Consultation
        </Link>
      </section>
    </PublicLayout>
  );
}
