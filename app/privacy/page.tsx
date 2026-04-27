import { PublicLayout } from "@/components/public/PublicLayout";

export const metadata = {
  title: "Privacy Policy - MalishaEdu",
  description: "Privacy policy for MalishaEdu platform.",
};

export default function PrivacyPage() {
  return (
    <PublicLayout>
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-4xl font-bold mb-12">Privacy Policy</h1>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
              <p className="text-gray-700">
                MalishaEdu (we, us, our, or Company) operates the website. This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Information Collection and Use</h2>
              <p className="text-gray-700 mb-4">
                We collect several different types of information for various purposes to provide and improve our service to you.
              </p>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Types of Data Collected:</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Personal Data: Name, email address, phone number, address</li>
                <li>Usage Data: Browser type, pages visited, time spent on pages</li>
                <li>Location Data: Country, city, timezone</li>
                <li>Cookies and similar technologies for tracking</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Use of Data</h2>
              <p className="text-gray-700">
                MalishaEdu uses the collected data for various purposes:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-2">
                <li>To provide and maintain our service</li>
                <li>To notify you about changes to our service</li>
                <li>To allow you to participate in interactive features</li>
                <li>To provide customer support</li>
                <li>To gather analysis or valuable information to improve our service</li>
                <li>To monitor the usage of our service</li>
                <li>To detect, prevent and address technical issues</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Security of Data</h2>
              <p className="text-gray-700">
                The security of your data is important to us but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal data, we cannot guarantee its absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to This Privacy Policy</h2>
              <p className="text-gray-700">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the effective date at the bottom of this page.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-gray-700">
                If you have any questions about this Privacy Policy, please contact us at privacy@malishaedu.com
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
