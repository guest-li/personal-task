"use client";

import { useRef, useState } from "react";

export function Carousel({ items, renderItem }: { items: any[]; renderItem: (item: any) => React.ReactNode }) {
  const [index, setIndex] = useState(0);

  const prev = () => {
    setIndex((index - 1 + items.length) % items.length);
  };

  const next = () => {
    setIndex((index + 1) % items.length);
  };

  return (
    <div className="relative bg-gray-100 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between h-64">
        <button onClick={prev} className="absolute left-4 z-10 bg-white rounded-full p-2 hover:bg-gray-100">
          ←
        </button>

        <div className="flex-1 text-center">
          {items.length > 0 && renderItem(items[index])}
        </div>

        <button onClick={next} className="absolute right-4 z-10 bg-white rounded-full p-2 hover:bg-gray-100">
          →
        </button>
      </div>

      <div className="flex justify-center gap-2 pb-4">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`w-2 h-2 rounded-full ${i === index ? "bg-blue-600" : "bg-gray-400"}`}
          />
        ))}
      </div>
    </div>
  );
}
