import SEO from "./SEO";
import { ArrowLeft, BookOpen, ChevronLeft, ChevronRight, X, Maximize2, Minimize2, Download, Bookmark, Check } from "lucide-react";
import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { db, auth } from "../firebase";
import { collection, doc, getDoc, getDocs, orderBy, query, where, setDoc } from "firebase/firestore";
import { useLanguages } from "../context/LanguageContext";
import DOMPurify from "dompurify";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";
import { useSaveProgress } from "../hooks/useSaveProgress";
import BookCover from "./common/BookCover";
export default function PageReader({ setIsFullScreen: globalSetIsFullScreen }) {
  const navigate = useNavigate();
  const { lessonId } = useParams(); // Using lessonId as the book identifier
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPage = parseInt(searchParams.get("page") || "0", 10);

  const { languages } = useLanguages();
  const { user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const [book, setBook] = useState(null);
  const [titles, setTitles] = useState([]);
  const [versesByTitle, setVersesByTitle] = useState({});
  const [loading, setLoading] = useState(true);
  const [bookError, setBookError] = useState(false);

  const [markItStatus, setMarkItStatus] = useState(false);

  // Kindle Aa Settings
  const [fontSize, setFontSize] = useState("16"); // 14, 16, 20, 24
  const [lineSpacing, setLineSpacing] = useState("1.75"); // 1.4 (Compact), 1.75 (Normal), 2.1 (Relaxed)
  const [margins, setMargins] = useState("normal"); // narrow (max-w-4xl), normal (max-w-2xl), wide (max-w-xl)
  const [theme, setTheme] = useState("light");

  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [usedLanguages, setUsedLanguages] = useState([]);

  // Pagination Measurement States
  const [flatBlocks, setFlatBlocks] = useState([]);
  const [pages, setPages] = useState([]);
  const [isMeasuring, setIsMeasuring] = useState(true);
  const measureContainerRef = useRef(null);

  // Page index
  const [currentPageIndex, setCurrentPageIndex] = useState(initialPage);

  useSaveProgress({
    bookId: lessonId,
    bookTitle: book?.name,
    coverUrl: book?.image || null, // Assuming book has an image property, adjust if needed
    lastUrl: `/book/${lessonId}/read?page=${currentPageIndex}&lang=${selectedLanguage}`,
    dependencies: [currentPageIndex, selectedLanguage]
  });

  useEffect(() => {
    if (currentPageIndex !== initialPage) {
      setSearchParams({ page: currentPageIndex.toString() }, { replace: true });
    }
  }, [currentPageIndex, setSearchParams]);

  // Popups/drawers
  const [showSettings, setShowSettings] = useState(false);
  const [showTOC, setShowTOC] = useState(false);
  const [isFullscreenLocal, setIsFullscreenLocal] = useState(false);
  const isFullscreen = isFullscreenLocal;

  // Refs for clicking outside to close popups
  const settingsRef = useRef(null);
  const settingsBtnRef = useRef(null);
  const tocRef = useRef(null);
  const tocBtnRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showSettings &&
        settingsRef.current && !settingsRef.current.contains(event.target) &&
        settingsBtnRef.current && !settingsBtnRef.current.contains(event.target)
      ) {
        setShowSettings(false);
      }
      if (
        showTOC &&
        tocRef.current && !tocRef.current.contains(event.target) &&
        tocBtnRef.current && !tocBtnRef.current.contains(event.target)
      ) {
        setShowTOC(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSettings, showTOC]);

  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const lastScrollTime = useRef(0);
  const containerRef = useRef(null);
  const readerCardRef = useRef(null);

  // Convert Agamas LanguageContext to availableLanguages format
  const langMap = useMemo(() => {
    const map = {};
    languages.forEach(l => { if (l.shortForm) map[l.shortForm] = l.id; });
    return map;
  }, [languages]);

  const availableLanguages = useMemo(() => {
    return languages.filter(l => l.shortForm).map(l => ({
      code: l.shortForm,
      label: l.name,
      textKey: l.shortForm
    }));
  }, [languages]);

  useEffect(() => {
    if (globalSetIsFullScreen) {
      globalSetIsFullScreen(isFullscreen);
    }
  }, [isFullscreen, globalSetIsFullScreen]);

  // Sync browser fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreenLocal(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      if (globalSetIsFullScreen) globalSetIsFullScreen(false); // Clean up on unmount
    };
  }, [globalSetIsFullScreen]);

  // Request/exit native fullscreen
  useEffect(() => {
    if (isFullscreen) {
      if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => console.error(err));
      }
    } else {
      if (document.exitFullscreen && document.fullscreenElement) {
        document.exitFullscreen().catch(err => console.error(err));
      }
    }
  }, [isFullscreen]);

  useEffect(() => {
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isTwoColumns = windowWidth >= 768;
  const sheetHeight = isFullscreen ? windowHeight : (isTwoColumns ? Math.min(windowHeight * 0.95, 1200) : windowHeight);
  const contentHeight = sheetHeight - 160;

  // Theme colors
  const themeClasses = {
    light: {
      bg: "bg-white",
      text: "text-slate-900",
      subText: "text-slate-500",
      border: "border-slate-100",
      toolbarBg: "bg-white",
      highlightBg: "bg-[#f8f9fa]",
      activeItem: "bg-slate-50",
      inputBg: "bg-slate-100",
    },
    sepia: {
      bg: "bg-[#f4ecd8]",
      text: "text-[#5b4636]",
      subText: "text-[#8a725d]",
      border: "border-[#ebdcb9]",
      toolbarBg: "bg-[#f4ecd8]",
      highlightBg: "bg-[#ebdcb9]/40",
      activeItem: "bg-[#ebdcb9]/20",
      inputBg: "bg-[#ebdcb9]/35",
    },
    dark: {
      bg: "bg-[#121212]",
      text: "text-[#ebd4c1]",
      subText: "text-slate-400",
      border: "border-[#2d2d2d]",
      toolbarBg: "bg-[#121212]",
      highlightBg: "bg-slate-900/60",
      activeItem: "bg-[#1c1c1e]",
      inputBg: "bg-[#252528]",
    },
  }[theme];

  const selectedLang = availableLanguages.find(l => l.code === selectedLanguage);

  // Load book, chapters, and verses
  useEffect(() => {
    if (!lessonId || availableLanguages.length === 0) return;

    const loadContent = async () => {
      setLoading(true);
      try {
        // 1. Fetch Book (Lesson)
        const lessonSnap = await getDoc(doc(db, "lessons", lessonId));
        if (!lessonSnap.exists()) {
          setBookError(true);
          return;
        }
        const lessonData = { id: lessonId, ...lessonSnap.data() };
        setBook(lessonData);

        // 2. Fetch Chapters
        const chapQuery = query(
          collection(db, "chapters"),
          where("lessonId", "==", lessonId),
          orderBy("position")
        );
        const chapSnap = await getDocs(chapQuery);
        let chaptersData = chapSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        setTitles(chaptersData);

        if (chaptersData.length === 0) {
          setVersesByTitle({});
          setLoading(false);
          return;
        }

        // 3. Fetch Posts (Verses) for all chapters concurrently
        const results = {};
        await Promise.all(chaptersData.map(async (chapter) => {
          const postQuery = query(collection(db, "posts"), where("chapterId", "==", chapter.id));
          const postSnap = await getDocs(postQuery);

          // Group posts by position to create unified Verse objects across languages
          const groupedByPos = {};

          // Reverse map language ID to shortForm
          const idToShortForm = {};
          Object.entries(langMap).forEach(([short, id]) => { idToShortForm[id] = short; });

          postSnap.docs.forEach(docSnap => {
            const data = docSnap.data();
            const pos = data.position !== undefined ? data.position : 0;
            const langShort = idToShortForm[data.language];

            if (!groupedByPos[pos]) {
              groupedByPos[pos] = {
                titleId: chapter.id,
                position: pos,
                postTitle: data.post_title || ""
              };
            }
            if (langShort && data.post_content) {
              groupedByPos[pos][langShort] = data.post_content; // Raw HTML string
            }
          });

          // Convert to sorted array
          results[chapter.id] = Object.values(groupedByPos).sort((a, b) => {
            const posA = parseFloat(a.position);
            const posB = parseFloat(b.position);
            if (isNaN(posA) && isNaN(posB)) return 0;
            if (isNaN(posA)) return -1;
            if (isNaN(posB)) return 1;
            return posA - posB;
          });
        }));

        setVersesByTitle(results);

        // Extract uniquely used languages
        const usedLangCodes = new Set();
        Object.values(results).forEach(versesArray => {
          versesArray.forEach(verseObj => {
            Object.keys(verseObj).forEach(key => {
              if (key !== "titleId" && key !== "position") {
                usedLangCodes.add(key);
              }
            });
          });
        });
        setUsedLanguages(Array.from(usedLangCodes));

      } catch (err) {
        console.error("Failed to load content", err);
        setBookError(true);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [lessonId, availableLanguages, langMap]);

  // Filter languages to only show those that have actual posts
  const filteredAvailableLanguages = useMemo(() => {
    if (usedLanguages.length === 0) return availableLanguages;
    return availableLanguages.filter(l => usedLanguages.includes(l.code));
  }, [availableLanguages, usedLanguages]);

  const urlLang = searchParams.get("lang");

  // Sync default primary language
  useEffect(() => {
    if (filteredAvailableLanguages.length > 0 && (!selectedLanguage || !filteredAvailableLanguages.find(l => l.code === selectedLanguage))) {
      const urlLangObj = urlLang ? filteredAvailableLanguages.find(l => l.code === urlLang) : null;

      if (urlLangObj) {
        setSelectedLanguage(urlLangObj.code);
      } else {
        // Default to Chinese To English, then English, then first available
        const cte = filteredAvailableLanguages.find(l => l.label.toLowerCase() === "chinese to english" || l.code === "CTE");
        const en = filteredAvailableLanguages.find(l => l.code === "EN" || l.label.toLowerCase() === "english");
        setSelectedLanguage(cte ? cte.code : (en ? en.code : filteredAvailableLanguages[0].code));
      }
    }
  }, [filteredAvailableLanguages, selectedLanguage, urlLang]);

  // Create flat blocks (paragraphs)
  useEffect(() => {
    setIsMeasuring(true);
    const blocks = [];
    if (book) blocks.push({ type: "cover", book, id: "cover" });

    titles.forEach((title, idx) => {
      blocks.push({ type: "chapter", titleText: title.name, title, order: idx + 1, id: `ch-${title.id}` });

      const verses = versesByTitle[title.id] || [];

      // Check if chapter has ANY posts in the selected language
      const hasLanguagePosts = verses.some(v => v[selectedLang?.textKey]);
      if (!hasLanguagePosts) {
        blocks.push({ type: "empty-chapter", chapterId: title.id, id: `empty-${title.id}` });
      } else {
        verses.forEach((verse) => {
          const primaryHtmlRaw = selectedLang?.textKey ? verse[selectedLang.textKey] : "";
          const parallelHtmlRaw = "";

          if (!primaryHtmlRaw && !parallelHtmlRaw) return;

          const splitHtml = (htmlRaw) => {
            if (!htmlRaw) return [];
            if (htmlRaw.includes("<p>")) {
              return htmlRaw.match(/<p[^>]*>[\s\S]*?<\/p>/gi) || [htmlRaw];
            } else {
              return htmlRaw.split(/(?:<br\s*\/?>\s*){1,}|\n{1,}/gi).filter(s => s.trim().length > 0);
            }
          };

          const primaryParas = splitHtml(primaryHtmlRaw);
          const parallelParas = splitHtml(parallelHtmlRaw);

          const maxParas = Math.max(primaryParas.length, parallelParas.length);
          for (let i = 0; i < maxParas; i++) {
            blocks.push({
              type: "verse-paragraph",
              id: `v-${verse.position}-${i}`,
              verse: verse,
              primaryHtml: primaryParas[i] || "",
              parallelHtml: parallelParas[i] || "",
              postTitle: i === 0 ? verse.postTitle : ""
            });
          }
        });
      }
    });
    setFlatBlocks(blocks);
  }, [book, titles, versesByTitle, selectedLang]);

  // Measurement Effect
  useEffect(() => {
    if (!isMeasuring || flatBlocks.length === 0 || !measureContainerRef.current) return;

    // We use setTimeout to ensure DOM has painted the measure container
    const measureTimer = setTimeout(() => {
      const container = measureContainerRef.current;
      const children = Array.from(container.children);
      const measuredPages = [];
      let currentPage = [];
      let currentHeight = 0;
      const budget = contentHeight; // Strict vertical budget

      children.forEach((child, index) => {
        const block = flatBlocks[index];
        const h = child.getBoundingClientRect().height;
        // Add exact margins bottom spacing 
        const blockHeight = h + (block.type === 'chapter' ? 24 : 16);

        if (block.type === 'cover') {
          // Push the cover as its own page
          if (currentPage.length > 0) {
            measuredPages.push(currentPage);
          }
          measuredPages.push([block]);
          // Push a blank page so the cover stands alone in 2-column mode
          if (isTwoColumns) {
            measuredPages.push([{ type: 'blank', id: 'blank-after-cover' }]);
          }
          currentPage = [];
          currentHeight = 0;
        } else if (block.type === 'chapter' || block.type === 'empty-chapter') {
          // ALWAYS force a new page for a chapter
          if (currentPage.length > 0) {
            measuredPages.push(currentPage);
          }
          currentPage = [block];
          currentHeight = blockHeight;
        } else {
          if (currentHeight + blockHeight > budget && currentPage.length > 0) {
            measuredPages.push(currentPage);
            currentPage = [block];
            currentHeight = blockHeight;
          } else {
            currentPage.push(block);
            currentHeight += blockHeight;
          }
        }
      });

      if (currentPage.length > 0) {
        measuredPages.push(currentPage);
      }

      setPages(measuredPages);
      setIsMeasuring(false);
    }, 50);

    return () => clearTimeout(measureTimer);
  }, [flatBlocks, isMeasuring, contentHeight, isTwoColumns, fontSize, lineSpacing, margins]);

  // Keep index in bounds
  useEffect(() => {
    if (!loading && pages.length > 0 && currentPageIndex >= pages.length) {
      setCurrentPageIndex(pages.length - 1);
    }
  }, [pages.length, currentPageIndex, loading]);

  useEffect(() => {
    const chapterIdToJump = searchParams.get("chapterId");
    const postNoToJump = searchParams.get("postNo");

    if (!isMeasuring && pages.length > 0 && chapterIdToJump) {
      let targetIndex = -1;

      if (postNoToJump) {
        // Find exact verse
        const postNum = parseInt(postNoToJump, 10);
        targetIndex = pages.findIndex(p => p.some(item =>
          item.type === "verse-paragraph" &&
          item.verse.titleId === chapterIdToJump &&
          item.verse.position === postNum
        ));
      }

      // Fallback to chapter start if verse not found or not provided
      if (targetIndex === -1) {
        targetIndex = pages.findIndex(p => p.some(item =>
          item.type === "chapter" &&
          item.title.id === chapterIdToJump
        ));
      }

      if (targetIndex !== -1) {
        setCurrentPageIndex(targetIndex);
      }
      // Remove params from URL so it doesn't jump again if layout changes
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("chapterId");
      newParams.delete("postNo");
      setSearchParams(newParams, { replace: true });
    }
  }, [isMeasuring, pages, searchParams, setSearchParams]);

  const goNext = useCallback(() => setCurrentPageIndex(prev => {
    const nextIdx = prev + (isTwoColumns ? 2 : 1);
    return nextIdx < pages.length ? nextIdx : prev;
  }), [pages.length, isTwoColumns]);
  const goPrev = useCallback(() => setCurrentPageIndex(prev => {
    const step = isTwoColumns ? 2 : 1;
    return prev >= step ? prev - step : 0;
  }), [isTwoColumns]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight" || e.key === "PageDown") goNext();
      else if (e.key === "ArrowLeft" || e.key === "PageUp") goPrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goNext, goPrev]);

  const accumulatedDelta = useRef(0);
  useEffect(() => {
    const card = readerCardRef.current;
    if (!card) return;
    const handleWheel = (e) => {
      // Allow native scrolling inside the TOC and Settings popups
      if (tocRef.current?.contains(e.target) || settingsRef.current?.contains(e.target)) {
        return;
      }
      e.preventDefault();
      const now = Date.now();
      if (now - lastScrollTime.current < 400) {
        accumulatedDelta.current = 0;
        return;
      }
      accumulatedDelta.current += e.deltaY;
      if (accumulatedDelta.current > 60) {
        goNext();
        lastScrollTime.current = now;
        accumulatedDelta.current = 0;
      } else if (accumulatedDelta.current < -60) {
        goPrev();
        lastScrollTime.current = now;
        accumulatedDelta.current = 0;
      }
    };
    card.addEventListener("wheel", handleWheel, { passive: false });
    return () => card.removeEventListener("wheel", handleWheel);
  }, [goNext, goPrev]);

  useEffect(() => {
    const card = readerCardRef.current;
    if (!card) return;
    let touchStartX = 0;
    let touchEndX = 0;
    const handleTouchStart = (e) => touchStartX = e.changedTouches[0].screenX;
    const handleTouchEnd = (e) => {
      touchEndX = e.changedTouches[0].screenX;
      if (touchEndX < touchStartX - 50) goNext();
      else if (touchEndX > touchStartX + 50) goPrev();
    };
    card.addEventListener("touchstart", handleTouchStart, { passive: true });
    card.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      card.removeEventListener("touchstart", handleTouchStart);
      card.removeEventListener("touchend", handleTouchEnd);
    };
  }, [goNext, goPrev]);

  const handleSliderChange = (e) => {
    const idx = parseInt(e.target.value, 10);
    if (!isNaN(idx) && idx >= 0 && idx < pages.length) setCurrentPageIndex(idx);
  };

  const jumpToChapter = (chapterId) => {
    const targetIndex = pages.findIndex(p => p.some(item => item.type === "chapter" && item.title.id === chapterId));
    if (targetIndex !== -1) setCurrentPageIndex(targetIndex);
    setShowTOC(false);
  };

  const findCurrentChapterInfo = () => {
    for (let i = currentPageIndex; i >= 0; i--) {
      const pageItems = pages[i];
      if (!pageItems) continue;

      // Look for the LAST verse or chapter on the page so we jump to where the user left off
      const found = [...pageItems].reverse().find(item => item.type === "chapter" || item.type === "verse-paragraph");

      if (found) {
        if (found.type === "chapter") return { cId: found.title.id, cTitle: found.titleText, cPdfLink: found.title.pdfLink };
        else if (found.type === "verse-paragraph") {
          const tId = found.verse.titleId;
          const tTitle = titles.find(t => t.id === tId);
          return { cId: tId, cTitle: tTitle?.name || "", cPdfLink: tTitle?.pdfLink, cPostNo: found.verse.position };
        }
      }
    }
    if (titles && titles.length > 0) return { cId: titles[0].id, cTitle: titles[0].name, cPdfLink: titles[0].pdfLink };
    return null;
  };

  const executeDownload = async () => {
    const chapInfo = findCurrentChapterInfo();
    if (chapInfo) {
      const pdfLink = chapInfo.cPdfLink ? chapInfo.cPdfLink[langMap[selectedLanguage]] : "";
      if (pdfLink) {
        window.open(pdfLink, "_blank");
        const currentUser = auth.currentUser || user;
        if (currentUser) {
          try {
            await setDoc(doc(collection(db, "downloads")), {
              userId: currentUser.uid,
              chapterId: chapInfo.cId,
              chapterName: chapInfo.cTitle,
              lessonId: lessonId,
              lessonName: book?.name || "",
              language: selectedLanguage || "",
              pdfLink: pdfLink,
              timestamp: new Date().toISOString()
            });
          } catch (err) {
            console.error("Error saving download history:", err);
          }
        }
      } else {
        alert("PDF not available for the selected language.");
      }
    }
  };

  const executeMarkIt = async () => {
    setMarkItStatus(true);
    try {
      const chapInfo = findCurrentChapterInfo();
      const currentUser = auth.currentUser || user;
      if (chapInfo && currentUser) {
        await setDoc(doc(db, "bookmarks", `${currentUser.uid}_${chapInfo.cId}`), {
          userId: currentUser.uid,
          chapterId: chapInfo.cId,
          chapterName: chapInfo.cTitle,
          lessonId: lessonId,
          lessonName: book?.name,
          timestamp: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error("Error marking it:", err);
    }
    setTimeout(() => setMarkItStatus(false), 2000);
  };

  const executePendingAction = () => {
    if (pendingAction === 'download') {
      executeDownload();
    } else if (pendingAction === 'markIt') {
      executeMarkIt();
    }
    setPendingAction(null);
  };

  const handleDownload = () => {
    const currentUser = auth.currentUser || user;
    if (!currentUser) {
      setPendingAction('download');
      setAuthModalOpen(true);
      return;
    }
    executeDownload();
  };

  const handleMarkIt = () => {
    const currentUser = auth.currentUser || user;
    if (!currentUser) {
      setPendingAction('markIt');
      setAuthModalOpen(true);
      return;
    }
    executeMarkIt();
  };

  const marginMaxWidthClass = {
    narrow: isTwoColumns ? "max-w-[1500px]" : "max-w-4xl",
    normal: isTwoColumns ? "max-w-7xl" : "max-w-2xl",
    wide: isTwoColumns ? "max-w-5xl" : "max-w-xl",
  }[margins];


  function stripInlineStyles(htmlString) {
    if (!htmlString) return "";
    return DOMPurify.sanitize(htmlString, { FORBID_ATTR: ["style"] });
  }

  if (loading) {
    return (
      <div className={`w-full min-h-screen ${themeClasses.bg} flex flex-col items-center justify-center font-sans transition-colors duration-300 p-6 select-none`}>
        {book ? (
          <div className="flex flex-col items-center gap-6 max-w-sm w-full text-center">
            <div className="relative aspect-[2/3] w-64 overflow-hidden rounded-r-lg rounded-l-[3px] border-l-2 border-slate-950 bg-[#16171d] animate-pulse">
              <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/50 via-black/20 to-transparent z-10" />
              <div className="absolute inset-y-0 left-3 w-[1px] bg-white/10 z-10" />
              <BookCover
                imageUrl={book.imageUrl}
                title={book.name}
                author="Datuk Dr Lim Siow Jin (Acharya Nagajiva)"
              />
            </div>
            <div className="space-y-2">
              <h2 className={`font-sans text-base sm:text-lg font-bold ${themeClasses.text}`}>
                {book.name}
              </h2>
              <div className="flex items-center justify-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
                <p className={`text-xs ${themeClasses.subText}`}>Opening scripture...</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
            <p className={`text-xs ${themeClasses.subText}`}>Loading Page Reader...</p>
          </div>
        )}
      </div>
    );
  }

  if (bookError || !book) {
    return (
      <div className={`w-full min-h-screen ${themeClasses.bg} flex items-center justify-center font-sans transition-colors duration-300`}>
        <div className="text-center px-4">
          <p className={`${themeClasses.text} mb-4 text-base font-semibold`}>Book not found</p>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition"
            style={{
              fontFamily: 'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
              fontSize: '12px',
              fontStyle: 'normal',
              fontVariantCaps: 'normal',
              fontVariantEastAsian: 'normal',
              fontVariantLigatures: 'normal',
              fontVariantNumeric: 'normal',
              fontWeight: 700
            }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Reading Room
          </button>
        </div>
      </div>
    );
  }

  // In two-column mode, we show two explicit pages
  const activePageLeft = pages[currentPageIndex] || [];
  const activePageRight = isTwoColumns && (currentPageIndex + 1 < pages.length) ? pages[currentPageIndex + 1] : null;
  const totalDisplayed = pages.length;
  const percentComplete = totalDisplayed > 1 ? Math.round((currentPageIndex / (totalDisplayed - 1)) * 100) : 0;

  const renderBlock = (item, idx) => {
    if (item.type === "cover") {
      return (
        <div key={`page-cov-${idx}`} className="h-full flex items-center justify-center p-8" style={{ breakInside: "avoid" }}>
          <div className="relative overflow-hidden rounded-r-lg rounded-l-[3px] border-l-2 border-slate-950 bg-[#16171d]" style={{ height: "90%", maxHeight: `${contentHeight * 0.9}px`, width: "100%", maxWidth: "400px", aspectRatio: "2/3" }}>
            <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/50 via-black/20 to-transparent z-10" />
            <div className="absolute inset-y-0 left-3 w-[1px] bg-white/10 z-10" />
            <BookCover
              imageUrl={book.imageUrl}
              title={book.name}
              author="Datuk Dr Lim Siow Jin (Acharya Nagajiva)"
            />
          </div>
        </div>
      );
    }

    if (item.type === "chapter") {
      return (
        <div key={`page-ch-${idx}`} className="mb-6 flex items-center gap-3 select-none" style={{ breakInside: "avoid" }}>
          <span className={`h-[1px] flex-1 ${theme === "dark" ? "bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" : "bg-gradient-to-r from-transparent via-slate-200 to-transparent"}`} />
          <h2
            className="text-sm sm:text-base font-semibold tracking-wider uppercase text-center px-3"
            style={{
              color: theme === 'light' ? '#001e2d' : undefined,
              fontFamily: 'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"'
            }}
          >
            {item.titleText}
          </h2>
          <span className={`h-[1px] flex-1 ${theme === "dark" ? "bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" : "bg-gradient-to-r from-transparent via-slate-200 to-transparent"}`} />
        </div>
      );
    }

    if (item.type === "empty-chapter") {
      return (
        <div key={`page-empty-${idx}`} className="mb-6 text-center text-sm text-[#888] border border-dashed border-[#e8e0d8] rounded-xl px-4 py-8 bg-white/60">
          No posts available for this language in this chapter.
        </div>
      );
    }

    if (item.type === "verse-paragraph") {
      return (
        <div key={`page-v-${idx}`} className="leading-relaxed text-justify space-y-1.5 mb-4" style={{
          fontSize: `${fontSize}px`,
          lineHeight: lineSpacing,
          fontFamily: 'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
          fontWeight: 400,
          fontStyle: "normal",
          fontVariantCaps: "normal",
          fontVariantEastAsian: "normal",
          fontVariantLigatures: "normal",
          fontVariantNumeric: "normal"
        }}>
          {item.postTitle && (
            <div
              className="font-bold mb-2"
              style={{ color: theme === 'light' ? '#001e2d' : undefined }}
            >
              {item.postTitle}
            </div>
          )}
          {item.primaryHtml && (
            <div className="font-sans [&_*]:!font-normal" dangerouslySetInnerHTML={{ __html: stripInlineStyles(item.primaryHtml) }} />
          )}
          {item.parallelHtml && (
            <div className={`pl-4 border-l italic font-sans [&_*]:!font-normal ${themeClasses.subText} ${theme === "dark" ? "border-amber-500/30" : "border-slate-350"}`} dangerouslySetInnerHTML={{ __html: stripInlineStyles(item.parallelHtml) }} />
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div ref={containerRef} className={`w-full ${isFullscreen ? "h-screen overflow-hidden" : "min-h-screen"} ${theme === "light" ? "bg-[#fffdf8]" : themeClasses.bg} flex flex-col justify-between font-sans transition-colors duration-300`}>
      <SEO
        title={`${book.name} - Page View - The Agamas`}
        description={`Read ${book.name} page-by-page.`}
      />

      <div className={`flex-grow flex items-center justify-center ${isFullscreen ? "p-0" : "py-6 sm:py-10 md:py-14 px-4 sm:px-6 md:px-12"} select-text`}>
        <div
          ref={readerCardRef}
          className={`w-full h-full ${isFullscreen ? "rounded-none" : "sm:rounded-2xl"} border ${themeClasses.border} ${themeClasses.bg} ${themeClasses.text} flex flex-col justify-between overflow-hidden relative transition-colors duration-300`}
          style={{ maxWidth: isFullscreen ? "100%" : (isTwoColumns ? "1600px" : "100%"), height: `${sheetHeight}px` }}
        >

          {/* TOOLBAR */}
          <header className={`h-16 flex-shrink-0 px-2 sm:px-4 border-b ${themeClasses.border} ${themeClasses.toolbarBg} flex items-center justify-between gap-2 sm:gap-4 z-30 select-none relative`}>
            <div className="flex items-center shrink-0">
              <button
                onClick={() => navigate(`/select-mode/${book.id}`)}
                className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider transition cursor-pointer hover:opacity-80 shrink-0"
                style={{ color: "#9C948C" }}
              >
                <ArrowLeft size={14} style={{ color: "#9C948C" }} />
                Back
              </button>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-3">
              <button
                onClick={handleMarkIt}
                className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold border rounded-full transition cursor-pointer shrink-0 ${
                  markItStatus 
                    ? "border-green-600 bg-green-50 text-green-700 hover:bg-green-100" 
                    : "border-slate-800 text-slate-800 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {markItStatus ? <Check className="w-3 h-3" /> : <Bookmark className="w-3 h-3" />}
                <span>{markItStatus ? "Saved!" : "Mark It"}</span>
              </button>

              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold border rounded-full transition cursor-pointer border-slate-800 text-slate-800 hover:bg-slate-800 hover:text-white disabled:opacity-50 shrink-0"
              >
                <Download className="w-3 h-3" />
                <span>Download</span>
              </button>

              <button ref={tocBtnRef} onClick={() => { setShowTOC(!showTOC); setShowSettings(false); }} className="p-2 rounded hover:bg-slate-50 text-slate-500 hover:text-slate-900 transition cursor-pointer shrink-0" title="Table of Contents">
                <BookOpen size={16} />
              </button>

              <button onClick={() => setIsFullscreenLocal(!isFullscreen)} className="p-2 rounded-full text-slate-500 hover:bg-black hover:text-white transition cursor-pointer shrink-0" title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
                {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>

              <button ref={settingsBtnRef} onClick={() => { setShowSettings(!showSettings); setShowTOC(false); }} className="p-2 rounded hover:bg-slate-50 text-slate-500 hover:text-slate-900 transition cursor-pointer shrink-0" title="Reading Settings">
                <svg className="w-[18px] h-[18px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 18L8.5 5L14 18" /><path d="M5 14H12" /><path d="M15 14C15 12.5 16.2 12 17.5 12C18.8 12 19.5 12.5 19.5 13.8V18" /><path d="M15.5 16.2C15.5 15.2 16.2 14.8 17.5 14.8C18.8 14.8 19.5 15.2 19.5 16.2V18H15.5V16.2Z" />
                </svg>
              </button>

              <button
                onClick={() => {
                  const chapInfo = findCurrentChapterInfo();
                  if (chapInfo) {
                    navigate(`/chapters/${book.id}/${encodeURIComponent(chapInfo.cTitle)}?id=${chapInfo.cId}&postNo=${chapInfo.cPostNo || 1}&lang=${selectedLanguage}`);
                  }
                }}
                className="px-3 py-1.5 rounded-full border border-[rgb(205,92,61)] bg-[rgb(205,92,61)] text-white text-xs font-semibold cursor-pointer transition hover:bg-[#fff9f1] hover:text-[rgb(205,92,61)] shrink-0"
              >
                Continue Reader
              </button>
            </div>
          </header>

          {/* READING AREA */}
          <div className="flex-grow relative flex items-center justify-between px-2 sm:px-14">
            <div className="hidden sm:block absolute left-3 top-1/2 -translate-y-1/2 z-20 select-none">
              <button onClick={goPrev} disabled={currentPageIndex === 0} className={`p-3 rounded-full ${themeClasses.highlightBg} border ${themeClasses.border} text-amber-600 hover:scale-105 active:scale-95 transition disabled:opacity-30 disabled:pointer-events-none cursor-pointer`}>
                <ChevronLeft size={18} />
              </button>
            </div>

            <main className={`w-full ${marginMaxWidthClass} mx-auto flex h-full pt-6 pb-2 overflow-hidden select-text relative`}>
              {isMeasuring && (
                <div
                  ref={measureContainerRef}
                  className="absolute opacity-0 pointer-events-none w-full"
                  style={{ top: 0, left: 0, width: isTwoColumns ? "calc(50% - 2rem)" : "100%" }}
                >
                  {flatBlocks.map((b, i) => renderBlock(b, b.id || i))}
                </div>
              )}

              {!isMeasuring && (
                <div className="w-full h-full flex gap-16" style={{ height: `${contentHeight}px` }}>
                  {activePageLeft.length > 0 && activePageLeft[0].type === "cover" ? (
                    // Center the cover across the whole container
                    <div className="flex-1 flex items-center justify-center h-full w-full">
                      {renderBlock(activePageLeft[0], "cover")}
                    </div>
                  ) : (
                    <>
                      {/* Left Column (or Single Column) */}
                      <div className="flex-1 flex flex-col h-full overflow-hidden">
                        {activePageLeft.length === 0 ? (
                          <div className="h-full flex items-center justify-center">
                            <p className={themeClasses.subText}>No content on this page.</p>
                          </div>
                        ) : (
                          activePageLeft.map((item, idx) => renderBlock(item, `left-${idx}`))
                        )}
                      </div>

                      {/* Right Column */}
                      {isTwoColumns && (
                        <div className="flex-1 flex flex-col h-full overflow-hidden">
                          {activePageRight ? (
                            activePageRight.map((item, idx) => renderBlock(item, `right-${idx}`))
                          ) : (
                            <div className="h-full flex items-center justify-center"></div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </main>

            <div className="hidden sm:block absolute right-3 top-1/2 -translate-y-1/2 z-20 select-none">
              <button onClick={goNext} disabled={currentPageIndex >= pages.length - (isTwoColumns ? 2 : 1)} className={`p-3 rounded-full ${themeClasses.highlightBg} border ${themeClasses.border} shadow-md text-amber-600 hover:scale-105 active:scale-95 transition disabled:opacity-30 disabled:pointer-events-none cursor-pointer`}>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* FOOTER PROGRESS */}
          <footer className={`h-16 ${themeClasses.toolbarBg} px-4 sm:px-6 flex flex-col justify-center items-center gap-1.5 z-30 select-none`}>
            <div className="w-full max-w-lg flex items-center gap-3 sm:gap-4">
              <button onClick={goPrev} disabled={currentPageIndex === 0} className={`sm:hidden p-1 rounded-full ${themeClasses.highlightBg} border ${themeClasses.border} text-amber-600 disabled:opacity-30 disabled:pointer-events-none cursor-pointer`}><ChevronLeft size={16} /></button>
              <input type="range" min="0" max={Math.max(0, pages.length - 1)} step={isTwoColumns ? 2 : 1} value={currentPageIndex} onChange={handleSliderChange} className="flex-grow accent-amber-600 h-1 rounded bg-slate-300 outline-none cursor-pointer" style={{ WebkitAppearance: "none" }} />
              <button onClick={goNext} disabled={currentPageIndex >= pages.length - (isTwoColumns ? 2 : 1)} className={`sm:hidden p-1 rounded-full ${themeClasses.highlightBg} border ${themeClasses.border} text-amber-600 disabled:opacity-30 disabled:pointer-events-none cursor-pointer`}><ChevronRight size={16} /></button>
            </div>
            <div className="w-full max-w-lg flex justify-between items-center text-[10px] sm:text-xs font-semibold tracking-wide">
              <span>
                {isTwoColumns
                  ? `Page ${Math.floor(currentPageIndex / 2) + 1} of ${Math.ceil(pages.length / 2) || 1}`
                  : `Page ${currentPageIndex + 1} of ${pages.length || 1}`}
              </span>
              <span className={themeClasses.subText}>{percentComplete}% Complete</span>
            </div>
          </footer>

          {/* SETTINGS PANEL */}
          {showSettings && (
            <div ref={settingsRef} className={`absolute right-4 top-16 w-80 rounded-2xl shadow-2xl border ${themeClasses.border} ${themeClasses.toolbarBg} z-50 p-5 space-y-5 animate-in fade-in slide-in-from-top-4 duration-200 select-none`}>
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Reading Options</span>
                <button onClick={() => setShowSettings(false)} className={`p-1 rounded hover:${themeClasses.activeItem} transition cursor-pointer`}><X size={14} /></button>
              </div>

              <div className="space-y-2">
                <span className={`text-[10px] uppercase font-bold tracking-wider ${themeClasses.subText}`}>Theme</span>
                <div className="grid grid-cols-3 gap-2">
                  {["light", "sepia", "dark"].map((t) => (
                    <button key={t} onClick={() => setTheme(t)} className={`py-2 text-xs font-bold rounded-lg border capitalize cursor-pointer transition ${theme === t ? "border-amber-600 ring-1 ring-amber-600 bg-amber-500/10" : `${themeClasses.border} hover:${themeClasses.activeItem}`}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className={`text-[10px] uppercase font-bold tracking-wider ${themeClasses.subText}`}>Translation</span>
                <div className="flex flex-col gap-1">
                  <select value={selectedLanguage} onChange={(e) => { setSelectedLanguage(e.target.value); }} className={`px-2 py-1.5 text-xs rounded-lg border ${themeClasses.bg} ${themeClasses.text} ${themeClasses.border} outline-none cursor-pointer`}>
                    {filteredAvailableLanguages.map((lang) => (
                      <option key={lang.code} value={lang.code} className={theme === "dark" ? "bg-[#121212] text-slate-100" : theme === "sepia" ? "bg-[#f4ecd8] text-[#5b4636]" : "bg-white text-slate-900"}>{lang.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <span className={`text-[10px] uppercase font-bold tracking-wider ${themeClasses.subText}`}>Font Size</span>
                <div className="grid grid-cols-4 gap-2">
                  {[{ size: "14", label: "Sm" }, { size: "16", label: "Med" }, { size: "20", label: "Lg" }, { size: "24", label: "XL" }].map((s) => (
                    <button key={s.size} onClick={() => setFontSize(s.size)} className={`py-1.5 text-xs font-bold rounded-lg border cursor-pointer transition ${fontSize === s.size ? "border-amber-600 ring-1 ring-amber-600 bg-amber-500/10" : `${themeClasses.border} hover:${themeClasses.activeItem}`}`}>{s.label}</button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className={`text-[10px] uppercase font-bold tracking-wider ${themeClasses.subText}`}>Spacing</span>
                <div className="grid grid-cols-3 gap-2">
                  {[{ space: "1.4", label: "Compact" }, { space: "1.75", label: "Normal" }, { space: "2.1", label: "Relaxed" }].map((s) => (
                    <button key={s.space} onClick={() => setLineSpacing(s.space)} className={`py-1.5 text-[11px] font-bold rounded-lg border cursor-pointer transition truncate ${lineSpacing === s.space ? "border-amber-600 ring-1 ring-amber-600 bg-amber-500/10" : `${themeClasses.border} hover:${themeClasses.activeItem}`}`}>{s.label}</button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className={`text-[10px] uppercase font-bold tracking-wider ${themeClasses.subText}`}>Margins</span>
                <div className="grid grid-cols-3 gap-2">
                  {["narrow", "normal", "wide"].map((m) => (
                    <button key={m} onClick={() => setMargins(m)} className={`py-1.5 text-[11px] font-bold rounded-lg border capitalize cursor-pointer transition ${margins === m ? "border-amber-600 ring-1 ring-amber-600 bg-amber-500/10" : `${themeClasses.border} hover:${themeClasses.activeItem}`}`}>{m}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TOC PANEL */}
          {showTOC && (
            <div ref={tocRef} className={`absolute right-4 top-16 w-80 max-h-[80vh] overflow-y-auto rounded-2xl border ${themeClasses.border} ${themeClasses.toolbarBg} z-50 p-5 space-y-4 animate-in fade-in slide-in-from-top-4 duration-200 select-none`}>
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Chapters</span>
                <button onClick={() => setShowTOC(false)} className={`p-1 rounded hover:${themeClasses.activeItem} transition cursor-pointer`}><X size={14} /></button>
              </div>
              {titles.length === 0 ? (
                <p className={`text-xs italic py-4 text-center ${themeClasses.subText}`}>No chapters available.</p>
              ) : (
                <nav className="space-y-1">
                  {titles.map((title, idx) => (
                    <button key={title.id} onClick={() => jumpToChapter(title.id)} className={`w-full text-left text-xs py-2 px-3 rounded-lg transition hover:${themeClasses.activeItem} ${themeClasses.subText} hover:${themeClasses.text} truncate block cursor-pointer`}>
                      <span className="font-bold mr-1.5">{idx + 1}.</span>
                      {title.name}
                    </button>
                  ))}
                </nav>
              )}
            </div>
          )}

        </div>
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          setAuthModalOpen(false);
          // Small delay to ensure state updates propagate
          setTimeout(() => executePendingAction(), 100);
        }}
      />
    </div>
  );
}
