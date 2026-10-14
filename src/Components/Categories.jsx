import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
  setDoc,
} from "firebase/firestore";
import { ArrowLeft, ChevronDown, Download, Search, BookOpen } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useLanguages } from "../context/LanguageContext";
import { db, auth } from "../firebase";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";
import SEO from "./SEO";
import { useReadingProgress } from "../hooks/useReadingProgress";

export default function Categories() {
  const { languages } = useLanguages();
  const [searchParams] = useSearchParams();
  const { id } = useParams();
  const lang = searchParams.get("lang");

  const langMap = {};
  languages.forEach((item) => {
    const shortKey = item.shortForm;
    if (shortKey) {
      langMap[shortKey] = item.id;
    }
  });

  const { progress } = useReadingProgress();
  const currentBookProgress = progress.find(p => p.bookId === id);

  const [searchTerm, setSearchTerm] = useState("");
  const [chapters, setChapters] = useState([]);
  const [lesson, setLesson] = useState({});
  const [usedLanguages, setUsedLanguages] = useState([]);
  const { user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [loading, setLoading] = useState(true);

  const triggerDownload = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename || "download.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
    } catch {
      // Fallback if CORS prevents fetch
      const link = document.createElement("a");
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.download = filename || "download.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const executeDownload = async (actionToRun) => {
    const action = actionToRun || pendingAction;
    if (action?.pdfLink) {
      const filename = `${action.cat?.name || "chapter"}_${lang || "en"}.pdf`;
      await triggerDownload(action.pdfLink, filename);

      const currentUser = auth.currentUser || user;
      if (currentUser && action.cat) {
        try {
          await setDoc(doc(collection(db, "downloads")), {
            userId: currentUser.uid,
            chapterId: action.cat.id,
            chapterName: action.cat.name || "",
            lessonId: id,
            lessonName: lesson?.name || "",
            language: lang || "",
            pdfLink: action.pdfLink,
            timestamp: new Date().toISOString()
          });
        } catch (err) {
          console.error("Error saving download history:", err);
        }
      }
    } else {
      alert("PDF not available for the selected language.");
    }
  };

  const handleDownload = async (cat) => {
    const link = cat.pdfLink ? cat.pdfLink[langMap[lang]] : "";
    const action = { type: 'download', pdfLink: link, cat };
    setPendingAction(action);
    const currentUser = auth.currentUser || user;
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }
    if (link) {
      await executeDownload(action);
    } else {
      alert("PDF not available for the selected language.");
    }
  };

  const executePendingAction = () => {
    if (pendingAction?.type === 'download') {
      executeDownload(pendingAction);
    }
    setPendingAction(null);
  };

  const fetchLesson = async () => {
    const snapshot = await getDoc(doc(db, "lessons", id));
    if (!snapshot.exists()) {
      navigate("/");
      return;
    }
    setLesson(snapshot.data());
  };

  const fetchChapters = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, "chapters"),
        where("lessonId", "==", id),
        orderBy("position"),
      );
      const snapshot = await getDocs(q);
      const chaptersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        postsData: { english: [], chinese: [], chineseToEnglish: [] },
      }));
      // Determine which languages are actually used in these chapters and populate posts
      const used = new Set();
      await Promise.all(chaptersData.map(async (chapter) => {
        const postQuery = query(collection(db, "posts"), where("chapterId", "==", chapter.id));
        const postSnap = await getDocs(postQuery);
        postSnap.docs.forEach(doc => {
          const data = doc.data();
          const langId = data.language;
          used.add(langId);
          if (!chapter.postsData[langId]) {
            chapter.postsData[langId] = [];
          }
          chapter.postsData[langId].push({
            id: doc.id,
            postTitle: data.post_title,
            position: data.position
          });
        });
        
        // Sort the populated posts by position
        Object.keys(chapter.postsData).forEach(langId => {
          chapter.postsData[langId].sort((a, b) => (a.position || 0) - (b.position || 0));
        });
      }));
      setChapters(chaptersData);
      setUsedLanguages(Array.from(used));
      
    } catch (error) {
      console.log("🚀 ~ fetchChapters ~ error:", error);
    } finally {
      setLoading(false);
    }
  };

  const navigate = useNavigate();

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const filteredCategories = chapters.filter((cat) => {
    const matchesSearch = cat.name.toLowerCase().includes(searchTerm);
    return matchesSearch;
  });

  const filteredLanguages = React.useMemo(() => {
    if (usedLanguages.length === 0) return languages;
    return languages.filter(l => usedLanguages.includes(l.id));
  }, [languages, usedLanguages]);

  useEffect(() => {
    if (!lang) navigate("?lang=CN-EN");
    fetchLesson();
    fetchChapters();
  }, []);

  return (
    <div className="min-h-screen bg-[#fffdf8] pt-12 pb-24 text-[#2c2c2c]">
      <SEO
        title={
          lesson?.name
            ? `${lesson.name} - The Agamas`
            : "Categories - The Agamas"
        }
        description={
          lesson?.name
            ? `Explore chapters for ${lesson.name} on The Agamas.`
            : "Explore categories and chapters on The Agamas."
        }
        name="The Agamas"
        type="website"
      />

      <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <div className="mb-8 -ml-1">
          <button
            onClick={() => navigate(`/#chapters`)}
            style={{
              color: "#CD5C3D",
              backgroundColor: "transparent",
              fontFamily: 'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
              fontSize: "12px",
              lineHeight: "16px",
              verticalAlign: "baseline",
              letterSpacing: "0.6px",
              wordSpacing: "0px",
              margin: "0px",
              padding: "0px",
              fontWeight: 700,
              fontStyle: "normal",
              fontVariant: "normal",
              textTransform: "uppercase",
              textDecoration: "none",
              textAlign: "start",
              textIndent: "0px",
            }}
            className="inline-flex items-center gap-2 hover:opacity-85 transition-opacity cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            BACK
          </button>
        </div>

        {/* ── Page Header / Title & Controls ──────────────────────────────────────────────── */}
        <div className="relative mb-12">
          {/* Title in center */}
          <div className="flex flex-col items-center justify-center gap-6 mt-4 md:mt-2">
          <h1 className="text-center text-[#001e2d] mb-1">
            <span
              style={{
                fontFamily: '"PP Fragment Glare Regular", Georgia, serif',
                fontSize: "clamp(30px, 4vw, 48px)",
                fontStyle: "normal",
                fontVariantCaps: "normal",
                fontVariantEastAsian: "normal",
                fontVariantLigatures: "normal",
                fontVariantNumeric: "normal",
                fontWeight: 700
              }}
            >
              {lesson.name || "Loading…"}
            </span>
            <span 
              className="mx-3 text-[#cd5c3d] font-light"
              style={{ fontSize: "clamp(30px, 4vw, 48px)" }}
            >
              ·
            </span>
            <span 
              className="text-[#cd5c3d] italic" 
              style={{ 
                fontFamily: '"PP Fragment Glare Regular", Georgia, serif',
                fontSize: "clamp(30px, 4vw, 48px)"
              }}
            >
              All Chapters
            </span>
          </h1>
        </div>

          {/* Controls */}
          <div className="flex flex-wrap justify-center items-center gap-3 md:absolute md:top-8 md:right-0 z-10">
            {/* Language selector */}
            <div className="relative">
              <select
                style={{ fontFamily: 'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"' }}
                className="appearance-none bg-white border border-[#e8e0d8] text-[#2c2c2c] text-sm font-medium rounded-full px-4 py-2.5 pr-9 outline-none focus:border-[#cd5c3d] focus:ring-2 focus:ring-[#cd5c3d20] transition cursor-pointer"
                value={lang || ""}
                onChange={(e) => navigate("?lang=" + e.target.value)}
              >
                {filteredLanguages.map((l) => (
                  <option key={l.id} value={l.shortForm}>
                    {l.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888]" />
            </div>
          </div>
        </div>

        {/* ── Search & Controls ─────────────────────────────────────────────────── */}
        <div className="pt-2">
          <div className="mb-8">
          <p className="text-[#888] text-sm mb-3 ml-1">Select a chapter to view all verses or search below</p>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#aaa]" />
            <input
              type="text"
              onChange={handleSearch}
              placeholder="Search chapters…"
              className="w-full pl-11 pr-4 py-3 rounded-full border border-[#e8e0d8] bg-white outline-none focus:border-[#cd5c3d] focus:ring-2 focus:ring-[#cd5c3d20] transition text-sm"
            />
          </div>
        </div>

        {/* ── Accordion List ───────────────────────────────────────── */}
        <div className="flex flex-col gap-4">
          {filteredCategories.map((cat, cIndex) => {
            const displayName = cat.name ? cat.name.replace(/^Chapter\s+[a-zA-Z\-]+:/i, `Chapter ${cIndex + 1}:`) : "";
            return (
              <div
                key={cat.id}
                className={`rounded-2xl border overflow-hidden transition-all duration-200 border-[#e8e0d8] bg-white hover:border-[#cd5c3d50]`}
              >
                {/* Chapter Item */}
                <div
                  className={`flex justify-between items-center px-6 py-5 cursor-pointer transition-colors duration-150 bg-white hover:bg-[#fdf3ec]`}
                  onClick={() => navigate(`/chapter-view/${id}/${cat.id}?lang=${lang || "CN-EN"}`)}
                >
                  <div className="flex items-center gap-5">
                    {/* Circle Index */}
                    <div className="w-6 h-6 rounded-full bg-[#cd5c3d] text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {cIndex + 1}
                    </div>
                    {/* Titles */}
                    <div className="flex flex-col justify-center">
                      <h3
                        style={{
                          color: "#3B270E",
                          fontFamily: 'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
                          fontSize: "16px",
                          lineHeight: "24px",
                          fontWeight: 400,
                          textAlign: "left",
                          margin: "0px",
                          padding: "0px",
                          fontStyle: "normal",
                          fontVariantCaps: "normal",
                          fontVariantEastAsian: "normal",
                          fontVariantLigatures: "normal",
                          fontVariantNumeric: "normal",
                          textTransform: "none",
                          textDecoration: "none",
                        }}
                      >
                        {displayName}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      style={{ fontFamily: 'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"' }}
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold border rounded-full px-3 py-1.5 transition-colors border-[#e8e0d8] text-[#666] bg-white hover:border-[#cd5c3d] hover:text-[#cd5c3d] cursor-pointer`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(cat);
                      }}
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span className="hidden md:inline">Download</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="rounded-2xl border border-[#e8e0d8] bg-white px-6 py-14 text-center">
              <p className="text-base font-medium text-[#555]">
                Loading chapters...
              </p>
            </div>
          )}

          {!loading && filteredCategories.length === 0 && (
            <div className="rounded-2xl border border-[#e8e0d8] bg-white px-6 py-14 text-center">
              <p className="text-base font-medium text-[#555]">
                No chapters match your search.
              </p>
              <p className="text-sm text-[#aaa] mt-1">
                Try a different keyword.
              </p>
            </div>
          )}
        </div>
        </div>

        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onSuccess={() => {
            setAuthModalOpen(false);
            setTimeout(() => executePendingAction(), 100);
          }}
        />
      </div>
    </div>
  );
}
