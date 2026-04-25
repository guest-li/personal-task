import { prisma } from "@/server/db";

export default async function AdminDashboard() {
  // Fetch stats
  const totalUsers = await prisma.user.count();
  const totalApplications = await prisma.application.count();
  const totalEvents = await prisma.event.count();
  const pendingApplications = await prisma.application.count({
    where: { status: "pending" },
  });
  const pendingPartners = await prisma.user.count({
    where: { role: "partner", status: "inactive" },
  });

  const stats = [
    { label: "Total Users", value: totalUsers },
    { label: "Total Applications", value: totalApplications },
    { label: "Pending Applications", value: pendingApplications },
    { label: "Total Events", value: totalEvents },
    { label: "Pending Partners", value: pendingPartners },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4">
          <a href="/admin/users/new" className="block p-4 border border-gray-200 rounded hover:bg-blue-50">
            <p className="font-semibold text-blue-600">+ Create User</p>
          </a>
          <a href="/admin/events/new" className="block p-4 border border-gray-200 rounded hover:bg-blue-50">
            <p className="font-semibold text-blue-600">+ Create Event</p>
          </a>
          <a href="/admin/applications" className="block p-4 border border-gray-200 rounded hover:bg-blue-50">
            <p className="font-semibold text-blue-600">Review Applications</p>
          </a>
          <a href="/admin/partners" className="block p-4 border border-gray-200 rounded hover:bg-blue-50">
            <p className="font-semibold text-blue-600">Review Partners</p>
          </a>
        </div>
      </div>
    </div>
  );
}
