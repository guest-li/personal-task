"use client";

import { useState } from "react";

interface FilterBarProps {
  filters: {
    name: string;
    type: "text" | "select" | "range";
    options?: { label: string; value: string }[];
    placeholder?: string;
  }[];
  onFilter: (filters: Record<string, any>) => void;
}

export function FilterBar({ filters, onFilter }: FilterBarProps) {
  const [values, setValues] = useState<Record<string, any>>({});

  const handleChange = (name: string, value: any) => {
    const updated = { ...values, [name]: value };
    setValues(updated);
    onFilter(updated);
  };

  const handleClear = () => {
    setValues({});
    onFilter({});
  };

  const activeFilterCount = Object.values(values).filter((v) => v).length;

  return (
    <div className="bg-white border border-brand-100 rounded-lg p-4 shadow-card">
      <div className="flex flex-wrap gap-4 items-end">
        {filters.map((filter) => (
          <div key={filter.name}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{filter.name}</label>
            {filter.type === "text" && (
              <input
                type="text"
                placeholder={filter.placeholder}
                value={values[filter.name] || ""}
                onChange={(e) => handleChange(filter.name, e.target.value)}
                className="border border-brand-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand transition-all duration-200"
              />
            )}
            {filter.type === "select" && (
              <select
                value={values[filter.name] || ""}
                onChange={(e) => handleChange(filter.name, e.target.value)}
                className="border border-brand-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand transition-all duration-200 appearance-none bg-white cursor-pointer"
              >
                <option value="">All</option>
                {filter.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}
            {filter.type === "range" && (
              <input
                type="range"
                min="0"
                max="50000"
                step="50"
                value={values[filter.name] || 0}
                onChange={(e) => handleChange(filter.name, e.target.value)}
                className="w-32 accent-brand-600"
              />
            )}
          </div>
        ))}
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-brand-100 text-brand-700 text-xs font-bold">
              {activeFilterCount}
            </span>
            <button
              onClick={handleClear}
              className="text-brand-600 hover:text-brand-800 font-medium text-sm transition-colors"
            >
              Clear All
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
