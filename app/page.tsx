import { PublicLayout } from "@/components/public/PublicLayout";
import { HeroSection } from "@/components/public/HeroSection";
import { FeatureHighlights } from "@/components/public/FeatureHighlights";
import { StatsSection } from "@/components/public/StatsSection";
import { TestimonialsSection } from "@/components/public/TestimonialsSection";
import { CTAButtons } from "@/components/public/CTAButtons";
import Link from "next/link";

export const metadata = {
  title: "MalishaEdu - Your Gateway to International Education",
  description: "Study in top Chinese universities with guidance from experienced education consultants. 10,000+ students served, 73+ universities, 700+ scholarships.",
};

export default function HomePage() {
  return (
    <PublicLayout>
      <HeroSection />
      <StatsSection />

      {/* Featured Universities */}
      <section className="py-16 md:py-24 bg-brand-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-800 mb-4">Top Universities</h2>
            <p className="text-gray-600 text-lg">Connect with China&apos;s leading institutions</p>
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

      <FeatureHighlights />

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

      <TestimonialsSection />

      <CTAButtons />
    </PublicLayout>
  );
}
