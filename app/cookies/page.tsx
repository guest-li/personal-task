import { PublicLayout } from "@/components/public/PublicLayout";

export const metadata = {
  title: "Cookie Policy - MalishaEdu",
  description: "Cookie policy for MalishaEdu platform.",
};

export default function CookiesPage() {
  return (
    <PublicLayout>
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-4xl font-bold mb-12">Cookie Policy</h1>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">What Are Cookies?</h2>
              <p className="text-gray-700">
                Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">How MalishaEdu Uses Cookies</h2>
              <p className="text-gray-700 mb-4">
                We use cookies for the following purposes:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>To remember your preferences and settings</li>
                <li>To understand how you use our service</li>
                <li>To improve the performance and functionality of our website</li>
                <li>To provide personalized content and ads</li>
                <li>To analyze traffic and usage patterns</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Types of Cookies We Use</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Essential Cookies</h3>
                  <p className="text-gray-700">
                    These cookies are necessary for the website to function properly and enable core functionality.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Performance Cookies</h3>
                  <p className="text-gray-700">
                    These cookies help us understand how visitors interact with our website by collecting and reporting information.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Preference Cookies</h3>
                  <p className="text-gray-700">
                    These cookies remember your choices and preferences to provide a more personalized experience.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Marketing Cookies</h3>
                  <p className="text-gray-700">
                    These cookies are used to track your activity and target you with relevant advertising.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Managing Cookies</h2>
              <p className="text-gray-700 mb-4">
                You can control and manage cookies in your browser settings. Most browsers allow you to refuse cookies or alert you when cookies are being sent. However, blocking cookies may impact website functionality.
              </p>
              <p className="text-gray-700">
                For more information about managing cookies, visit your browser&apos;s help pages.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Third-Party Cookies</h2>
              <p className="text-gray-700">
                We may allow third-party service providers to place cookies on your device for analytics, advertising, and other purposes. These third parties have their own privacy policies governing their use of cookies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to This Policy</h2>
              <p className="text-gray-700">
                We may update this Cookie Policy from time to time. We recommend reviewing this policy periodically to stay informed of any changes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-gray-700">
                If you have questions about our Cookie Policy, please contact us at privacy@malishaedu.com
              </p>
            </section>

            <p className="text-gray-600 text-sm mt-12">
              Last updated: April 2024
            </p>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
