export function StatsSection() {
  const stats = [
    { number: "71+", label: "Universities" },
    { number: "500+", label: "Programs" },
    { number: "713+", label: "Scholarships" },
    { number: "10K+", label: "Students Helped" },
  ];

  return (
    <div className="bg-brand-50 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-brand-700 mb-2">
                {stat.number}
              </div>
              <p className="text-gray-600 font-semibold">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
