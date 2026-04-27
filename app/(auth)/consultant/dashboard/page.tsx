"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ConsultantDashboard() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBookings: 0,
    confirmedBookings: 0,
    completedBookings: 0,
    totalEarnings: 0,
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await fetch("/api/v1/public/consultations?limit=50");
      const data = await response.json();
      
      if (data.consultations) {
        setBookings(data.consultations);
        
        const confirmed = data.consultations.filter((b: any) => b.status === "confirmed").length;
        const completed = data.consultations.filter((b: any) => b.status === "completed").length;
        const earnings = data.consultations.reduce((sum: number, b: any) => sum + (b.paid ? Number(b.price) : 0), 0);

        setStats({
          totalBookings: data.consultations.length,
          confirmedBookings: confirmed,
          completedBookings: completed,
          totalEarnings: earnings,
        });
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return badges[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-4xl font-bold mb-8">Consultant Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 mb-2">Total Bookings</p>
            <p className="text-3xl font-bold text-brand-700">{stats.totalBookings}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 mb-2">Confirmed</p>
            <p className="text-3xl font-bold text-blue-600">{stats.confirmedBookings}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 mb-2">Completed</p>
            <p className="text-3xl font-bold text-green-600">{stats.completedBookings}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 mb-2">Total Earnings</p>
            <p className="text-3xl font-bold text-green-700">${stats.totalEarnings.toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold">Upcoming & Active Consultations</h2>
          </div>

          {loading ? (
            <div className="p-6 text-center text-gray-600">Loading consultations...</div>
          ) : bookings.length === 0 ? (
            <div className="p-6 text-center text-gray-600">No consultations yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Student</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Topic</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date & Time</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Duration</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm">{booking.student?.name || "N/A"}</td>
                      <td className="px-6 py-4 text-sm font-medium">{booking.title}</td>
                      <td className="px-6 py-4 text-sm">
                        {booking.scheduledAt ? new Date(booking.scheduledAt).toLocaleString() : "TBD"}
                      </td>
                      <td className="px-6 py-4 text-sm">{booking.duration} min</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold">${Number(booking.price).toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm">
                        {booking.status === "confirmed" && (
                          <Link href={`/consultation/${booking.id}/meeting`} className="text-brand-600 hover:text-brand-800 font-semibold">
                            Start Meeting
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
