import { PublicLayout } from "@/src/components/public/PublicLayout";

export const metadata = {
  title: "Our Team",
  description: "Meet the expert consultants behind your success.",
};

export default function TeamPage() {
  const teamMembers = [
    {
      id: "1",
      name: "Dr. Zhang Wei",
      title: "Founder & CEO",
      specialty: "University Relations",
      bio: "20+ years of experience in international education",
      image: "👨‍💼",
    },
    {
      id: "2",
      name: "Sarah Johnson",
      title: "Senior Education Counselor",
      specialty: "Scholarship Guidance",
      bio: "Former university admissions officer with 15 years experience",
      image: "👩‍💼",
    },
    {
      id: "3",
      name: "Liu Ming",
      title: "Visa & Documentation Specialist",
      specialty: "Visa Processing",
      bio: "Expert in immigration law and visa procedures",
      image: "👨‍💼",
    },
    {
      id: "4",
      name: "Emma Chen",
      title: "Language Preparation Coach",
      specialty: "TOEFL & IELTS Coaching",
      bio: "Certified language instructor with 12 years experience",
      image: "👩‍🏫",
    },
    {
      id: "5",
      name: "Ahmed Ali",
      title: "Student Support Advisor",
      specialty: "Post-Arrival Support",
      bio: "Dedicated to helping students settle and thrive",
      image: "👨‍💼",
    },
    {
      id: "6",
      name: "Lisa Wang",
      title: "Application Specialist",
      specialty: "Application Processing",
      bio: "Skilled in document preparation and application strategy",
      image: "👩‍💼",
    },
  ];

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-2">Meet Our Team</h1>
        <p className="text-lg text-gray-600 mb-12">
          Experienced professionals dedicated to your educational success
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {teamMembers.map((member) => (
            <div key={member.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition">
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 h-24 flex items-center justify-center">
                <span className="text-6xl">{member.image}</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                <p className="text-sm font-semibold text-blue-600 mb-2">{member.title}</p>
                <p className="text-sm text-gray-600 mb-3">
                  <strong>Specialty:</strong> {member.specialty}
                </p>
                <p className="text-gray-700">{member.bio}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 mb-12">
          <h2 className="text-2xl font-bold mb-4">Why Work With Our Team?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              "Average 15+ years of experience per consultant",
              "Deep relationships with 50+ top universities",
              "Multilingual support in 8+ languages",
              "24/7 customer support availability",
              "Personalized attention for each student",
              "Proven track record of 95%+ success rate",
            ].map((reason, index) => (
              <div key={index} className="flex items-start gap-3">
                <span className="text-green-600 font-bold text-xl">✓</span>
                <span className="text-gray-700 font-semibold">{reason}</span>
              </div>
            ))}
          </div>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { icon: "🤝", title: "Personalized Approach", desc: "Each student gets a dedicated advisor" },
            { icon: "🏆", title: "Proven Success", desc: "10,000+ students successfully placed" },
            { icon: "🌍", title: "Global Network", desc: "Partnerships across China and worldwide" },
          ].map((item, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 text-center">
              <div className="text-4xl mb-3">{item.icon}</div>
              <h3 className="text-lg font-bold mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.desc}</p>
            </div>
          ))}
        </section>

        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Connect With Our Experts</h2>
          <p className="text-blue-100 mb-6">
            Schedule a free consultation with one of our advisors today
          </p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded font-semibold hover:bg-gray-100">
            Book Free Consultation
          </button>
        </div>
      </div>
    </PublicLayout>
  );
}
