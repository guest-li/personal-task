import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Quick Links */}
          <div>
            <h3 className="font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/universities" className="hover:text-blue-400">Universities</Link></li>
              <li><Link href="/courses" className="hover:text-blue-400">Courses</Link></li>
              <li><Link href="/scholarships" className="hover:text-blue-400">Scholarships</Link></li>
              <li><Link href="/events" className="hover:text-blue-400">Events</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-bold mb-4">Services</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/services/admission-service" className="hover:text-blue-400">Admission</Link></li>
              <li><Link href="/services/language-foundation" className="hover:text-blue-400">Language & Foundation</Link></li>
              <li><Link href="/services/airport-pickup" className="hover:text-blue-400">Airport Pickup</Link></li>
              <li><Link href="/services/on-campus-service" className="hover:text-blue-400">On-Campus Service</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-bold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy-policy" className="hover:text-blue-400">Privacy Policy</Link></li>
              <li><Link href="/refund-policy" className="hover:text-blue-400">Refund Policy</Link></li>
              <li><Link href="/terms-conditions" className="hover:text-blue-400">Terms & Conditions</Link></li>
              <li><Link href="/faqs" className="hover:text-blue-400">FAQs</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-bold mb-4">Newsletter</h3>
            <form className="flex flex-col gap-2" onSubmit={(e) => {
              e.preventDefault();
            }}>
              <input type="email" placeholder="Your email" className="px-3 py-2 rounded text-black" required />
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded">Subscribe</button>
            </form>
            <div className="mt-4">
              <p className="text-sm mb-2">Follow Us</p>
              <div className="flex gap-4">
                <Link href="#" className="text-blue-400 hover:text-blue-500">Facebook</Link>
                <Link href="#" className="text-blue-400 hover:text-blue-500">Twitter</Link>
                <Link href="#" className="text-blue-400 hover:text-blue-500">Instagram</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8">
          <div className="text-center text-sm text-gray-400">
            <p>&copy; 2026 MalishaEdu. All rights reserved.</p>
            <p className="mt-2">Hotline: +8618613114366 | Email: info@malishaedu.com</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
