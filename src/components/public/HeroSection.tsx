import Link from "next/link";

export function HeroSection() {
  return (
    <div className="bg-gradient-to-r from-brand-700 to-brand-800 text-white py-20 md:py-32">
      <div className="container mx-auto px-4">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Your Gateway to Education in China
        </h1>
        <p className="text-xl text-brand-100 mb-8 max-w-2xl">
          Discover world-class universities, find perfect programs, and secure scholarships.
          Expert guidance every step of the way.
        </p>
        <div className="flex gap-4 flex-wrap">
          <Link href="/universities" className="bg-white text-brand-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
            Explore Universities
          </Link>
          <Link href="/get-free-consultation" className="bg-brand-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-brand-700 transition">
            Get Free Consultation
          </Link>
        </div>
      </div>
    </div>
  );
}
