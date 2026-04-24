import { PublicLayout } from "@/components/public/PublicLayout";
import Link from "next/link";

const staticPages: Record<string, any> = {
  "why-china": {
    title: "Why Study in China?",
    description:
      "Discover the benefits and opportunities of studying in one of the world's fastest-growing education systems.",
    content: `China has emerged as a leading global education destination. Here's why thousands of international students choose to study here:

**World-Class Universities**: Chinese universities consistently rank among Asia's best, offering excellent education and research opportunities.

**Affordable Education**: Compared to Western universities, Chinese universities offer high-quality education at significantly lower costs, making education more accessible.

**Diverse Programs**: Universities offer thousands of programs in engineering, business, medicine, arts, and humanities, taught in both English and Chinese.

**Cultural Experience**: Study abroad while experiencing one of the world's richest cultures, vibrant cities, and fascinating history.

**Career Opportunities**: A degree from a Chinese university is recognized worldwide and opens doors to international career prospects.

**Scholarships**: China offers generous scholarships to international students, with many covering full tuition and living expenses.

**Growing Economy**: China is a global economic powerhouse, providing excellent networking and career opportunities.

**Advanced Research**: Chinese universities conduct cutting-edge research with state-of-the-art facilities.`,
  },
  "about-china": {
    title: "About China",
    description: "Learn about China as a study destination and what makes it special.",
    content: `China is the world's most populous country and the second-largest economy. As a study destination, it offers:

**Geographic Diversity**: From bustling metropolises like Beijing and Shanghai to historic cities like Xi'an and scenic regions, China has something for everyone.

**Modern Infrastructure**: Modern transportation networks, excellent healthcare, and contemporary amenities make student life comfortable.

**Safety and Stability**: China is generally safe for international students, with efficient law enforcement and student support services.

**Food and Cuisine**: Experience one of the world's most renowned cuisines with regional specialties throughout the country.

**Climate**: Varied climates across different regions - from temperate zones in the north to subtropical regions in the south.

**Language**: While learning Mandarin Chinese is beneficial, many universities offer programs taught entirely in English.

**Population and Demographics**: Experience a diverse student population with excellent opportunities to make international friendships.`,
  },
  "payment-process": {
    title: "Payment Process",
    description: "Understand how to make payments for applications, consultations, and tuition.",
    content: `We provide secure and convenient payment options for all our services:

**Payment Methods**:
- Credit/Debit Cards (Visa, Mastercard, American Express)
- Bank Transfer (International and local)
- Payment Gateway (WeChat Pay, Alipay for China-based clients)
- PayPal and other online payment systems

**Payment Timeline**:
- Consultation fees: Due upon booking
- Application service fees: Due before submission
- Tuition and accommodation: As per university payment schedule
- Scholarship processing: Upon confirmation

**Invoice and Receipts**:
All payments receive proper invoices and receipts for record-keeping and university submission.

**Payment Security**:
We use industry-standard encryption and secure payment gateways to protect your financial information.

**Refund Policy**:
Refunds are processed according to our refund policy. Please contact us for detailed information.

**Support**:
For payment inquiries, contact our accounting department at finance@educationchina.com`,
  },
  "privacy-policy": {
    title: "Privacy Policy",
    description: "Learn how we protect your personal information.",
    content: `**Your Privacy Matters to Us**

We are committed to protecting your personal information and ensuring your privacy. This privacy policy explains how we collect, use, and safeguard your data.

**Information We Collect**:
- Personal information (name, email, phone, address)
- Educational background and qualifications
- Passport and identification documents
- Financial information for payment processing
- Communication records

**How We Use Your Information**:
- To provide education consultancy services
- To process applications and admissions
- To arrange visa support and documentation
- To communicate about our services
- To improve our services
- To comply with legal requirements

**Data Security**:
We implement robust security measures to protect your information from unauthorized access, disclosure, alteration, and destruction.

**Third-Party Sharing**:
We only share your information with partner universities, visa authorities, and service providers as necessary for your education journey. We never sell your data.

**Your Rights**:
You have the right to access, correct, and delete your personal information. Contact us for any privacy concerns.

**Contact**:
For privacy inquiries: privacy@educationchina.com`,
  },
  "refund-policy": {
    title: "Refund Policy",
    description: "Understand our refund terms and conditions.",
    content: `**Refund Terms and Conditions**

**Consultation Services**:
- No refund after consultation has been provided
- Refund available if cancellation is made 7 days before scheduled consultation

**Application Processing Fees**:
- No refund after application has been submitted to university
- 50% refund if cancelled before application submission
- Full refund if cancelled more than 30 days before intended application date

**Service Fees**:
- Non-refundable once services have commenced
- Refundable if cancelled before service starts

**Visa Processing**:
- No refund after visa application has been submitted
- Refundable if cancelled before submission

**Cancellation by Us**:
If we cannot provide promised services, full refund will be issued.

**How to Request Refund**:
Submit written request to refunds@educationchina.com with details and original payment proof.

**Processing Time**:
Approved refunds are processed within 10-15 business days.

**Partial Refunds**:
For services partially completed, refunds are calculated proportionally.`,
  },
  "terms-conditions": {
    title: "Terms and Conditions",
    description: "Legal terms governing the use of our services.",
    content: `**Terms and Conditions**

**Acceptance**:
By using our services, you agree to be bound by these terms and conditions.

**Services**:
We provide education consultancy services including university selection, application assistance, scholarship guidance, visa support, and language preparation.

**Client Responsibilities**:
- Provide accurate information in applications
- Follow all instructions from our consultants
- Comply with university and visa requirements
- Pay fees as agreed

**Our Responsibilities**:
- Provide expert guidance and support
- Keep your information confidential
- Represent you fairly to universities
- Deliver services professionally

**Limitation of Liability**:
While we make best efforts to ensure acceptance, we cannot guarantee university admission or visa approval as these are determined by institutions.

**Intellectual Property**:
All materials, content, and services are our intellectual property. Unauthorized reproduction is prohibited.

**Governing Law**:
These terms are governed by the laws of the People's Republic of China.

**Amendments**:
We reserve the right to amend these terms at any time. Continued use implies acceptance.

**Dispute Resolution**:
Disputes shall be resolved through negotiation, mediation, or arbitration.`,
  },
  updates: {
    title: "Updates & News",
    redirectTo: "/updates",
  },
  instructor: {
    title: "Become an Instructor",
    redirectTo: "/instructor",
  },
};

export async function generateMetadata({ params }: { params: { pages: string[] } }) {
  const pageSlug = params.pages.join("-");
  const page = staticPages[pageSlug];
  return {
    title: page?.title || "Page",
    description: page?.description || "Page details",
  };
}

export default function StaticPage({ params }: { params: { pages: string[] } }) {
  const pageSlug = params.pages.join("-");
  const page = staticPages[pageSlug];

  if (!page) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-red-600 mb-4">404 - Page Not Found</h1>
            <p className="text-gray-600 mb-8">The page you're looking for doesn't exist.</p>
            <Link href="/" className="text-blue-600 hover:underline font-semibold text-lg">
              Go Back Home
            </Link>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (page.redirectTo) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-gray-600 mb-4">Redirecting...</p>
          <Link href={page.redirectTo} className="text-blue-600 hover:underline font-semibold">
            Click here if not redirected automatically
          </Link>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8">
        <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
          ← Home
        </Link>

        <article className="max-w-3xl">
          <h1 className="text-4xl font-bold mb-8">{page.title}</h1>

          <div className="prose max-w-none bg-white border border-gray-200 rounded-lg p-8">
            <div className="text-gray-700 leading-relaxed whitespace-pre-line">
              {page.content}
            </div>
          </div>

          <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Need More Information?</h2>
            <p className="text-gray-600 mb-6">
              Contact our team for detailed information or clarifications
            </p>
            <Link
              href="/contact"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded font-semibold hover:bg-blue-700"
            >
              Contact Us
            </Link>
          </div>
        </article>
      </div>
    </PublicLayout>
  );
}
