import React, { useState, useEffect, useRef } from "react";
import { X, Search, Terminal } from "lucide-react";
import { fetchSearchData, performSearch } from "../../utils/searchHelpers";
import SearchCategories from "./SearchCategories";
import SearchResultCard from "./SearchResultCard";
import { db } from "../../firebase";

export default function SearchOverlay({ 
  isOpen, 
  onClose, 
  lessonId, 
  chapters, 
  languages,
  currentLang,
  langMap,
  onResultClick
}) {
  const [query, setQuery] = useState("");
  const [isRegex, setIsRegex] = useState(false);
  const [loading, setLoading] = useState(false);
  const [allPosts, setAllPosts] = useState([]);
  const [hasFetched, setHasFetched] = useState(false);
  const [activeCategory, setActiveCategory] = useState("translation");
  const [results, setResults] = useState({ translation: [], other: [] });
  const [errorMsg, setErrorMsg] = useState("");
  
  const inputRef = useRef(null);
  
  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Fetch all data for the current lesson once when opened
  useEffect(() => {
    if (isOpen && !hasFetched && chapters.length > 0) {
      const loadData = async () => {
        try {
          const posts = await fetchSearchData(db, chapters);
          setAllPosts(posts);
          setHasFetched(true);
        } catch (e) {
          console.error("Failed to fetch search data:", e);
        }
      };
      loadData();
    }
  }, [isOpen, hasFetched, chapters]);

  // Debounced search effect
  useEffect(() => {
    if (!isOpen) return;
    
    setErrorMsg("");
    if (!query || query.trim() === "") {
      setResults({ translation: [], other: [] });
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      
      const currentLangId = langMap[currentLang];
      
      const searchResults = performSearch(allPosts, query, isRegex);
      
      if (searchResults.error) {
        setErrorMsg(searchResults.message);
        setResults({ translation: [], other: [] });
        setLoading(false);
        return;
      }

      // Categorize
      const translationResults = [];
      const otherResults = [];

      searchResults.forEach(res => {
        if (res.post.language === currentLangId) {
          translationResults.push(res);
        } else {
          otherResults.push(res);
        }
      });

      setResults({
        translation: translationResults,
        other: otherResults
      });
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [query, isRegex, allPosts, currentLang, langMap, isOpen]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentResults = results[activeCategory] || [];
  const categoryCounts = {
    translation: results.translation.length,
    other: results.other.length
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#1d3547]/60 backdrop-blur-sm flex flex-col items-center py-10 overflow-hidden">
      
      {/* Search Header Container */}
      <div className="w-full max-w-4xl px-4 flex flex-col gap-4 relative shrink-0">
        
        {/* Close Button above the input on the right */}
        <div className="flex justify-end mb-1">
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
            title="Close search (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input Box */}
        <div className="relative flex items-center bg-white rounded-md shadow-lg overflow-hidden">
          <input 
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type to search..."
            className="w-full bg-transparent border-none outline-none text-gray-800 px-5 py-3 md:py-4 text-base md:text-lg placeholder:text-gray-400"
          />
          
          <div className="flex items-center gap-2 pr-4">
            <button
              onClick={() => setIsRegex(!isRegex)}
              title={isRegex ? "Regex mode on" : "Regex mode off"}
              className={`p-1.5 rounded transition-colors flex items-center justify-center font-mono font-bold text-sm ${
                isRegex ? "bg-gray-200 text-gray-800" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              }`}
            >
              .*
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="text-red-500 text-center text-sm bg-red-50 py-2 rounded">
            {errorMsg}
          </div>
        )}

        {/* Showing results text */}
        {(query.trim() !== "" && !errorMsg) && (
          <div className="text-white text-sm font-medium mt-2">
            Showing results for "{query}"
          </div>
        )}

        {/* Categories Tab */}
        {(query.trim() !== "" && !errorMsg) && (
          <SearchCategories 
            activeCategory={activeCategory} 
            setActiveCategory={setActiveCategory}
            categoryCounts={categoryCounts}
          />
        )}
      </div>

      {/* Search Results Area */}
      <div className="w-full max-w-4xl px-4 flex-1 overflow-y-auto mt-4 pb-20">
        {loading && (
          <div className="text-white text-center py-10">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent mb-2"></div>
            <p>Searching...</p>
          </div>
        )}

        {!loading && query.trim() !== "" && !errorMsg && currentResults.length === 0 && (
          <div className="text-white text-center py-20 text-lg">
            No results found.
          </div>
        )}

        {!loading && !errorMsg && currentResults.length > 0 && (
          <div className="flex flex-col gap-4">
            {currentResults.map((result, idx) => (
              <SearchResultCard 
                key={`${result.post.id}-${idx}`}
                result={result}
                chapters={chapters}
                languages={languages}
                searchQuery={query}
                isRegex={isRegex}
                onClick={onResultClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
