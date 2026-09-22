import React from "react";

export default function SearchCategories({ activeCategory, setActiveCategory, categoryCounts }) {
  const categories = [
    { id: "translation", label: "Translation Passages" },
    { id: "other", label: "Other Passages" }
  ];

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {categories.map(cat => {
        const isActive = activeCategory === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex flex-col items-center justify-center px-6 py-3 rounded shadow-sm border transition-colors flex-1 min-w-[150px] ${
              isActive
                ? "bg-white border-[#1e3a5f] text-[#1e3a5f]"
                : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
            }`}
          >
            <span className="text-sm font-semibold mb-0.5">{cat.label}</span>
            <span className={`text-xs ${isActive ? "text-[#cd5c3d] font-medium" : "text-[#cd5c3d]"}`}>
              {categoryCounts[cat.id] || 0} matches
            </span>
          </button>
        );
      })}
    </div>
  );
}
