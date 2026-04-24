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

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
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
                className="border border-gray-300 rounded px-3 py-2"
              />
            )}
            {filter.type === "select" && (
              <select
                value={values[filter.name] || ""}
                onChange={(e) => handleChange(filter.name, e.target.value)}
                className="border border-gray-300 rounded px-3 py-2"
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
                className="w-32"
              />
            )}
          </div>
        ))}
        <button
          onClick={handleClear}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
        >
          Clear All
        </button>
      </div>
    </div>
  );
}
