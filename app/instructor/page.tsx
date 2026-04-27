import { PublicLayout } from "@/components/public/PublicLayout";
import Link from "next/link";

export const metadata = {
  title: "Become an Instructor",
  description: "Join our team as an education consultant or instructor.",
};

export default function InstructorPage() {
  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-2">Become an Instructor</h1>
        <p className="text-lg text-gray-600 mb-12">
          Share your expertise and help shape the futures of international students
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            {/* Overview */}
            <section className="bg-white border border-gray-200 rounded-lg p-8 mb-8">
              <h2 className="text-2xl font-bold mb-4">Why Join Us?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    icon: "🌍",
                    title: "Global Impact",
                    desc: "Help international students achieve their educational dreams",
                  },
                  {
                    icon: "💰",
                    title: "Competitive Compensation",
                    desc: "Attractive rates for teaching and consulting services",
                  },
                  {
                    icon: "🤝",
                    title: "Growing Network",
                    desc: "Build relationships with educators and professionals worldwide",
                  },
                  {
                    icon: "📚",
                    title: "Professional Growth",
                    desc: "Access to training and development opportunities",
                  },
                  {
                    icon: "⏰",
                    title: "Flexible Scheduling",
                    desc: "Teach and consult at times that work for you",
                  },
                  {
                    icon: "🏆",
                    title: "Recognition",
                    desc: "Build your reputation in education consulting",
                  },
                ].map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="text-3xl">{item.icon}</div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                      <p className="text-gray-600 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Opportunities */}
            <section className="bg-white border border-gray-200 rounded-lg p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6">Available Positions</h2>

              <div className="space-y-6">
                {[
                  {
                    title: "Education Consultant",
                    type: "Part-time/Full-time",
                    description:
                      "Guide students through university selection, applications, and visa processes.",
                    requirements: [
                      "5+ years experience in education sector",
                      "Strong knowledge of international education",
                      "Excellent communication skills",
                      "Passion for helping students succeed",
                    ],
                  },
                  {
                    title: "Language Instructor (IELTS/TOEFL)",
                    type: "Part-time/Full-time",
                    description: "Teach English language proficiency test preparation to international students.",
                    requirements: [
                      "Teaching certification (CELTA, TEFL, or equivalent)",
                      "3+ years teaching experience",
                      "IELTS/TOEFL expertise",
                      "Strong teaching methodology knowledge",
                    ],
                  },
                  {
                    title: "Chinese Language Instructor",
                    type: "Part-time/Full-time",
                    description:
                      "Teach Mandarin Chinese to international students preparing for HSK exams.",
                    requirements: [
                      "Native or fluent Mandarin speaker",
                      "Chinese language teaching certification",
                      "3+ years teaching experience",
                      "Understanding of HSK requirements",
                    ],
                  },
                  {
                    title: "Essay Writing Coach",
                    type: "Part-time",
                    description:
                      "Help students improve their essay and personal statement writing for applications.",
                    requirements: [
                      "Excellent writing skills",
                      "Experience in academic writing",
                      "Understanding of application essays",
                      "Ability to provide constructive feedback",
                    ],
                  },
                ].map((position, index) => (
                  <div
                    key={index}
                    className="border-l-4 border-blue-600 pl-6 py-4 hover:bg-gray-50 transition"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{position.title}</h3>
                      <span className="text-sm font-semibold bg-blue-100 text-blue-700 px-3 py-1 rounded">
                        {position.type}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-4">{position.description}</p>
                    <p className="text-sm font-semibold text-gray-900 mb-2">Requirements:</p>
                    <ul className="space-y-1">
                      {position.requirements.map((req, i) => (
                        <li key={i} className="text-sm text-gray-600 flex gap-2">
                          <span className="text-blue-600">•</span> {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {/* Application Process */}
            <section className="bg-blue-50 border border-blue-200 rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-6">Application Process</h2>
              <div className="space-y-4">
                {[
                  {
                    step: "1",
                    title: "Submit Application",
                    desc: "Fill out our application form with your experience and qualifications",
                  },
                  {
                    step: "2",
                    title: "Initial Review",
                    desc: "Our team reviews your application and qualifications",
                  },
                  {
                    step: "3",
                    title: "Interview",
                    desc: "Participate in a video or in-person interview",
                  },
                  {
                    step: "4",
                    title: "Background Check",
                    desc: "Standard background verification process",
                  },
                  {
                    step: "5",
                    title: "Training",
                    desc: "Complete orientation and training program",
                  },
                  {
                    step: "6",
                    title: "Start Teaching",
                    desc: "Begin working with our students",
                  },
                ].map((item, index) => (
                  <div key={index} className="flex gap-4 items-start">
                    <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{item.title}</h3>
                      <p className="text-gray-600 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="bg-white border border-gray-200 rounded-lg p-6 h-fit">
            <h3 className="text-xl font-bold mb-4">Ready to Apply?</h3>
            <p className="text-gray-700 text-sm mb-6">
              Join our team of passionate educators and make a difference in students&apos; lives.
            </p>
            <button className="w-full bg-blue-600 text-white px-4 py-3 rounded font-semibold hover:bg-blue-700 mb-3">
              Apply Now
            </button>

            <hr className="my-6" />

            <h3 className="text-lg font-bold mb-4">Have Questions?</h3>
            <p className="text-gray-700 text-sm mb-3">
              Contact our recruitment team for more information.
            </p>
            <p className="text-sm">
              <strong>Email:</strong> careers@educationchina.com
            </p>
            <p className="text-sm text-gray-600">
              <strong>Phone:</strong> +86 10 1234 5678
            </p>
          </aside>
        </div>
      </div>
    </PublicLayout>
  );
}
