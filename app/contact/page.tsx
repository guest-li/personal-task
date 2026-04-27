import { PublicLayout } from "@/components/public/PublicLayout";
import { ContactForm } from "@/components/public/ContactForm";

export const metadata = {
  title: "Contact Us - MalishaEdu",
  description: "Get in touch with MalishaEdu for any questions or support.",
};

export default function ContactPage() {
  return (
    <PublicLayout>
      <section className="bg-gradient-to-r from-brand-700 to-brand-800 text-white py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Contact Us</h1>
          <p className="text-xl text-brand-100 max-w-2xl mx-auto">
            We&apos;d love to hear from you. Get in touch with our team.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold mb-6">Send us a Message</h2>
              <ContactForm />
            </div>

            {/* Contact Info */}
            <div>
              <h2 className="text-3xl font-bold mb-6">Get in Touch</h2>
              <div className="space-y-8">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">📧 Email</h3>
                  <p className="text-gray-600">
                    <a href="mailto:info@malishaedu.com" className="hover:text-brand-600 transition">
                      info@malishaedu.com
                    </a>
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">📱 Phone</h3>
                  <p className="text-gray-600">
                    <a href="tel:+8613800000000" className="hover:text-brand-600 transition">
                      +86 138 0000 0000
                    </a>
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">📍 Office Location</h3>
                  <p className="text-gray-600">
                    Beijing, China<br />
                    Monday - Friday: 9AM - 6PM<br />
                    Saturday - Sunday: 10AM - 4PM
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">💬 Live Chat</h3>
                  <p className="text-gray-600">
                    Chat with us online at any time. We typically respond within 1 hour.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
