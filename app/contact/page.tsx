"use client";

import { PublicLayout } from "@/components/public/PublicLayout";
import { useState } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/v1/public/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitted(true);
        setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Get in Touch</h1>
          <p className="text-xl text-brand-100 max-w-2xl">
            Have questions? We're here to help. Reach out to our team and we'll respond within 24 hours.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Contact Information */}
          <div>
            <h2 className="text-2xl font-bold text-brand-800 mb-8">Contact Info</h2>

            <div className="space-y-6">
              <div className="bg-brand-50 rounded-lg p-6 border border-brand-100">
                <p className="text-3xl mb-3">📍</p>
                <h3 className="font-bold text-gray-900 mb-2">Address</h3>
                <p className="text-gray-600">123 Education Street, Beijing, China 100000</p>
              </div>

              <div className="bg-brand-50 rounded-lg p-6 border border-brand-100">
                <p className="text-3xl mb-3">📞</p>
                <h3 className="font-bold text-gray-900 mb-2">Phone</h3>
                <p className="text-gray-600">+86 10 1234 5678</p>
              </div>

              <div className="bg-brand-50 rounded-lg p-6 border border-brand-100">
                <p className="text-3xl mb-3">📧</p>
                <h3 className="font-bold text-gray-900 mb-2">Email</h3>
                <p className="text-gray-600">info@malishaedu.com</p>
              </div>

              <div className="bg-brand-50 rounded-lg p-6 border border-brand-100">
                <p className="text-3xl mb-3">🕐</p>
                <h3 className="font-bold text-gray-900 mb-2">Business Hours</h3>
                <p className="text-gray-600 text-sm">
                  Mon - Fri: 9:00 AM - 6:00 PM<br />
                  Sat - Sun: 10:00 AM - 4:00 PM<br />
                  <span className="text-xs text-gray-500 mt-2">UTC+8</span>
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white border border-brand-100 rounded-lg shadow-card p-8">
              {submitted && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                  ✓ Thank you! We'll get back to you within 24 hours.
                </div>
              )}

              <div className="mb-6">
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
                  <label className="block text-gray-900 font-semibold mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-brand-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand transition-all duration-200"
                    placeholder="+86 1234567890"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-gray-900 font-semibold mb-2">Subject *</label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-brand-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand transition-all duration-200"
                >
                  <option value="">Select a subject</option>
                  <option value="general">General Inquiry</option>
                  <option value="application">Application Help</option>
                  <option value="scholarship">Scholarship Guidance</option>
                  <option value="visa">Visa Support</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-gray-900 font-semibold mb-2">Message *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-2 border border-brand-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand transition-all duration-200"
                  placeholder="Your message..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-brand-700 to-brand-800 hover:from-brand-800 hover:to-brand-900 text-white font-bold px-6 py-3 rounded-lg transition-all duration-200 disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>

        {/* Offices Section */}
        <section>
          <h2 className="text-3xl font-bold text-brand-800 mb-8">Our Offices</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { city: "Beijing", address: "123 Education Street, Chaoyang District", flag: "🇨🇳" },
              { city: "Shanghai", address: "456 Academic Ave, Pudong District", flag: "🇨🇳" },
              { city: "Xi'an", address: "789 Learning Lane, Yan'ta District", flag: "🇨🇳" },
            ].map((office, index) => (
              <div key={index} className="bg-brand-50 border border-brand-100 rounded-lg shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200 p-6">
                <p className="text-4xl mb-3">{office.flag}</p>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{office.city}</h3>
                <p className="text-gray-600 mb-4 text-sm">{office.address}</p>
                <a href="#" className="text-brand-600 hover:text-brand-800 font-semibold text-sm transition-colors">
                  Get Directions →
                </a>
              </div>
            ))}
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
