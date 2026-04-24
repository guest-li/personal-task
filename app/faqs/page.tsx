"use client";

import { PublicLayout } from "@/components/public/PublicLayout";
import { useState } from "react";

export default function FAQsPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const faqs = [
    {
      id: "1",
      category: "Applications",
      question: "What are the basic requirements for studying in China?",
      answer:
        "Basic requirements typically include: High school diploma or equivalent, English language proficiency (IELTS/TOEFL), health certificate, passport, and sometimes entrance exam scores. Requirements vary by university and program.",
    },
    {
      id: "2",
      category: "Applications",
      question: "What is the application timeline?",
      answer:
        "Most universities accept applications year-round, but deadlines vary. Spring intake (January-March) usually has deadlines in October-November, while Fall intake (September-October) has deadlines in March-May. We recommend applying 4-6 months before your intended start date.",
    },
    {
      id: "3",
      category: "Scholarships",
      question: "What types of scholarships are available?",
      answer:
        "Available scholarships include full scholarships (tuition + living stipend), partial scholarships, tuition-only scholarships, and living stipends. Different universities and programs offer different combinations. We help you find scholarships matching your profile.",
    },
    {
      id: "4",
      category: "Scholarships",
      question: "How competitive are Chinese scholarships?",
      answer:
        "Competition varies by university and scholarship type. Government scholarships are highly competitive, while university-specific scholarships may be more accessible. Average acceptance rate for competitive scholarships is 10-30%, which is why personalized application strategy is crucial.",
    },
    {
      id: "5",
      category: "Visas",
      question: "How long does the visa process take?",
      answer:
        "The visa process typically takes 2-4 weeks after you receive your admission letter and other required documents. Processing time can vary by country and embassy. We handle all documentation to expedite the process.",
    },
    {
      id: "6",
      category: "Visas",
      question: "Do I need an invitation letter for my visa?",
      answer:
        "Yes, the university will issue an admission/invitation letter (JW202 form) after you're admitted. This document is crucial for visa application. The university provides this, and we help ensure all documentation is properly prepared.",
    },
    {
      id: "7",
      category: "Costs",
      question: "What is the average cost of living in China?",
      answer:
        "Average monthly costs for students range from 1,500-3,500 RMB depending on the city and lifestyle. This typically covers accommodation (600-1,500 RMB), food (300-600 RMB), transportation, and entertainment. Major cities like Beijing and Shanghai are more expensive than second-tier cities.",
    },
    {
      id: "8",
      category: "Costs",
      question: "What are typical tuition fees?",
      answer:
        "Tuition ranges from 8,000-30,000 RMB per year depending on degree level and university tier. Bachelor programs are typically 8,000-15,000 RMB/year, while Master's programs range from 10,000-25,000 RMB/year. Top universities charge more.",
    },
    {
      id: "9",
      category: "Housing",
      question: "Is on-campus housing available for international students?",
      answer:
        "Yes, most universities provide on-campus housing for international students. It's usually mandatory for the first year, though some students choose off-campus accommodation after. On-campus housing costs 600-1,500 RMB per month.",
    },
    {
      id: "10",
      category: "Support",
      question: "What support do you provide after arrival?",
      answer:
        "We provide comprehensive post-arrival support including: airport pickup, accommodation assistance, university registration, city orientation, banking and phone setup, cultural adaptation guidance, and ongoing academic support throughout your studies.",
    },
  ];

  const categories = ["All", "Applications", "Scholarships", "Visas", "Costs", "Housing", "Support"];

  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredFaqs = selectedCategory === "All" ? faqs : faqs.filter((faq) => faq.category === selectedCategory);

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-2">Frequently Asked Questions</h1>
        <p className="text-lg text-gray-600 mb-8">Find answers to common questions about studying in China</p>

        {/* Category Filter */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded font-semibold transition ${
                selectedCategory === category
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* FAQ List */}
        <div className="space-y-4 max-w-3xl mb-12">
          {filteredFaqs.map((faq) => (
            <div key={faq.id} className="bg-white border border-gray-200 rounded-lg">
              <button
                onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition"
              >
                <div className="flex-1">
                  <span className="text-xs font-semibold text-blue-600 uppercase mb-1 block">{faq.category}</span>
                  <h3 className="font-bold text-gray-900 text-lg">{faq.question}</h3>
                </div>
                <span
                  className={`text-2xl text-gray-400 transition transform ${
                    expandedId === faq.id ? "rotate-180" : ""
                  }`}
                >
                  ▼
                </span>
              </button>

              {expandedId === faq.id && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Didn't find what you're looking for?</h2>
          <p className="text-gray-600 mb-6">
            Contact our team or schedule a consultation for personalized answers
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button className="bg-blue-600 text-white px-6 py-3 rounded font-semibold hover:bg-blue-700">
              Schedule Consultation
            </button>
            <button className="border-2 border-blue-600 text-blue-600 px-6 py-3 rounded font-semibold hover:bg-blue-50">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
