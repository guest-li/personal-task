export function FeatureHighlights() {
  const features = [
    {
      icon: "🏛️",
      title: "71+ Universities",
      description: "Top-ranked institutions across China",
    },
    {
      icon: "📚",
      title: "500+ Programs",
      description: "Diverse degrees and specializations",
    },
    {
      icon: "🎓",
      title: "700+ Scholarships",
      description: "Funding opportunities worth millions",
    },
    {
      icon: "💼",
      title: "Expert Consultants",
      description: "Personalized guidance from professionals",
    },
    {
      icon: "📖",
      title: "Complete Resources",
      description: "Guides, templates, and expert articles",
    },
    {
      icon: "🌍",
      title: "Global Community",
      description: "Connect with students from worldwide",
    },
  ];

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">
          Why Choose MalishaEdu?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
