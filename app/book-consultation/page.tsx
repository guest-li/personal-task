"use client";

import { PublicLayout } from "@/components/public/PublicLayout";
import { useState } from "react";
import Link from "next/link";

export default function BookConsultationPage() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    scheduledAt: "",
    duration: 60,
    price: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "duration" || name === "price" ? parseFloat(value) : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.scheduledAt) newErrors.scheduledAt = "Date and time are required";
    if (formData.duration < 15) newErrors.duration = "Minimum duration is 15 minutes";
    if (formData.price < 0) newErrors.price = "Price must be positive";
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/v1/public/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitted(true);
        setFormData({
          title: "",
          description: "",
          scheduledAt: "",
          duration: 60,
          price: 0,
        });
        setTimeout(() => setSubmitted(false), 5000);
      } else {
        setErrors({ submit: "Failed to book consultation. Please try again." });
      }
    } catch (error) {
      setErrors({ submit: "An error occurred. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PublicLayout>
      <section className="bg-gradient-to-r from-brand-700 to-brand-800 text-white py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Book a Consultation</h1>
          <p className="text-xl text-brand-100 max-w-2xl mx-auto">
            Schedule a one-on-one consultation with our education experts to discuss your goals.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-8">
            {submitted ? (
              <div className="text-center">
                <div className="text-green-600 text-5xl mb-4">✓</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Consultation Booked!</h2>
                <p className="text-gray-600 mb-6">We&apos;ll contact you shortly to confirm the details.</p>
                <Link href="/" className="inline-block bg-brand-700 text-white px-6 py-2 rounded-lg font-semibold hover:bg-brand-800 transition">
                  Back to Home
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Consultation Topic *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., University Selection in Beijing"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600"
                  />
                  {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Tell us more about what you&apos;d like to discuss..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Preferred Date & Time *</label>
                    <input
                      type="datetime-local"
                      name="scheduledAt"
                      value={formData.scheduledAt}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600"
                    />
                    {errors.scheduledAt && <p className="text-red-600 text-sm mt-1">{errors.scheduledAt}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Duration (minutes) *</label>
                    <select
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600"
                    >
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={60}>60 minutes</option>
                      <option value={90}>90 minutes</option>
                      <option value={120}>120 minutes</option>
                    </select>
                    {errors.duration && <p className="text-red-600 text-sm mt-1">{errors.duration}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Consultation Fee *</label>
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-brand-700 mr-4">$</span>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600"
                    />
                  </div>
                  {errors.price && <p className="text-red-600 text-sm mt-1">{errors.price}</p>}
                </div>

                {errors.submit && (
                  <div className="bg-red-100 text-red-700 p-4 rounded-lg">
                    {errors.submit}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-brand-700 text-white font-semibold py-3 rounded-lg hover:bg-brand-800 transition disabled:opacity-50"
                >
                  {isSubmitting ? "Booking..." : "Book Consultation"}
                </button>

                <p className="text-sm text-gray-600 text-center">
                  You will be able to pay and confirm details after booking. We offer 100% satisfaction guarantee.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
