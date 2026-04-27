import { PublicLayout } from "@/components/public/PublicLayout";

export const metadata = {
  title: "Terms of Service - MalishaEdu",
  description: "Terms of service for MalishaEdu platform.",
};

export default function TermsPage() {
  return (
    <PublicLayout>
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-4xl font-bold mb-12">Terms of Service</h1>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Agreement to Terms</h2>
              <p className="text-gray-700">
                By accessing and using MalishaEdu platform, you accept and agree to be bound by the terms and provision of this agreement.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Use License</h2>
              <p className="text-gray-700">
                Permission is granted to temporarily download one copy of the materials (information or software) on MalishaEdu for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-2">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose or for any public display</li>
                <li>Attempt to reverse engineer any software contained on MalishaEdu</li>
                <li>Transmit or distribute any content you do not have a right to transmit</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Disclaimer</h2>
              <p className="text-gray-700">
                The materials on MalishaEdu are provided on an as is basis. MalishaEdu makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Limitations of Liability</h2>
              <p className="text-gray-700">
                In no event shall MalishaEdu or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on MalishaEdu.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Accuracy of Materials</h2>
              <p className="text-gray-700">
                The materials appearing on MalishaEdu could include technical, typographical, or photographic errors. MalishaEdu does not warrant that any of the materials on the website are accurate, complete, or current.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Links</h2>
              <p className="text-gray-700">
                MalishaEdu has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by MalishaEdu of the site. Use of any such linked website is at the user&apos;s own risk.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Modifications</h2>
              <p className="text-gray-700">
                MalishaEdu may revise these terms of service for the website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Governing Law</h2>
              <p className="text-gray-700">
                These terms of service are governed by and construed in accordance with the laws of People&apos;s Republic of China, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
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
