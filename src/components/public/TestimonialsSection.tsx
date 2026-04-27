"use client";

import { useState } from "react";

export function TestimonialsSection() {
  const testimonials = [
    {
      quote:
        "MalishaEdu made the whole process so easy. I got into my dream university!",
      author: "Sarah Chen",
      school: "Tsinghua University",
      rating: 5,
    },
    {
      quote:
        "The consultants are amazing. They answered all my questions and guided me perfectly.",
      author: "Ahmad Hassan",
      school: "Beijing Normal University",
      rating: 5,
    },
    {
      quote:
        "I saved so much time and got a full scholarship. Highly recommend!",
      author: "Emma Rodriguez",
      school: "Fudan University",
      rating: 5,
    },
  ];

  const [current, setCurrent] = useState(0);

  const goToPrev = () => {
    setCurrent((current - 1 + testimonials.length) % testimonials.length);
  };

  const goToNext = () => {
    setCurrent((current + 1) % testimonials.length);
  };

  const testimonial = testimonials[current];

  return (
    <div className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 max-w-3xl">
        <h2 className="text-4xl font-bold text-center mb-12">
          What Students Say
        </h2>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="text-yellow-400 text-2xl mb-4">
            {"★".repeat(testimonial.rating)}
          </div>
          <p className="text-xl text-gray-700 mb-6 italic">
            &ldquo;{testimonial.quote}&rdquo;
          </p>
          <p className="font-bold text-lg">{testimonial.author}</p>
          <p className="text-brand-600">{testimonial.school}</p>
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={goToPrev}
            className="bg-brand-700 text-white px-6 py-2 rounded-lg hover:bg-brand-800 transition"
          >
            ← Previous
          </button>
          <span className="text-gray-600 py-2">
            {current + 1} of {testimonials.length}
          </span>
          <button
            onClick={goToNext}
            className="bg-brand-700 text-white px-6 py-2 rounded-lg hover:bg-brand-800 transition"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
