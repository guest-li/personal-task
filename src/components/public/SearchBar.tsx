"use client";

import { useState, useEffect } from "react";

export function SearchBar({ onSearch }: { onSearch: (query: string) => void }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/v1/public/universities?search=${encodeURIComponent(query)}&limit=5`);
        const data = await res.json();
        setSuggestions(data.universities || []);
      } catch (e) {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search universities, courses..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-4 pl-10 py-2 border border-brand-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all duration-200"
          />
          <span className="absolute left-3 top-2.5 text-brand-400 text-lg">🔍</span>
        </div>
        <button
          type="submit"
          className="bg-gradient-to-r from-brand-700 to-brand-800 hover:from-brand-800 hover:to-brand-900 text-white font-medium px-6 py-2 rounded-lg transition-all duration-200"
        >
          Search
        </button>
      </form>

      {suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-brand-200 rounded-lg shadow-card z-10">
          {suggestions.map((item) => (
            <div key={item.id} className="px-4 py-2 hover:bg-brand-50 cursor-pointer border-b border-brand-50 last:border-b-0 transition-colors">
              {item.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
