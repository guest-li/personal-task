import { PublicLayout } from "@/components/public/PublicLayout";
import Link from "next/link";

export const metadata = {
  title: "MalishaEdu - Your Gateway to International Education",
  description: "Study in top Chinese universities with guidance from experienced education consultants. 10,000+ students served, 73+ universities, 700+ scholarships.",
};

export default function HomePage() {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-brand-700 to-brand-900 text-white py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -mr-48 -mt-48" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full -ml-48 -mb-48" />
        </div>
        <div className="relative container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">Your Gateway to International Education</h1>
            <p className="text-xl md:text-2xl text-brand-100 mb-8 leading-relaxed">
              Connect with top universities, explore scholarships, and start your journey to success in China with expert guidance.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/universities"
                className="bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white font-bold px-8 py-3 rounded-lg transition-all duration-200 text-lg"
              >
                Explore Universities
              </Link>
              <Link
                href="/get-free-consultation"
                className="bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-3 rounded-lg border-2 border-white transition-all duration-200 text-lg"
              >
                Get Consultation
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-b border-brand-100">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "10,000+", label: "Students Served" },
              { number: "73", label: "Universities" },
              { number: "700+", label: "Scholarships" },
              { number: "15+", label: "Years Experience" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-brand-800 mb-2">{stat.number}</p>
                <p className="text-gray-600 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Universities */}
      <section className="py-16 md:py-24 bg-brand-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-800 mb-4">Top Universities</h2>
            <p className="text-gray-600 text-lg">Connect with China's leading institutions</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Tsinghua University", rank: 1, location: "Beijing" },
              { name: "Peking University", rank: 2, location: "Beijing" },
              { name: "Zhejiang University", rank: 3, location: "Hangzhou" },
            ].map((uni) => (
              <div
                key={uni.name}
                className="bg-white border border-brand-100 rounded-lg shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200 p-6"
              >
                <div className="h-32 bg-gradient-to-br from-brand-100 to-brand-200 rounded-lg mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">{uni.name}</h3>
                <p className="text-gray-600 mb-1">Rank: #{uni.rank}</p>
                <p className="text-gray-600 mb-4">📍 {uni.location}</p>
                <Link
                  href="/universities"
                  className="block w-full bg-gradient-to-r from-brand-700 to-brand-800 hover:from-brand-800 hover:to-brand-900 text-white font-bold py-2 rounded-lg text-center transition-all duration-200"
                >
                  Learn More
                </Link>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              href="/universities"
              className="text-brand-600 hover:text-brand-800 font-bold text-lg transition-colors"
            >
              View all 73 universities →
            </Link>
          </div>
        </div>
      </section>

      {/* Services Strip */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-800 mb-4">Our Services</h2>
            <p className="text-gray-600 text-lg">Comprehensive support for your journey</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: "📋", title: "University Selection", desc: "Expert guidance to find your perfect match" },
              { icon: "📝", title: "Application Support", desc: "Complete assistance with applications" },
              { icon: "🎓", title: "Scholarship Help", desc: "Maximize your scholarship opportunities" },
              { icon: "📚", title: "Language Preparation", desc: "IELTS and Mandarin coaching" },
              { icon: "✈️", title: "Visa Assistance", desc: "Smooth visa and immigration process" },
              { icon: "🏠", title: "Accommodation", desc: "Housing support and guidance" },
            ].map((service) => (
              <div key={service.title} className="text-center p-6 rounded-lg hover:bg-brand-50 transition-colors">
                <p className="text-5xl mb-3">{service.icon}</p>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
                <p className="text-gray-600">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 bg-brand-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-800 mb-4">How It Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { num: "1", title: "Free Consultation", desc: "Meet with our experts to discuss your goals" },
              { num: "2", title: "Personalized Plan", desc: "We create a tailored study plan for you" },
              { num: "3", title: "Complete Support", desc: "We guide you through every step" },
            ].map((step) => (
              <div key={step.num} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-brand-700 to-brand-800 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                  {step.num}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-800 mb-4">Success Stories</h2>
            <p className="text-gray-600 text-lg">What our students say</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { name: "Sarah Chen", country: "Malaysia", text: "MalishaEdu made my dream of studying at Tsinghua a reality! Highly recommended." },
              { name: "Ahmed Hassan", country: "Egypt", text: "The visa process was smooth thanks to their expert guidance. Thank you!" },
              { name: "Priya Sharma", country: "India", text: "Best investment for my future. The scholarship they helped me get is life-changing." },
            ].map((testimonial) => (
              <div key={testimonial.name} className="bg-brand-50 rounded-lg p-6 border border-brand-100">
                <p className="text-yellow-400 mb-3">★ ★ ★ ★ ★</p>
                <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
                <p className="font-bold text-gray-900">{testimonial.name}</p>
                <p className="text-gray-600 text-sm">📍 {testimonial.country}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-gradient-to-r from-accent-500 to-accent-600 text-white py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Start Your Journey Today</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of students who have successfully studied in China with MalishaEdu's expert guidance.
          </p>
          <Link
            href="/get-free-consultation"
            className="inline-block bg-white text-accent-600 font-bold px-8 py-4 rounded-lg hover:bg-gray-100 transition-all duration-200 text-lg"
          >
            Get Free Consultation Now
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
