import { PublicLayout } from "@/components/public/PublicLayout";
import { FAQAccordion } from "@/components/public/FAQAccordion";
import Link from "next/link";

export const metadata = {
  title: "FAQ - MalishaEdu",
  description: "Frequently asked questions about studying in China with MalishaEdu.",
};

const faqItems = [
  {
    category: "Admission",
    items: [
      { question: "What are the admission requirements?", answer: "Admission requirements vary by university and program. Generally, you need a high school diploma or equivalent, English proficiency (TOEFL/IELTS), and sometimes entrance exams. Our consultants can help verify specific requirements for your chosen university." },
      { question: "What is the application timeline?", answer: "Most applications are accepted year-round, but we recommend applying 6-12 months before your desired start date. Different universities have different deadlines, and we help you plan accordingly." },
      { question: "Can I apply to multiple universities?", answer: "Yes, absolutely! We recommend applying to 3-5 universities to increase your chances of acceptance. This is a common practice and helps you compare offers." },
    ]
  },
  {
    category: "Finance",
    items: [
      { question: "How much does it cost to study in China?", answer: "Tuition ranges from $2,000-$8,000 USD per year depending on the university and program. Living expenses are around $300-$600 monthly. Many scholarships can cover partial or full tuition." },
      { question: "What scholarships are available?", answer: "We help students access Chinese government scholarships, university-specific scholarships, and merit-based awards. Over 700 scholarship opportunities are available annually." },
      { question: "Do you charge any fees?", answer: "Consultations are free! We make money through university partnerships, not student fees. Our service is completely transparent." },
    ]
  },
  {
    category: "Visa",
    items: [
      { question: "Do I need a visa to study in China?", answer: "Yes, all international students need an X visa (student visa). We handle all documentation and guide you through the application process." },
      { question: "How long does visa processing take?", answer: "Typically 2-4 weeks, but it can be faster with express service. We help you apply with sufficient time before your program starts." },
      { question: "What documents do I need for a visa?", answer: "You'll need your passport, acceptance letter, financial proof, health check, and other documents. We provide a complete checklist and help you prepare everything." },
    ]
  },
  {
    category: "Accommodation",
    items: [
      { question: "Does the university provide housing?", answer: "Most universities offer on-campus dormitories for international students. Costs are typically $100-$300 monthly. Many students prefer dorm life as it's convenient and social." },
      { question: "Can I find off-campus housing?", answer: "Yes, many areas near universities have affordable apartments. We can guide you on neighborhoods, costs, and how to arrange this once you're admitted." },
      { question: "Is on-campus housing mandatory?", answer: "Some universities require on-campus housing for first-year students. After that, you can choose. We help navigate these policies for each university." },
    ]
  },
];

export default function FAQPage() {
  return (
    <PublicLayout>
      <section className="bg-gradient-to-r from-brand-700 to-brand-800 text-white py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Frequently Asked Questions</h1>
          <p className="text-xl text-brand-100 max-w-2xl mx-auto">
            Find answers to common questions about studying in China
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-3xl">
          {faqItems.map((section) => (
            <div key={section.category} className="mb-12">
              <h2 className="text-3xl font-bold text-brand-700 mb-6">{section.category}</h2>
              <FAQAccordion items={section.items} />
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Still have questions?</h2>
          <p className="text-xl text-gray-600 mb-8">Our consultants are here to help.</p>
          <Link
            href="/get-free-consultation"
            className="inline-block bg-brand-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-brand-800 transition"
          >
            Book Free Consultation
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
