interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  className?: string;
}

export default function StatCard({ icon, label, value, className }: StatCardProps) {
  return (
    <div className={`rounded-lg bg-white p-6 shadow ${className ?? ""}`}>
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-2xl">
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}
