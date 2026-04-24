import { PublicLayout } from "@/src/components/public/PublicLayout";
import Link from "next/link";

const serviceDetails: Record<string, any> = {
  "1": {
    title: "University Selection",
    icon: "🎓",
    description: "Personalized university recommendations tailored to your needs",
    content: `Our expert consultants will help you find universities that match your academic profile, career goals, and personal preferences. We consider factors such as:

    - Your academic achievements
    - Preferred location and province
    - Program offerings and specializations
    - Campus facilities and student life
    - Scholarship opportunities
    - Cost of living and tuition fees

    With partnerships across 50+ top universities in China, we ensure you get the best options available.`,
    process: [
      "Profile Assessment",
      "University Matching",
      "Shortlisting",
      "Campus Tours (Virtual)",
      "Final Recommendation",
    ],
  },
  "2": {
    title: "Application Assistance",
    icon: "📝",
    description: "Expert guidance through the entire application process",
    content: `We provide comprehensive support throughout your application journey:

    - Document preparation and review
    - Application form completion
    - Essay and personal statement writing
    - Transcript verification
    - Reference letter coordination
    - Submission and tracking

    Our success rate speaks for itself - 95% of our applicants get accepted to their first or second choice universities.`,
    process: [
      "Document Preparation",
      "Form Completion",
      "Essay Review",
      "Submission",
      "Status Tracking",
      "Acceptance Processing",
    ],
  },
  "3": {
    title: "Scholarship Guidance",
    icon: "💰",
    description: "Help finding and applying for scholarships",
    content: `Reduce your education costs with our comprehensive scholarship guidance:

    - Identify scholarships matching your profile
    - Application strategy and planning
    - Essay and proposal writing
    - Interview preparation
    - Documentation and submission
    - Award notification and processing

    On average, our students receive scholarships covering 30-80% of their tuition fees.`,
    process: [
      "Eligibility Assessment",
      "Scholarship Search",
      "Application Strategy",
      "Document Preparation",
      "Interview Prep",
      "Award Processing",
    ],
  },
  "4": {
    title: "Visa Consultation",
    icon: "📜",
    description: "Complete support for student visa application",
    content: `Navigate the visa process smoothly with our expert guidance:

    - Visa requirement assessment
    - Document preparation and organization
    - Financial proof compilation
    - Application form completion
    - Interview preparation
    - Status tracking and follow-up

    We have a 98% visa approval rate and guide students through every step of the process.`,
    process: [
      "Requirement Review",
      "Document Checklist",
      "Financial Proof",
      "Form Completion",
      "Interview Prep",
      "Application Submission",
    ],
  },
  "5": {
    title: "Language Preparation",
    icon: "🗣️",
    description: "Prepare for language proficiency tests",
    content: `Get ready for TOEFL, IELTS, or HSK exams:

    - Assessment of current language level
    - Customized study plans
    - Resource recommendations
    - Practice test guidance
    - Interview preparation (for speaking tests)
    - Score improvement strategies

    Most universities require English or Chinese language proficiency. We help you achieve the scores you need.`,
    process: [
      "Level Assessment",
      "Study Plan",
      "Resource Guide",
      "Practice Tests",
      "Progress Tracking",
      "Test Registration",
    ],
  },
  "6": {
    title: "Post-Arrival Support",
    icon: "🏠",
    description: "Assistance after you arrive in China",
    content: `Your journey doesn't end with acceptance. We provide comprehensive support:

    - Airport pickup coordination
    - Accommodation assistance
    - University registration support
    - City orientation and introduction
    - Banking and SIM card setup
    - Cultural adaptation guidance
    - Ongoing academic support

    We ensure smooth transition to your new life in China.`,
    process: [
      "Pre-arrival Briefing",
      "Airport Pickup",
      "Accommodation Setup",
      "University Registration",
      "City Tour",
      "Ongoing Support",
    ],
  },
};

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const service = serviceDetails[params.slug];
  return {
    title: service?.title || "Service",
    description: service?.description || "Service details",
  };
}

export default function ServiceDetailPage({ params }: { params: { slug: string } }) {
  const service = serviceDetails[params.slug];

  if (!service) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Service not found</h1>
            <Link href="/services" className="text-blue-600 hover:underline mt-4 inline-block">
              Back to Services
            </Link>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8">
        <Link href="/services" className="text-blue-600 hover:underline mb-4 inline-block">
          ← Back to Services
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-start gap-4 mb-6">
              <div className="text-6xl">{service.icon}</div>
              <div>
                <h1 className="text-4xl font-bold">{service.title}</h1>
                <p className="text-lg text-gray-600 mt-2">{service.description}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4">Service Overview</h2>
              <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                {service.content}
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Our Process</h2>
              <div className="flex flex-wrap gap-2">
                {service.process.map((step: string, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <span className="font-semibold">{step}</span>
                    {index < service.process.length - 1 && (
                      <span className="text-gray-400 ml-2">→</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="bg-gray-50 rounded-lg p-6 h-fit">
            <h3 className="text-xl font-bold mb-4">Next Steps</h3>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Schedule a consultation to discuss how we can help you with this service.
              </p>
              <Link
                href="/get-free-consultation"
                className="block w-full bg-blue-600 text-white px-4 py-3 rounded text-center hover:bg-blue-700 font-semibold"
              >
                Book Consultation
              </Link>
              <Link
                href="/contact"
                className="block w-full border-2 border-blue-600 text-blue-600 px-4 py-3 rounded text-center hover:bg-blue-50 font-semibold"
              >
                Contact Us
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </PublicLayout>
  );
}
