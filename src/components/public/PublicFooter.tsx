import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="bg-brand-800 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Column */}
          <div>
            <Link href="/" className="text-2xl font-bold text-white hover:text-brand-100 transition-colors inline-block mb-3">
              MalishaEdu
            </Link>
            <p className="text-brand-100 text-sm mb-6">Your gateway to international education</p>
            <div className="flex gap-4">
              <a href="#" className="text-brand-100 hover:text-white transition-colors text-sm font-medium">Facebook</a>
              <a href="#" className="text-brand-100 hover:text-white transition-colors text-sm font-medium">Twitter</a>
              <a href="#" className="text-brand-100 hover:text-white transition-colors text-sm font-medium">Instagram</a>
              <a href="#" className="text-brand-100 hover:text-white transition-colors text-sm font-medium">YouTube</a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold mb-4 text-white">Explore</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/universities" className="text-brand-100 hover:text-white transition-colors">Universities</Link></li>
              <li><Link href="/courses" className="text-brand-100 hover:text-white transition-colors">Courses</Link></li>
              <li><Link href="/scholarships" className="text-brand-100 hover:text-white transition-colors">Scholarships</Link></li>
              <li><Link href="/blog" className="text-brand-100 hover:text-white transition-colors">Blog</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-bold mb-4 text-white">Services</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/services" className="text-brand-100 hover:text-white transition-colors">Admission Guidance</Link></li>
              <li><Link href="/services" className="text-brand-100 hover:text-white transition-colors">Language Prep</Link></li>
              <li><Link href="/services" className="text-brand-100 hover:text-white transition-colors">Airport Pickup</Link></li>
              <li><Link href="/services" className="text-brand-100 hover:text-white transition-colors">On-Campus Support</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-bold mb-4 text-white">Newsletter</h3>
            <p className="text-brand-100 text-sm mb-3">Subscribe for updates</p>
            <form className="flex flex-col gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Your email"
                className="px-3 py-2 rounded text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-500"
                required
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white font-medium px-3 py-2 rounded transition-all duration-200"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-brand-700 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center text-sm">
            <div className="text-brand-100">
              &copy; 2026 MalishaEdu. All rights reserved.
            </div>
            <div className="flex justify-center gap-6 text-brand-100">
              <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms-conditions" className="hover:text-white transition-colors">Terms</Link>
              <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
            </div>
            <div className="text-right text-brand-100">
              Built with ❤️ in China
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
