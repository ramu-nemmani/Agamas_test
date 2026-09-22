import React from "react";
import DOMPurify from "dompurify";

export default function SearchResultCard({ result, chapters, languages, searchQuery, isRegex, onClick }) {
  const chapter = chapters.find(c => c.id === result.chapterId);
  const langObj = languages.find(l => l.id === result.post.language);
  const langName = langObj ? langObj.name : "Unknown Language";

  // A simple function to highlight the search term in text
  const highlightText = (text, query, isRegex) => {
    if (!query) return text;
    try {
      let regex;
      if (isRegex) {
        regex = new RegExp(`(${query})`, "gi");
      } else {
        const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        regex = new RegExp(`(${escaped})`, "gi");
      }
      
      const parts = text.split(regex);
      return (
        <span>
          {parts.map((part, i) => 
            regex.test(part) ? (
              <span key={i} className="bg-yellow-200 text-black font-semibold rounded px-0.5">{part}</span>
            ) : (
              part
            )
          )}
        </span>
      );
    } catch(e) {
      return text;
    }
  };

  return (
    <div 
      className="bg-white border border-gray-200 shadow-sm rounded p-0 mb-0 hover:shadow-md cursor-pointer transition-shadow flex flex-col md:flex-row overflow-hidden"
      onClick={() => onClick(result)}
    >
      {/* Left Column */}
      <div className="w-full md:w-40 bg-gray-50/50 p-4 border-b md:border-b-0 md:border-r border-gray-100 flex flex-col gap-1 text-xs text-[#8c9ca9] font-medium text-right items-end justify-start">
        <span>Alignment</span>
        <span>Translation</span>
      </div>
      
      {/* Right Column */}
      <div className="flex-1 p-5 pl-6">
        <div className="flex items-center gap-2 mb-3 text-xs uppercase tracking-wider text-[#8c9ca9] font-medium">
          <span className="text-[#cd5c3d]">{chapter ? chapter.name.replace(/^Chapter\s+[0-9]+:/i, '').trim() : "Unknown Chapter"}</span>
          <span>&bull;</span>
          <span>{langName}</span>
        </div>
        
        {result.post.post_title && (
          <h4 className="font-semibold text-base text-[#001e2d] mb-3 font-serif">
            {highlightText(result.post.post_title, searchQuery, isRegex)}
          </h4>
        )}

        <div className="text-[#4a4a4a] leading-loose font-serif text-[15px] text-justify" style={{
            fontFamily: '"Noto Serif", "Noto Serif Fallback", serif',
        }}>
          {highlightText(result.snippet, searchQuery, isRegex)}
        </div>
      </div>
    </div>
  );
}
