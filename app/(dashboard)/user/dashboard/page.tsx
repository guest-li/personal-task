"use client";

import { useEffect, useState } from "react";
import StatCard from "@/components/dashboard/StatCard";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  ResponsiveContainer,
} from "recharts";

interface DashboardData {
  stats: {
    totalApplications: number;
    applicationFeesPaid: number;
    serviceCharge: number;
    serviceChargePaid: number;
    partnerLevel?: string;
  };
  charts: {
    applicationHistory: { month: string; applications: number; approved: number }[];
    summary: { applications: number; serviceCharge: number; applicationFees: number };
  };
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/users/dashboard-stats")
      .then((res) => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-gray-500">Loading dashboard...</div>;
  }

  if (!data) {
    return <div className="text-red-500">Failed to load dashboard data</div>;
  }

  const summaryData = [
    { name: "Applications", value: data.charts.summary.applications },
    { name: "Service Charge", value: data.charts.summary.serviceCharge },
    { name: "Application Fees", value: data.charts.summary.applicationFees },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon="📄" label="Applications" value={data.stats.totalApplications} />
        <StatCard
          icon="💰"
          label="Application Fees Paid"
          value={`$${data.stats.applicationFeesPaid.toFixed(2)}`}
        />
        <StatCard
          icon="📋"
          label="Total Service Charge"
          value={`$${data.stats.serviceCharge.toFixed(2)}`}
        />
        <StatCard
          icon="📁"
          label="Service Charge Paid"
          value={`$${data.stats.serviceChargePaid.toFixed(2)}`}
        />
        {data.stats.partnerLevel && (
          <StatCard
            icon="🏅"
            label="Your Level"
            value={data.stats.partnerLevel.charAt(0).toUpperCase() + data.stats.partnerLevel.slice(1)}
          />
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Applications History
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.charts.applicationHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="applications" stroke="#f472b6" name="Applications" />
              <Line type="monotone" dataKey="approved" stroke="#3b82f6" name="Approved" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Summary</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={summaryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
