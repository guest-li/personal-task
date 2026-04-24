"use client";

import { PublicLayout } from "@/src/components/public/PublicLayout";
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
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-2">Get Your Free Consultation</h1>
        <p className="text-lg text-gray-600 mb-12">
          Schedule a personalized consultation with our education experts
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-8">
              {submitted && (
                <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                  Thank you! Our consultants will contact you within 24 hours.
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Age</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Your age"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+86 1234567890"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Qualification</label>
                  <select
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select qualification</option>
                    <option value="high_school">High School</option>
                    <option value="bachelor">Bachelor's Degree</option>
                    <option value="master">Master's Degree</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Interested Program</label>
                  <select
                    name="interestedProgram"
                    value={formData.interestedProgram}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <label className="block text-gray-700 font-semibold mb-2">Additional Information</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tell us about your goals and interests..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {loading ? "Submitting..." : "Schedule Free Consultation"}
              </button>

              <p className="text-sm text-gray-600 mt-4">
                * Required fields. We respect your privacy and will never share your information.
              </p>
            </form>
          </div>

          {/* Sidebar */}
          <aside className="bg-blue-50 border border-blue-200 rounded-lg p-6 h-fit">
            <h3 className="text-xl font-bold mb-4">Why Book a Consultation?</h3>
            <ul className="space-y-3">
              {[
                "Personalized guidance based on your profile",
                "Expert advice on university selection",
                "Scholarship opportunities discovery",
                "Application strategy planning",
                "Visa and documentation guidance",
                "Answer all your questions",
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-1">✓</span>
                  <span className="text-gray-700 text-sm">{item}</span>
                </li>
              ))}
            </ul>

            <hr className="my-6" />

            <div className="bg-white rounded p-4">
              <p className="text-sm font-semibold text-gray-900 mb-2">Expected Response Time</p>
              <p className="text-sm text-gray-600">Within 24 hours</p>
            </div>
          </aside>
        </div>
      </div>
    </PublicLayout>
  );
}
