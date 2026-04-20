"use client";

interface FilterOption {
  label: string;
  value: string;
}

interface Filter {
  key: string;
  label: string;
  options: FilterOption[];
}

interface FilterBarProps {
  filters: Filter[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

export default function FilterBar({ filters, values, onChange }: FilterBarProps) {
  return (
    <div className="mb-4 flex flex-wrap gap-3">
      {filters.map((filter) => (
        <div key={filter.key} className="flex items-center gap-2">
          <label className="text-sm text-gray-600">{filter.label}:</label>
          <select
            value={values[filter.key] ?? ""}
            onChange={(e) => onChange(filter.key, e.target.value)}
            className="rounded border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="">All</option>
            {filter.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}
