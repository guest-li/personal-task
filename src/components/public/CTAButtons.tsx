import Link from "next/link";

export function CTAButtons() {
  return (
    <div className="py-16 bg-brand-700 text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold mb-6">Ready to Start Your Journey?</h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto text-brand-100">
          Get personalized guidance from our expert consultants and find the perfect
          university and program for you.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/get-free-consultation"
            className="bg-white text-brand-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Book Free Consultation
          </Link>
          <Link
            href="/universities"
            className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-brand-800 transition"
          >
            Explore Universities
          </Link>
        </div>
      </div>
    </div>
  );
}
