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
            className={`flex flex-col items-center justify-center px-6 py-3 rounded-lg shadow-sm border transition-all duration-200 flex-1 min-w-[150px] ${
              isActive
                ? "bg-white border-[#cd5c3d] text-[#1e3a5f] shadow-md"
                : "bg-gray-50 border-gray-200 text-gray-500 hover:border-[#cd5c3d]/60 hover:bg-white"
            }`}
          >
            <span className={`text-sm mb-0.5 ${isActive ? "font-semibold text-[#1e3a5f]" : "font-semibold text-gray-700"}`}>
              {cat.label}
            </span>
            <span className={`text-xs ${isActive ? "text-[#cd5c3d] font-medium" : "text-[#cd5c3d]/80 font-medium"}`}>
              {categoryCounts[cat.id] || 0} matches
            </span>
          </button>
        );
      })}
    </div>
  );
}
