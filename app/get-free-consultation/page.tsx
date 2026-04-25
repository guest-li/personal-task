"use client";

import { PublicLayout } from "@/components/public/PublicLayout";
import { useState } from "react";

export default function ConsultationPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    qualification: "",
    interestedCountry: "China",
    interestedProgram: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/v1/public/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitted(true);
        setFormData({
          name: "",
          email: "",
          phone: "",
          age: "",
          qualification: "",
          interestedCountry: "China",
          interestedProgram: "",
          message: "",
        });
        setTimeout(() => setSubmitted(false), 5000);
      }
    } catch (error) {
      console.error("Failed to submit:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-brand-700 to-brand-800 text-white py-16 md:py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Start Your Journey Today</h1>
          <p className="text-xl text-brand-100 max-w-2xl">
            Get personalized guidance from our education experts. Schedule a free consultation to discuss your goals and find the perfect opportunity.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Benefits Column */}
          <div>
            <h2 className="text-3xl font-bold text-brand-800 mb-8">What You'll Get</h2>

            <div className="space-y-4 mb-8">
              {[
                { title: "Personalized Assessment", desc: "In-depth evaluation of your profile and aspirations" },
                { title: "University Recommendations", desc: "Curated list of universities matching your goals" },
                { title: "Scholarship Guidance", desc: "Discover funding opportunities tailored to you" },
                { title: "Application Strategy", desc: "Step-by-step plan to maximize your success" },
                { title: "Visa & Documentation", desc: "Expert advice on requirements and timelines" },
                { title: "Career Pathways", desc: "Insights on how your studies lead to opportunities" },
              ].map((benefit, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-accent-500 text-white font-bold">
                      ✓
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{benefit.title}</h3>
                    <p className="text-sm text-gray-600">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Trust Signals */}
            <div className="bg-brand-50 border border-brand-100 rounded-lg p-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-2xl font-bold text-brand-800">500+</p>
                  <p className="text-sm text-gray-600">Students Helped This Year</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-brand-800">98%</p>
                  <p className="text-sm text-gray-600">Satisfaction Rate</p>
                </div>
              </div>
              <p className="text-sm text-gray-700">
                Join thousands of students who have successfully navigated their path to studying in China with our expert guidance.
              </p>
            </div>

            {/* Urgency Messaging */}
            <div className="mt-6 bg-accent-50 border border-accent-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-accent-900">⏰ Limited slots available this week</p>
              <p className="text-xs text-accent-700 mt-1">Book now to secure your consultation appointment</p>
            </div>
          </div>

          {/* Form Column */}
          <div>
            <form onSubmit={handleSubmit} className="bg-white border border-brand-100 rounded-lg shadow-card p-8">
              {submitted && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                  ✓ Thank you! Our consultants will contact you within 24 hours.
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-gray-900 font-semibold mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-brand-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand transition-all duration-200"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-gray-900 font-semibold mb-2">Age</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-brand-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand transition-all duration-200"
                    placeholder="Your age"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-gray-900 font-semibold mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-brand-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand transition-all duration-200"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-gray-900 font-semibold mb-2">Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-brand-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand transition-all duration-200"
                    placeholder="+86 1234567890"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-gray-900 font-semibold mb-2">Qualification</label>
                  <select
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-brand-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand transition-all duration-200"
                  >
                    <option value="">Select qualification</option>
                    <option value="high_school">High School</option>
                    <option value="bachelor">Bachelor's Degree</option>
                    <option value="master">Master's Degree</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-900 font-semibold mb-2">Interested Program</label>
                  <select
                    name="interestedProgram"
                    value={formData.interestedProgram}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-brand-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand transition-all duration-200"
                  >
                    <option value="">Select program type</option>
                    <option value="undergraduate">Undergraduate</option>
                    <option value="postgraduate">Postgraduate</option>
                    <option value="phd">PhD</option>
                    <option value="short_course">Short Course</option>
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-gray-900 font-semibold mb-2">Additional Information</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-brand-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand transition-all duration-200"
                  placeholder="Tell us about your goals and interests..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-brand-700 to-brand-800 hover:from-brand-800 hover:to-brand-900 text-white font-bold px-6 py-3 rounded-lg transition-all duration-200 disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Schedule Free Consultation"}
              </button>

              <p className="text-xs text-gray-600 mt-4">
                * Required fields. We respect your privacy and will never share your information.
              </p>
            </form>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
