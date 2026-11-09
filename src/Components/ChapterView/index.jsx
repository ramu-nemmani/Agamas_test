import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { collection, doc, getDoc, getDocs, orderBy, query, where, setDoc, addDoc } from "firebase/firestore";
import DOMPurify from "dompurify";
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from "react-resizable-panels";
import { ArrowLeft, ArrowRight, Bookmark, Check, Maximize2, X, ChevronDown, List, PanelLeft, PanelRight, Search, Glasses, LibraryBig, ChevronsUpDown, ChevronRight, FileType, FileText, Headphones, Share2, Menu, Play, Pause, RotateCcw, Columns2, Video } from "lucide-react";

import { db, auth } from "../../firebase";
import { useLanguages } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import AuthModal from "../AuthModal";
import ShareModal from "../UI/ShareModal";
import { useSaveProgress } from "../../hooks/useSaveProgress";
import SEO from "../SEO";
import FrontTab from "./FrontTab";
import LanguageTab from "./LanguageTab";
import TranslationTab from "./TranslationTab";
import SourceTab from "./SourceTab";
import ToastMSG from "../UI/ToastMSG";
import SearchOverlay from "../Search/SearchOverlay";
export default function ChapterViewPage({ isFullScreen: globalIsFullScreen, setIsFullScreen: globalSetIsFullScreen }) {
  const { lessonId, chapterId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const lang = searchParams.get("lang") || "EN";
  const navigate = useNavigate();

  const { languages } = useLanguages();
  const langMap = {};
  languages.forEach((item) => {
    const shortKey = item.shortForm;
    if (shortKey) langMap[shortKey] = item.id;
  });

  const [lesson, setLesson] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [currentChapter, setCurrentChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visibleChapterId, setVisibleChapterId] = useState(chapterId);

  // Settings
  const [fontSize, setFontSize] = useState("16");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [markItStatus, setMarkItStatus] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const [showLeftPanel, setShowLeftPanel] = useState(window.innerWidth >= 1024);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const initialTab = searchParams.get("tab") || "Front";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [parallelLang, setParallelLang] = useState(searchParams.get("lang") || "EN");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [targetChapterId, setTargetChapterId] = useState(chapterId);
  const pendingSearchRef = useRef(null);

  const [showFontMenu, setShowFontMenu] = useState(false);
  const [showViewModeMenu, setShowViewModeMenu] = useState(false);
  const [viewDropdownPos, setViewDropdownPos] = useState({ top: 0, right: 0 });
  const viewPortalRef = useRef(null);
  const initialViewMode = searchParams.get("view") || "none";
  const [viewMode, setViewMode] = useState(initialViewMode); // "parallel", "dual", "none"
  const [dualLang1, setDualLang1] = useState(searchParams.get("l1") || "EN");
  const [dualLang2, setDualLang2] = useState(searchParams.get("l2") || (searchParams.get("lang") || "HI"));
  const [showL1Menu, setShowL1Menu] = useState(false);
  const [showL2Menu, setShowL2Menu] = useState(false);
  const l1MenuRef = useRef(null);
  const l2MenuRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isStopScroll, setIsStopScroll] = useState(true);
  const [langMenuPos, setLangMenuPos] = useState({ top: 0, left: 0 });

  const containerRef = useRef(null);
  const langMenuRef = useRef(null);
  const langBtnRef = useRef(null);
  const fontMenuRef = useRef(null);
  const viewModeMenuRef = useRef(null);

  // Auto-scroll in full screen
  useEffect(() => {
    if (!isFullScreen || isStopScroll) return;
    const scrollContainer = document.getElementById("main-scroll-container");
    if (!scrollContainer) return;

    let scrollY = scrollContainer.scrollTop;
    const scrollSpeed = 0.5;
    const interval = 60;
    let scrollInterval = null;
    let delayTimeout = null;

    delayTimeout = setTimeout(() => {
      scrollInterval = setInterval(() => {
        if (
          scrollContainer.scrollTop + scrollContainer.clientHeight >= scrollContainer.scrollHeight ||
          isStopScroll
        ) {
          clearInterval(scrollInterval);
          setIsStopScroll(true);
          return;
        }
        scrollY += scrollSpeed;
        scrollContainer.scrollTop += scrollSpeed;
      }, interval);
    }, 4000); // Wait 4 seconds before starting auto-scroll

    return () => {
      clearTimeout(delayTimeout);
      clearInterval(scrollInterval);
    };
  }, [isFullScreen, isStopScroll]);

  // Synchronize fullscreen state with global state if provided
  useEffect(() => {
    if (globalSetIsFullScreen) {
      globalSetIsFullScreen(isFullScreen);
    }
  }, [isFullScreen, globalSetIsFullScreen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isFullScreen) {
        setIsFullScreen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFullScreen]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target)) {
        setShowLangMenu(false);
      }
      if (fontMenuRef.current && !fontMenuRef.current.contains(event.target)) {
        setShowFontMenu(false);
      }
      const clickedInsideViewBtn = viewModeMenuRef.current?.contains(event.target);
      const clickedInsideViewPortal = viewPortalRef.current?.contains(event.target);
      if (!clickedInsideViewBtn && !clickedInsideViewPortal) {
        setShowViewModeMenu(false);
      }
      if (l1MenuRef.current && !l1MenuRef.current.contains(event.target)) {
        setShowL1Menu(false);
      }
      if (l2MenuRef.current && !l2MenuRef.current.contains(event.target)) {
        setShowL2Menu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [langMenuRef, fontMenuRef, viewModeMenuRef, l1MenuRef, l2MenuRef]);

  const activeChapter = chapters.find(c => c.id === visibleChapterId) || currentChapter;
  const currentLangCode = activeTab === "Language" ? (viewMode === "parallel" ? dualLang1 : parallelLang) : (activeTab === "Source" ? "CN" : lang);
  const currentLangObj = languages.find(l => l.shortForm === currentLangCode);
  const currentLangName = currentLangObj?.name || currentLangCode;

  const currentSaveUrl = `/chapter-view/${lessonId}/${visibleChapterId}?lang=${currentLangCode}&tab=${activeTab}${viewMode !== "none" ? `&view=${viewMode}&l1=${dualLang1}&l2=${dualLang2}` : ""
    }`;

  useSaveProgress({
    bookId: lessonId,
    bookTitle: lesson?.name,
    coverUrl: lesson?.image || null,
    chapterId: visibleChapterId,
    chapterName: activeChapter?.name || (visibleChapterId ? `Chapter ${activeChapter?.position || ''}` : null),
    activeTab,
    selectedLanguage: currentLangCode,
    languageName: currentLangName,
    lastUrl: currentSaveUrl,
    dependencies: [lessonId, visibleChapterId, lang, parallelLang, activeTab, lesson, activeChapter, viewMode, dualLang1, dualLang2]
  });

  // Sync URL query params with state changes
  const updateUrlParams = (newParams) => {
    const params = new URLSearchParams(window.location.search);
    Object.entries(newParams).forEach(([key, val]) => {
      if (val === null || val === undefined || val === "") {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });
    window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
  };

  const handleSelectL1 = (selected) => {
    setDualLang1(selected);
    let nextL2 = dualLang2;
    if (dualLang2 === selected) {
      const alternate = languages.find(
        (l) => {
          const sf = (l.shortForm || '').trim().toUpperCase();
          return sf && sf !== selected;
        }
      );
      nextL2 = alternate ? alternate.shortForm : (selected === "EN" ? "HI" : "EN");
      setDualLang2(nextL2);
    }
    updateUrlParams({ l1: selected, l2: nextL2, view: viewMode });
  };

  const handleSelectL2 = (selected) => {
    setDualLang2(selected);
    let nextL1 = dualLang1;
    if (dualLang1 === selected) {
      const alternate = languages.find(
        (l) => {
          const sf = (l.shortForm || '').trim().toUpperCase();
          return sf && sf !== selected;
        }
      );
      nextL1 = alternate ? alternate.shortForm : (selected === "EN" ? "HI" : "EN");
      setDualLang1(nextL1);
    }
    updateUrlParams({ l1: nextL1, l2: selected, view: viewMode });
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    setActiveTab("Language");
    if (mode === "none") {
      updateUrlParams({ view: null, l1: null, l2: null });
    } else {
      updateUrlParams({ view: mode, l1: dualLang1, l2: dualLang2 });
    }
  };

  useEffect(() => {
    if (chapterId) {
      setVisibleChapterId(chapterId);
    }
  }, [chapterId]);

  // Restrict dual mode on small screens
  useEffect(() => {
    const checkScreenSize = () => {
      if (window.innerWidth < 768 && viewMode === "dual") {
        setViewMode("parallel");
        updateUrlParams({ view: "parallel", l1: dualLang1, l2: dualLang2 });
      }
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, [viewMode, dualLang1, dualLang2]);

  const fontSizes = [
    { label: "12", value: "12" },
    { label: "14", value: "14" },
    { label: "16", value: "16" },
    { label: "18", value: "18" },
    { label: "22", value: "22" },
    { label: "26", value: "26" },
  ];

  const fetchLessonAndChapters = async () => {
    try {
      // 1. Fetch Lesson
      const lessonSnap = await getDoc(doc(db, "lessons", lessonId));
      if (lessonSnap.exists()) {
        setLesson({ id: lessonSnap.id, ...lessonSnap.data() });
      }

      // 2. Fetch Chapters for Previous/Next functionality
      const chapQuery = query(
        collection(db, "chapters"),
        where("lessonId", "==", lessonId),
        orderBy("position")
      );
      const chapSnap = await getDocs(chapQuery);
      const chaps = chapSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setChapters(chaps);

      // Check all used languages across chapters in this book
      const usedLangs = new Set();
      chaps.forEach((c) => {
        if (c.pdfLink) {
          Object.keys(c.pdfLink).forEach((lid) => usedLangs.add(lid));
        }
      });

      if (chaps.length > 0) {
        try {
          const chapIds = chaps.map(c => c.id);
          const postQ = query(
            collection(db, "posts"),
            where("chapterId", "in", chapIds.slice(0, 10))
          );
          const postSnap = await getDocs(postQ);
          postSnap.docs.forEach((d) => {
            const lId = d.data().language;
            if (lId) usedLangs.add(lId);
          });
        } catch (e) {
          // fallback
        }
      }

      if (usedLangs.size > 0 && languages.length > 0) {
        const filteredBookLangs = languages.filter((l) => {
          const sf = (l.shortForm || "").trim().toUpperCase();
          const lId = (l.id || "").toUpperCase();
          for (const uid of usedLangs) {
            const uUpper = String(uid).trim().toUpperCase();
            if (uUpper === sf || uUpper === lId || uid === l.id || uid === langMap[sf]) {
              return true;
            }
          }
          return false;
        });
        setBookAvailableLangs(filteredBookLangs);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Fetch lesson and chapters only when the lesson changes (or on initial load)
  useEffect(() => {
    setLoading(true);
    fetchLessonAndChapters();
  }, [lessonId]);

  // When chapterId or chapters change, update the current chapter and scroll to it smoothly
  useEffect(() => {
    if (chapters.length > 0) {
      const current = chapters.find(c => c.id === chapterId);
      setCurrentChapter(current || null);
      setTargetChapterId(chapterId);

      setTimeout(() => {
        // If search navigation is in progress, skip default chapter top scroll
        if (pendingSearchRef.current) return;

        const el = document.getElementById(`chapter-${chapterId}`);
        const container = document.getElementById('main-scroll-container');
        if (el && container) {
          const elTop = el.getBoundingClientRect().top;
          const containerTop = container.getBoundingClientRect().top;
          container.scrollTop += (elTop - containerTop);
        }
      }, 100);
    }
  }, [chapterId, chapters]);

  const handleMarkIt = async () => {
    const currentUser = auth.currentUser || user;
    if (!currentUser) {
      setPendingAction("mark");
      setAuthModalOpen(true);
      return;
    }
    setMarkItStatus(true);
    try {
      await setDoc(doc(db, "bookmarks", `${currentUser.uid}_${chapterId}`), {
        userId: currentUser.uid,
        chapterId: chapterId,
        chapterName: currentChapter?.name || "",
        lessonId: lessonId,
        lessonName: lesson?.name || "",
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error("Error marking it:", err);
    }
    setTimeout(() => setMarkItStatus(false), 2000);
  };

  const handleDownloadPdf = async () => {
    const currentUser = auth.currentUser || user;
    if (!currentUser) {
      setPendingAction("download");
      setAuthModalOpen(true);
      return;
    }

    const visibleChapter = chapters.find(c => c.id === visibleChapterId) || currentChapter;
    if (!visibleChapter) {
      ToastMSG("error", "Chapter not found.");
      return;
    }

    let targetLangKey = lang;
    if (activeTab === "Translation") {
      targetLangKey = "EN";
    } else if (activeTab === "Language") {
      targetLangKey = parallelLang.includes("-") ? parallelLang : `${parallelLang}-EN`;
      const keysToTry = [];
      if (parallelLang.includes("-")) {
        keysToTry.push(parallelLang);
      } else {
        keysToTry.push(`${parallelLang}-EN`);
        keysToTry.push(`EN-${parallelLang}`);
      }

      for (const key of keysToTry) {
        const id = langMap[key];
        if (id && visibleChapter?.pdfLink?.[id]) {
          targetLangKey = key;
          break;
        }
      }
    } else if (activeTab === "Source") {
      targetLangKey = "CN";
    }

    const langId = langMap[targetLangKey];
    const pdfUrl = visibleChapter?.pdfLink?.[langId];
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');

      const currentUser = auth.currentUser || user;
      if (currentUser) {
        try {
          await addDoc(collection(db, "downloads"), {
            userId: currentUser.uid,
            lessonId: lessonId,
            lessonName: lesson?.name || "",
            chapterId: visibleChapter.id,
            chapterName: visibleChapter?.name || "",
            language: targetLangKey,
            pdfLink: pdfUrl,
            timestamp: new Date().toISOString()
          });
        } catch (err) {
          console.error("Error tracking download:", err);
        }
      }
    } else {
      ToastMSG("error", `PDF not available for this chapter in ${targetLangKey}.`);
    }
  };



  const handleShareClick = () => {
    const currentUser = auth.currentUser || user;
    if (!currentUser) {
      setPendingAction("share");
      setAuthModalOpen(true);
      return;
    }
    setIsShareModalOpen(true);
  };

  const [subChapters, setSubChapters] = useState([]);
  const [loadingSubChapters, setLoadingSubChapters] = useState(false);
  const [chapterAvailableLangs, setChapterAvailableLangs] = useState([]);
  const [bookAvailableLangs, setBookAvailableLangs] = useState([]);
  const isSingleLanguageBook = bookAvailableLangs.length === 1 || (bookAvailableLangs.length === 0 && chapterAvailableLangs.length === 1);

  // Fetch languages that actually have posts for the current chapter
  useEffect(() => {
    const targetCid = chapterId || visibleChapterId;
    if (!targetCid) return;
    const fetchChapterLangs = async () => {
      try {
        const postQuery = query(
          collection(db, "posts"),
          where("chapterId", "==", targetCid)
        );
        const snapshot = await getDocs(postQuery);
        const langIds = new Set();
        snapshot.docs.forEach((d) => {
          const lId = d.data().language;
          if (lId) langIds.add(lId);
        });

        const filtered = languages.filter((l) => {
          const sf = (l.shortForm || "").trim().toUpperCase();
          if (!sf) return false;
          const lId = l.id || "";
          // Check against post languages in this chapter
          for (const pid of langIds) {
            const pUpper = String(pid).trim().toUpperCase();
            if (pUpper === sf || pUpper === lId.toUpperCase() || pid === l.id || pid === langMap[sf]) {
              return true;
            }
          }
          return false;
        });

        setChapterAvailableLangs(filtered);
        if (filtered.length === 1 && activeTab === "Language") {
          setActiveTab("Source");
        }

        // Ensure default parallelLang is set to English if available, or if not yet set
        if (filtered.length > 0) {
          const hasEnglish = filtered.some(l => l.shortForm === "EN");
          const isCurrentLangAvailable = filtered.some(l => l.shortForm === parallelLang);
          if (!parallelLang || !isCurrentLangAvailable) {
            setParallelLang(hasEnglish ? "EN" : filtered[0].shortForm);
          }
        }

        // If current dualLang1 or dualLang2 is not available in this chapter, automatically select available languages
        if (filtered.length > 0) {
          const isL1Available = filtered.some(l => l.shortForm === dualLang1);
          const isL2Available = filtered.some(l => l.shortForm === dualLang2);
          let newL1 = dualLang1;
          let newL2 = dualLang2;

          if (!isL1Available) {
            newL1 = filtered[0].shortForm;
            setDualLang1(newL1);
          }

          if (!isL2Available || newL2 === newL1) {
            const secondLang = filtered.find(l => l.shortForm !== newL1);
            newL2 = secondLang ? secondLang.shortForm : "";
            setDualLang2(newL2);
          }
        }
      } catch (err) {
        console.error("Error fetching chapter languages:", err);
      }
    };
    fetchChapterLangs();
  }, [chapterId, visibleChapterId, languages]);

  // Fetch sub chapters (posts) for the selected chapter in TOC
  const fetchSubChaptersForChapter = async (cid) => {
    if (!cid) return;
    try {
      setLoadingSubChapters(true);

      const getLangId = (code) => {
        if (!code) return null;
        return langMap[code] || langMap[`${code}-EN`] || langMap[`EN-${code}`] || langMap[code.toUpperCase()] || code;
      };

      // In parallel or dual mode with 2 languages selected
      if (activeTab === "Language" && (viewMode === "parallel" || viewMode === "dual") && dualLang1) {
        const l1Id = getLangId(dualLang1);
        const l2Id = dualLang2 && dualLang2 !== dualLang1 ? getLangId(dualLang2) : null;

        const queries = [
          l1Id ? getDocs(query(collection(db, "posts"), where("chapterId", "==", cid), where("language", "==", l1Id), orderBy("position"))) : Promise.resolve({ docs: [] })
        ];
        if (l2Id) {
          queries.push(getDocs(query(collection(db, "posts"), where("chapterId", "==", cid), where("language", "==", l2Id), orderBy("position"))));
        }

        const [snap1, snap2] = await Promise.all(queries);
        const l1Docs = (snap1?.docs || []).map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (a.position || 0) - (b.position || 0));
        const l2Docs = (snap2?.docs || []).map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (a.position || 0) - (b.position || 0));

        const maxLen = Math.max(l1Docs.length, l2Docs.length);
        const paired = [];
        for (let i = 0; i < maxLen; i++) {
          const p1 = l1Docs[i];
          const p2 = l2Docs[i];
          paired.push({
            id: p1?.id || p2?.id,
            p1Id: p1?.id,
            p2Id: p2?.id,
            titleL1: p1?.post_title || "",
            titleL2: p2?.post_title || "",
            lang1: dualLang1,
            lang2: dualLang2,
            position: p1?.position ?? p2?.position ?? (i + 1),
            post_title: p1?.post_title || p2?.post_title || "",
          });
        }
        setSubChapters(paired);
        return;
      }

      // Single language mode or Source/Translation/Front
      let targetLangId = null;
      if (activeTab === "Source") {
        targetLangId = langMap["CN"];
      } else if (activeTab === "Translation" || activeTab === "Front") {
        targetLangId = langMap["EN"] || langMap[lang];
      } else {
        const activeLangCode = viewMode === "parallel" ? dualLang1 : parallelLang;
        targetLangId = getLangId(activeLangCode) || langMap[lang] || langMap["EN"];
      }

      let postQuery;
      if (targetLangId) {
        postQuery = query(
          collection(db, "posts"),
          where("chapterId", "==", cid),
          where("language", "==", targetLangId),
          orderBy("position")
        );
      } else {
        postQuery = query(
          collection(db, "posts"),
          where("chapterId", "==", cid),
          orderBy("position")
        );
      }

      let snapshot = await getDocs(postQuery);
      if (snapshot.empty && targetLangId) {
        const fallbackQuery = query(
          collection(db, "posts"),
          where("chapterId", "==", cid),
          orderBy("position")
        );
        snapshot = await getDocs(fallbackQuery);
      }

      const posts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      posts.sort((a, b) => (a.position || 0) - (b.position || 0));

      setSubChapters(posts);
    } catch (err) {
      console.error("Error fetching sub chapters:", err);
    } finally {
      setLoadingSubChapters(false);
    }
  };

  // Automatically fetch sub chapters when chapterId, activeTab, parallelLang, or lang change
  useEffect(() => {
    if (chapterId) {
      fetchSubChaptersForChapter(chapterId);
    }
  }, [chapterId, activeTab, parallelLang, dualLang1, dualLang2, viewMode, lang, languages]);

  const scrollToPost = (postId) => {
    if (activeTab === "Front") {
      setActiveTab(isSingleLanguageBook ? "Source" : "Language");
    }
    const container = document.getElementById('main-scroll-container');
    let attempts = 0;
    const maxAttempts = 60;
    const interval = setInterval(() => {
      attempts++;
      const el = document.getElementById(`post-${postId}`);
      const cont = container || document.getElementById('main-scroll-container');
      if (el && cont) {
        clearInterval(interval);
        const elTop = el.getBoundingClientRect().top;
        const contTop = cont.getBoundingClientRect().top;
        cont.scrollTop += (elTop - contTop - 70);
      } else if (attempts >= maxAttempts) {
        clearInterval(interval);
      }
    }, 50);
  };
  const cjkRegex = /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/;
  const langNamesList = [
    'English', 'Chinese', 'Sanskrit', 'Tibetan', 'Hindi', 'Pali', 'Tamil', 'Telugu',
    'Japanese', 'Korean', 'French', 'German', 'Spanish', 'Vietnamese', 'Burmese', 'Thai',
    'EN', 'CN', 'SA', 'TI', 'HI', 'PA', 'TA', 'TE', 'JA', 'KO', 'FR', 'DE', 'ES'
  ];

  const cleanPostTitle = (title) => {
    if (!title) return '';
    const langPattern = langNamesList.join('|');
    let cleaned = title.replace(new RegExp(`\\s*[/\\|·•-]\\s*(${langPattern})\\s*$`, 'i'), '');
    cleaned = cleaned.replace(new RegExp(`\\s*[\\(\\[]\\s*(${langPattern})\\s*[\\)\\]]\\s*$`, 'i'), '');
    cleaned = cleaned.replace(new RegExp(`\\s+(${langPattern})\\s*$`, 'i'), '');
    return cleaned.trim();
  };

  const formatPostTitleForToc = (rawTitle, langCode) => {
    if (!rawTitle) return '';
    const isEn = langCode === 'EN' || langCode === 'english';

    // If English post has Chinese characters, isolate non-CJK part
    if (isEn && cjkRegex.test(rawTitle)) {
      if (rawTitle.includes(':') || rawTitle.includes('：')) {
        const parts = rawTitle.split(/[:：]/).map(p => p.trim()).filter(Boolean);
        const nonCjk = parts.filter(p => !cjkRegex.test(p));
        if (nonCjk.length > 0) {
          return cleanPostTitle(nonCjk.join(': '));
        }
      }
      const stripped = rawTitle
        .replace(/[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]+/g, '')
        .replace(/[:：\s-]+$/, '')
        .replace(/^[:：\s-]+/, '')
        .replace(/\s{2,}/g, ' ')
        .trim();
      if (stripped) return cleanPostTitle(stripped);
    }

    return cleanPostTitle(rawTitle);
  };

  const getChapterTitlesForToc = (rawName) => {
    if (!rawName) return { titleL1: '', titleL2: '' };
    const parts = rawName.split(/[:：]/).map(p => p.trim()).filter(Boolean);
    const cjkParts = parts.filter(p => cjkRegex.test(p));
    const nonCjkParts = parts.filter(p => !cjkRegex.test(p));

    const enFull = (nonCjkParts.join(': ').replace(/^Chapter\s+([0-9]+|[a-zA-Z]+):\s*/i, '').trim()) || rawName;
    const cnFull = cjkParts.join(': ').trim() || rawName;

    if (activeTab === "Language" && (viewMode === "parallel" || viewMode === "dual")) {
      const isL1Chinese = dualLang1 === "CN" || dualLang1 === "chinese";
      const isL2Chinese = dualLang2 === "CN" || dualLang2 === "chinese";

      const t1 = isL1Chinese ? cnFull : enFull;
      const t2 = isL2Chinese ? cnFull : (dualLang2 ? enFull : "");

      return { titleL1: t1, titleL2: t2 !== t1 ? t2 : "" };
    }

    if (activeTab === "Source" || parallelLang === "CN" || parallelLang === "chinese") {
      return { titleL1: cnFull || enFull, titleL2: "" };
    }

    return { titleL1: enFull, titleL2: "" };
  };
  const selectedChapter = chapters.find(c => c.id === chapterId) || currentChapter;
  const currentChapterIndex = chapters.findIndex(c => c.id === chapterId);
  const prevChapter = currentChapterIndex > 0 ? chapters[currentChapterIndex - 1] : null;
  const nextChapter = currentChapterIndex < chapters.length - 1 ? chapters[currentChapterIndex + 1] : null;

  const handleSearchResultClick = (result) => {
    // If post belongs to another language, switch tab or parallelLang
    const postLangId = result.post?.language;
    if (postLangId) {
      const matchedLang = languages.find(l => l.id === postLangId);
      if (matchedLang) {
        const shortForm = matchedLang.shortForm;
        if (shortForm === "EN") {
          setActiveTab("Translation");
        } else if (shortForm === "CN") {
          setActiveTab("Source");
        } else {
          setActiveTab("Language");
          setParallelLang(shortForm);
        }
      }
    }

    // Force target chapter to load immediately
    setTargetChapterId(result.chapterId);
    pendingSearchRef.current = result.post.id;

    // navigate to chapter if different
    if (result.chapterId !== chapterId) {
      navigate(`/chapter-view/${lessonId}/${result.chapterId}?lang=${lang}`);
    }

    setIsSearchOpen(false);

    // Helper to highlight only the searched text in text nodes
    const highlightWordInElement = (element, query, isRegex) => {
      if (!element || !query) return null;

      // Clear any prior search highlights
      document.querySelectorAll(".search-matched-word").forEach((mark) => {
        const parent = mark.parentNode;
        if (parent) {
          parent.replaceChild(document.createTextNode(mark.textContent), mark);
          parent.normalize();
        }
      });

      let regex;
      try {
        if (isRegex) {
          regex = new RegExp(query, "gi");
        } else {
          const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          regex = new RegExp(escaped, "gi");
        }
      } catch {
        return null;
      }

      // Collect all text nodes
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
      const textNodes = [];
      let currentNode;
      while ((currentNode = walker.nextNode())) {
        if (currentNode.nodeValue && currentNode.nodeValue.trim().length > 0) {
          regex.lastIndex = 0;
          if (regex.test(currentNode.nodeValue)) {
            textNodes.push(currentNode);
          }
        }
      }

      let firstMark = null;
      textNodes.forEach((node) => {
        const parent = node.parentNode;
        if (!parent || parent.nodeName === "SCRIPT" || parent.nodeName === "STYLE") return;

        regex.lastIndex = 0;
        const text = node.nodeValue;
        const matches = [...text.matchAll(regex)];
        if (matches.length === 0) return;

        const fragment = document.createDocumentFragment();
        let lastIdx = 0;

        matches.forEach((m) => {
          const matchIdx = m.index;
          const matchStr = m[0];

          if (matchIdx > lastIdx) {
            fragment.appendChild(document.createTextNode(text.substring(lastIdx, matchIdx)));
          }

          const mark = document.createElement("mark");
          mark.className = "search-matched-word";
          mark.textContent = matchStr;
          fragment.appendChild(mark);

          if (!firstMark) {
            firstMark = mark;
          }

          lastIdx = matchIdx + matchStr.length;
        });

        if (lastIdx < text.length) {
          fragment.appendChild(document.createTextNode(text.substring(lastIdx)));
        }

        parent.replaceChild(fragment, node);
      });

      return firstMark;
    };

    // Scroll directly to the found post
    const executeDirectScroll = () => {
      let attempts = 0;
      const maxAttempts = 120; // 3.6 seconds max wait to accommodate mobile Firestore latency
      const scrollInterval = setInterval(() => {
        attempts++;
        const el = document.getElementById(`post-${result.post.id}`);
        const container = document.getElementById("main-scroll-container");

        // Ensure post element is rendered and has actual text content
        const hasContent = el && (el.innerText || el.textContent || "").trim().length > 0;

        if (el && container && hasContent) {
          clearInterval(scrollInterval);
          pendingSearchRef.current = null;

          // Highlight the searched word inside the targeted post
          const firstMark = highlightWordInElement(el, result.searchQuery, result.isRegex);

          const targetEl = firstMark || el;
          const targetRect = targetEl.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();

          const offsetTop = targetRect.top - containerRect.top + container.scrollTop - 70;
          container.scrollTop = Math.max(0, offsetTop);

          // Multiple re-checks after mobile browser reflow & fonts settle
          [60, 180, 350].forEach((delay) => {
            setTimeout(() => {
              // If mark wasn't created initially, try highlighting again once fonts/elements settle
              let currentTarget = firstMark;
              if (!currentTarget || !document.body.contains(currentTarget)) {
                currentTarget = highlightWordInElement(el, result.searchQuery, result.isRegex) || el;
              }
              const reTargetRect = currentTarget.getBoundingClientRect();
              const reContainerRect = container.getBoundingClientRect();
              if (Math.abs(reTargetRect.top - reContainerRect.top - 70) > 25) {
                container.scrollTop = Math.max(0, reTargetRect.top - reContainerRect.top + container.scrollTop - 70);
              }
            }, delay);
          });
        } else if (attempts >= maxAttempts) {
          clearInterval(scrollInterval);
          pendingSearchRef.current = null;
          // Fallback attempt to highlight if element exists even without detected content
          if (el) {
            highlightWordInElement(el, result.searchQuery, result.isRegex);
          }
        }
      }, 30);
    };

    executeDirectScroll();
  };

  if (loading) {
    return (
      <div className="w-full min-h-[calc(100vh-200px)] bg-[#fdf8f4] flex flex-col items-center justify-center font-sans">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#cd5c3d] border-t-transparent"></div>
        <p className="mt-4 text-[#001e2d] font-medium">Loading...</p>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden flex flex-col ${isFullScreen ? "fixed inset-0 h-screen z-[100] bg-white" : "h-[calc(100vh)] bg-[#f0f4f6]"}`} ref={containerRef}>
      <SEO
        title={`${currentChapter?.name || 'Chapter View'} - ${lesson?.name || 'Agamas'}`}
        description={`Read ${currentChapter?.name} from ${lesson?.name}`}
      />

      {/* Breadcrumb Bar */}
      {!isFullScreen && (
        <div className="sticky top-0 z-40 w-full bg-[#cd5c3d]">
          <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-[1336px]">
            <div className="hidden lg:flex items-center justify-between gap-3 py-2 min-h-[40px]">

              {/* Breadcrumbs */}
              <div className="flex-1 min-w-0 flex items-center">
                <nav aria-label="Breadcrumb" className="m-0 p-0">
                  <ol className="inline-flex flex-wrap items-center text-sm m-0 p-0 list-none text-white gap-0.5">
                    <li className="inline-flex items-center flex-none">
                      <Link to="/#chapters" className="hover:opacity-80 transition-colors whitespace-nowrap text-sm text-inherit">Reading Room</Link>
                    </li>
                    <li className="inline-flex items-center flex-none text-inherit gap-0.5">
                      <ChevronRight className="w-3.5 h-3.5 text-inherit" />
                      <span className="font-medium truncate text-sm text-inherit">{lesson?.name}</span>
                    </li>
                  </ol>
                </nav>
              </div>

              {/* Action Icons */}
              <div className="flex-shrink-0 flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="relative flex group items-center justify-center">
                    <button onClick={handleDownloadPdf} className="inline-flex items-center justify-center h-8 w-8 rounded-sm text-white hover:text-white hover:bg-white/10 transition-colors">
                      <FileType className="w-5 h-5" />
                    </button>
                    <span className="absolute top-full mt-5 left-1/2 -translate-x-1/2 bg-[rgb(184,80,58)] text-white text-[13px] py-1.5 px-3 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 font-sans">
                      Download PDF
                    </span>
                  </div>


                  <div className="relative flex group items-center justify-center">
                    <button onClick={handleShareClick} className="inline-flex items-center justify-center h-8 w-8 rounded-sm text-white hover:text-white hover:bg-white/10 transition-colors">
                      <Share2 className="w-5 h-5" />
                    </button>
                    <span className="absolute top-full mt-5 right-0 bg-[rgb(184,80,58)] text-white text-[13px] py-1.5 px-3 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 font-sans">
                      Share translation
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Mobile View */}
            <div className="lg:hidden flex flex-col">
              <div className="flex items-center justify-between gap-2 py-2.5">
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="flex items-center justify-center text-white hover:bg-white/10 rounded p-2 transition-colors">
                  <Menu className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-1">
                  <div className="relative flex group items-center justify-center">
                    <button onClick={handleDownloadPdf} className="inline-flex items-center justify-center h-8 w-8 rounded-sm text-white hover:text-white hover:bg-white/10 transition-colors">
                      <FileType className="w-5 h-5" />
                    </button>
                    <span className="absolute top-full mt-5 left-1/2 -translate-x-1/2 bg-[rgb(184,80,58)] text-white text-[13px] py-1.5 px-3 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 font-sans">
                      Download PDF
                    </span>
                  </div>


                  <div className="relative flex group items-center justify-center">
                    <button onClick={handleShareClick} className="inline-flex items-center justify-center h-8 w-8 rounded-sm text-white hover:text-white hover:bg-white/10 transition-colors">
                      <Share2 className="w-5 h-5" />
                    </button>
                    <span className="absolute top-full mt-5 right-0 bg-[rgb(184,80,58)] text-white text-[13px] py-1.5 px-3 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 font-sans">
                      Share translation
                    </span>
                  </div>
                </div>
              </div>

              {/* Mobile Breadcrumb Dropdown */}
              {mobileMenuOpen && (
                <div className="pb-3 px-2 border-t border-white/20 mt-1 pt-3 animate-in fade-in slide-in-from-top-2">
                  <nav aria-label="Breadcrumb" className="m-0 p-0">
                    <ol className="flex flex-wrap items-center text-sm m-0 p-0 list-none text-white gap-1.5">
                      <li className="flex items-center flex-none">
                        <Link to="/#chapters" className="hover:opacity-80 transition-colors whitespace-nowrap text-[13px] font-medium text-white/90">Reading Room</Link>
                      </li>
                      <li className="flex items-center flex-none text-white gap-1.5">
                        <ChevronRight className="w-4 h-4 text-white/70" />
                        <span className="font-medium truncate text-[13px] text-white">{lesson?.name}</span>
                      </li>
                    </ol>
                  </nav>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Mobile TOC Drawer */}
      {!isFullScreen && showLeftPanel && (
        <div className="lg:hidden fixed inset-0 z-[150] flex">
          {/* Overlay */}
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowLeftPanel(false)}></div>
          {/* Drawer */}
          <div className="relative flex w-full max-w-xs flex-col bg-white shadow-xl h-full overflow-hidden animate-in slide-in-from-left-full">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <span className="font-normal text-[#001e2d] text-sm uppercase">Table of Contents</span>
              <button onClick={() => setShowLeftPanel(false)} className="p-2 -mr-2 text-gray-500 hover:text-gray-800 rounded-md">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-2 py-4">
              {/* TOC Header */}
              <div className="w-full py-2 text-sm text-[#555] flex gap-2 mb-4 px-2">
                <div className="my-auto text-[#cd5c3d]"><LibraryBig className="w-5 h-5 stroke-1" /></div>
                <span className="my-auto font-light text-[#001e2d]">{lesson?.name}</span>
              </div>

              <div className="h-[1px] w-full bg-gray-200 my-4"></div>

              {/* Chapter List - Showing sub chapters of the selected chapter */}
              {selectedChapter && (
                <div className="mb-4">
                  <div
                    className="w-full py-2.5 px-3 text-left text-sm rounded-md bg-[#fdf3ec] text-[#cd5c3d] font-semibold flex items-center gap-2.5"
                    style={{
                      fontFamily: '"Noto Serif", "Noto Serif Fallback", serif'
                    }}
                  >
                    <span className="shrink-0 text-xs">
                      {selectedChapter.position ? selectedChapter.position.toString().padStart(2, '0') : ''}.
                    </span>
                    <span className="leading-snug">
                    <div className="flex flex-col gap-0.5 leading-snug">
                      {(() => {
                        const { titleL1, titleL2 } = getChapterTitlesForToc(selectedChapter.name);
                        return (
                          <>
                            <span className="font-normal">{titleL1}</span>
                            {titleL2 && titleL2 !== titleL1 && (
                              <span className="text-[11px] opacity-80 font-normal">{titleL2}</span>
                            )}
                          </>
                        );
                      })()}
                    </div>
                    </span>
                  </div>

                  {/* Sub Chapters list of selected chapter */}
                  <div className="mt-2 space-y-1">
                    {loadingSubChapters ? (
                      <div className="py-4 text-xs text-gray-400 flex items-center justify-center gap-2">
                        <div className="w-3.5 h-3.5 border-2 border-[#cd5c3d] border-t-transparent rounded-full animate-spin"></div>
                        <span>Loading sub chapters...</span>
                      </div>
                    ) : subChapters.length > 0 ? (
                      subChapters.map((post, pIdx) => (
                        <button
                          key={post.id}
                          onClick={() => {
                            scrollToPost(post.id);
                            setShowLeftPanel(false);
                          }}
                          className="w-full text-left py-2 px-3 text-xs text-[#2c2c2c] hover:text-[#cd5c3d] hover:bg-gray-50 rounded-md transition-colors flex items-start gap-2.5 border-b border-gray-50 last:border-b-0"
                          style={{
                            fontFamily: '"Noto Serif", "Noto Serif Fallback", serif'
                          }}
                        >
                          <div className="flex flex-col gap-0.5 leading-snug">
                            {post.titleL1 || post.titleL2 ? (
                              <>
                                {post.titleL1 && (
                                  <span className="line-clamp-2 font-normal text-[#2c2c2c]">
                                    {formatPostTitleForToc(post.titleL1, post.lang1 || dualLang1) || `Section ${post.position || pIdx + 1}`}
                                  </span>
                                )}
                                {post.titleL2 && post.titleL2 !== post.titleL1 && (
                                  <span className="line-clamp-2 text-[11px] text-[#777] font-normal">
                                    {formatPostTitleForToc(post.titleL2, post.lang2 || dualLang2)}
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="line-clamp-2">
                                {formatPostTitleForToc(post.post_title, currentLangCode) || `Section ${post.position || pIdx + 1}`}
                              </span>
                            )}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="py-3 px-3 text-xs text-gray-400 italic">
                        No sub chapters found for this chapter
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Full Screen Banner */}
      {!isFullScreen && (
        <div className="sticky z-30 w-full flex justify-center bg-[#f0f4f6]">
          <div className="w-full max-w-[1336px] bg-[#f0f4f6]">
            <button
              onClick={() => setIsFullScreen(true)}
              className="w-full flex items-center justify-center gap-2 py-1.5 text-xs text-[#155370]/70 cursor-pointer group"
            >
              <ChevronsUpDown className="w-3.5 h-3.5 text-[#155370]/70 group-hover:text-[#155370] transition-colors" />
              <span className="font-medium group-hover:text-[#155370] transition-colors">Full Screen</span>
            </button>
          </div>
        </div>
      )}

      <div className={`flex flex-1 min-h-0 w-full mx-auto max-w-[1336px] ${isFullScreen ? "" : "px-0 pb-0 lg:px-2 lg:pb-4 pt-0 bg-[#f0f4f6]"}`}>
        <div className={`flex h-full w-full overflow-hidden ${isFullScreen ? "bg-white" : ""}`}>
          <PanelGroup orientation="horizontal" id="agamas-reader-panels">

            {/* LEFT PANEL */}
            {showLeftPanel && !isFullScreen && (
              <>
                <Panel defaultSize="20%" minSize="15%" maxSize="40%" className="hidden md:flex flex-col bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="flex flex-col h-full w-full">
                    <div className="w-full border-b border-gray-200 h-12 flex items-stretch justify-center">
                      <div className="text-[15px] text-[#555] font-medium tracking-wide border-b-2 border-[#cd5c3d] -mb-[1px] px-2 flex items-center justify-center">
                        Table of Contents
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto bg-white pt-2">
                      <div className="px-2 pb-16 max-w-sm mx-auto">
                        {/* TOC Header */}
                        <div className="w-full py-2 text-sm text-[#555] flex gap-2 mt-4 px-2">
                          <div className="my-auto text-[#cd5c3d]"><LibraryBig className="w-5 h-5 stroke-1" /></div>
                          <span className="my-auto font-light text-[#001e2d]">{lesson?.name}</span>
                        </div>

                        <div className="h-[1px] w-full bg-gray-200 my-4"></div>

                        {/* Chapter List - Showing sub chapters of the selected chapter */}
                        {selectedChapter && (
                          <div className="mb-4">
                            <div
                              className="w-full py-2.5 px-3 text-left text-sm rounded-md bg-[#fdf3ec] text-[#cd5c3d] font-semibold flex items-center gap-2.5"
                              style={{
                                fontFamily: '"Noto Serif", "Noto Serif Fallback", serif',
                                fontStyle: 'normal',
                                fontVariantCaps: 'normal',
                                fontVariantEastAsian: 'normal',
                                fontVariantLigatures: 'none',
                                fontVariantNumeric: 'normal'
                              }}
                            >
                              <span className="shrink-0 text-xs">
                                {selectedChapter.position ? selectedChapter.position.toString().padStart(2, '0') : ''}.
                              </span>
                              <span className="leading-snug">
                              <div className="flex flex-col gap-0.5 leading-snug">
                                {(() => {
                                  const { titleL1, titleL2 } = getChapterTitlesForToc(selectedChapter.name);
                                  return (
                                    <>
                                      <span className="font-normal">{titleL1}</span>
                                      {titleL2 && titleL2 !== titleL1 && (
                                        <span className="text-[11px] opacity-80 font-normal">{titleL2}</span>
                                      )}
                                    </>
                                  );
                                })()}
                              </div>
                              </span>
                            </div>

                            {/* Sub Chapters list of selected chapter */}
                            <div className="mt-2 space-y-1">
                              {loadingSubChapters ? (
                                <div className="py-4 text-xs text-gray-400 flex items-center justify-center gap-2">
                                  <div className="w-3.5 h-3.5 border-2 border-[#cd5c3d] border-t-transparent rounded-full animate-spin"></div>
                                  <span>Loading sub chapters...</span>
                                </div>
                              ) : subChapters.length > 0 ? (
                                subChapters.map((post, pIdx) => (
                                  <button
                                    key={post.id}
                                    onClick={() => {
                                      scrollToPost(post.id);
                                    }}
                                    className="w-full text-left py-2 px-3 text-xs text-[#2c2c2c] hover:text-[#cd5c3d] hover:bg-gray-50 rounded-md transition-colors flex items-start gap-2.5 border-b border-gray-50 last:border-b-0 cursor-pointer"
                                    style={{
                                      fontFamily: '"Noto Serif", "Noto Serif Fallback", serif'
                                    }}
                                  >
                                    <div className="flex flex-col gap-0.5 leading-snug">
                                      {post.titleL1 || post.titleL2 ? (
                                        <>
                                          {post.titleL1 && (
                                            <span className="line-clamp-2 font-normal text-[#2c2c2c]">
                                              {formatPostTitleForToc(post.titleL1, post.lang1 || dualLang1) || `Section ${post.position || pIdx + 1}`}
                                            </span>
                                          )}
                                          {post.titleL2 && post.titleL2 !== post.titleL1 && (
                                            <span className="line-clamp-2 text-[11px] text-[#777] font-normal">
                                              {formatPostTitleForToc(post.titleL2, post.lang2 || dualLang2)}
                                            </span>
                                          )}
                                        </>
                                      ) : (
                                        <span className="line-clamp-2">
                                          {formatPostTitleForToc(post.post_title, currentLangCode) || `Section ${post.position || pIdx + 1}`}
                                        </span>
                                      )}
                                    </div>
                                  </button>
                                ))
                              ) : (
                                <div className="py-3 px-3 text-xs text-gray-400 italic">
                                  No sub chapters found for this chapter
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Panel>
                <PanelResizeHandle className="hidden lg:flex w-2 relative items-center justify-center bg-transparent transition-colors cursor-col-resize hover:bg-black/5 rounded-md text-gray-400">
                  <div className="flex h-full items-center justify-center">
                    <div className="flex flex-col items-center justify-center space-y-2 mt-16">
                      <span className="block w-1 h-1 rounded-full bg-current"></span>
                      <span className="block w-1 h-1 rounded-full bg-current"></span>
                      <span className="block w-1 h-1 rounded-full bg-current"></span>
                    </div>
                  </div>
                </PanelResizeHandle>
              </>
            )}

            {/* MAIN CONTENT PANEL */}
            <Panel className={`flex flex-col h-full bg-white relative ${isFullScreen ? "" : "lg:border lg:border-gray-200 lg:rounded-xl lg:shadow-sm overflow-hidden"}`}>
              {/* Sticky Toolbar */}
              {!isFullScreen && (
                <div className="sticky top-0 w-full flex items-stretch justify-between px-1 sm:px-4 bg-white z-20 h-12 border-b border-gray-200">
                  <div className="flex shrink-0 w-auto lg:w-[110px] items-center">
                    <button
                      onClick={() => setShowLeftPanel(!showLeftPanel)}
                      className="p-2 text-gray-500 hover:text-gray-800 rounded-md hover:bg-gray-100 transition-colors"
                      title="Toggle Table of Contents"
                    >
                      <PanelLeft className="w-5 h-5 stroke-1" />
                    </button>
                  </div>

                  <div className="flex-1 min-w-0 overflow-x-auto tabs-mobile-scroll sm:overflow-visible mx-1 h-full">
                    <div className="flex items-stretch sm:justify-center gap-2 sm:gap-4 px-1 sm:px-2 flex-nowrap w-max sm:w-full min-w-full h-full">
                      <button
                        onClick={() => {
                          setActiveTab("Front");
                        }}
                        className={`inline-flex items-center justify-center whitespace-nowrap px-2.5 sm:px-3 text-xs sm:text-sm transition-all border-b-2 -mb-[1px] h-full shrink-0 ${activeTab === "Front"
                          ? "font-semibold text-[#cd5c3d] border-[#cd5c3d]"
                          : "text-gray-500 hover:text-gray-800 hover:border-gray-200 border-transparent"
                          }`}
                      >
                        Front
                      </button>

                      {/* Language Dropdown Tab */}
                      {!isSingleLanguageBook && (
                      <div className="relative inline-flex items-stretch h-full shrink-0" ref={langMenuRef}>
                        <button
                          ref={langBtnRef}
                          onClick={() => {
                            setActiveTab("Language");
                            // Default to English if no language is selected or if parallelLang is not English
                            if (!parallelLang || parallelLang === "CN" || parallelLang === "CN-EN") {
                              const hasEn = chapterAvailableLangs.some(l => l.shortForm === "EN");
                              if (hasEn) setParallelLang("EN");
                            }
                            if (!showLangMenu && langBtnRef.current) {
                              const rect = langBtnRef.current.getBoundingClientRect();
                              setLangMenuPos({
                                top: rect.bottom + 4,
                                left: Math.max(8, Math.min(rect.left + rect.width / 2 - 88, window.innerWidth - 184))
                              });
                            }
                            setShowLangMenu(!showLangMenu);
                          }}
                          className={`inline-flex items-center justify-center whitespace-nowrap px-2.5 sm:px-3 text-xs sm:text-sm transition-all border-b-2 -mb-[1px] h-full cursor-pointer shrink-0 ${activeTab === "Language"
                            ? "font-semibold text-[#cd5c3d] border-[#cd5c3d]"
                            : "text-gray-500 hover:text-gray-800 hover:border-gray-200 border-transparent"
                            }`}
                        >
                          Language <ChevronDown className={`ml-1 w-3 h-3 transition-transform duration-200 ${showLangMenu ? "rotate-180" : ""}`} />
                        </button>
                        {showLangMenu && (
                          <div
                            style={typeof window !== 'undefined' && window.innerWidth < 640 ? { top: `${langMenuPos.top}px`, left: `${langMenuPos.left}px` } : undefined}
                            className="fixed sm:absolute sm:top-full sm:left-0 sm:translate-x-0 mt-0 sm:mt-1 w-44 sm:w-52 bg-white border border-gray-200 rounded-lg z-50"
                          >
                            <div className="py-1 flex flex-col">
                              {chapterAvailableLangs.map((l) => (
                                <button
                                  key={l.id}
                                  onClick={() => {
                                      setParallelLang(l.shortForm);
                                      setViewMode("none");
                                      setActiveTab("Language");
                                      setShowLangMenu(false);
                                      updateUrlParams({ view: null, l1: null, l2: null, lang: l.shortForm });
                                    }}
                                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${(viewMode === "none" && parallelLang === l.shortForm) ? "font-normal text-[#cd5c3d] bg-[#fdf3ec] cursor-pointer" : "font-normal text-gray-700 hover:bg-gray-50 hover:text-[#cd5c3d] cursor-pointer"}`}
                                  >
                                  {l.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      )}

                      <button
                        onClick={() => {
                          setActiveTab("Source");
                        }}
                        className={`inline-flex items-center justify-center whitespace-nowrap px-2.5 sm:px-3 text-xs sm:text-sm transition-all border-b-2 -mb-[1px] h-full shrink-0 ${activeTab === "Source"
                          ? "font-semibold text-[#cd5c3d] border-[#cd5c3d]"
                          : "text-gray-500 hover:text-gray-800 hover:border-gray-200 border-transparent"
                          }`}
                      >
                        Source (Original)
                      </button>

                      {/* Divider line beside Source (Original) */}
                      {!isSingleLanguageBook && (
                      <div className="flex items-center h-full px-1 shrink-0 select-none">
                        <div className="h-4 w-[1px] bg-gray-200"></div>
                      </div>

                      )}
                      {/* View Mode Dropdown */}
                      {!isSingleLanguageBook && (
                      <div className="relative inline-flex items-center h-full shrink-0" ref={viewModeMenuRef}>
                        <button
                          onClick={() => {
                            if (!showViewModeMenu && viewModeMenuRef.current) {
                                const rect = viewModeMenuRef.current.getBoundingClientRect();
                                const menuWidth = 192;
                                const rightPos = Math.max(8, Math.min(window.innerWidth - rect.right, window.innerWidth - menuWidth - 8));
                                setViewDropdownPos({
                                  top: rect.bottom + 6,
                                  right: rightPos,
                                });
                            }
                            setShowViewModeMenu(!showViewModeMenu);
                          }}
                          className="flex items-center gap-1 px-2 py-1.5 text-xs sm:text-sm font-medium text-gray-600 rounded-md border border-gray-200 bg-white transition-colors cursor-pointer"
                        >
                          <Columns2 className="w-3.5 h-3.5 text-gray-500" />
                          <span>View: <span className="capitalize">{viewMode}</span></span>
                          <ChevronDown className={`w-3 h-3 text-gray-500 transition-transform duration-200 ${showViewModeMenu ? "rotate-180" : ""}`} />
                        </button>
                        {showViewModeMenu && typeof document !== "undefined" && createPortal(
                          <div
                            ref={viewPortalRef}
                            style={{
                              position: "fixed",
                              top: `${viewDropdownPos.top}px`,
                              right: `${Math.max(8, viewDropdownPos.right)}px`,
                              zIndex: 9999,
                            }}
                            className="w-48 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100"
                          >
                            <div className="px-3.5 pt-3 pb-2 border-b border-gray-100 text-[11px] font-normal text-gray-400 uppercase tracking-wider font-sans">
                              VIEW MODE
                            </div>
                            <div className="py-1 flex flex-col">
                              {[
                                { label: "Parallel", sublabel: "One by one (stacked)", value: "parallel", desktopOnly: false },
                                { label: "Dual", sublabel: "Side by side", value: "dual", desktopOnly: true },
                              ].map((mode) => (
                                <button
                                  key={mode.value}
                                  onClick={() => {
                                    handleViewModeChange(mode.value);
                                    setShowViewModeMenu(false);
                                  }}
                                  className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between transition-colors hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${mode.desktopOnly ? "hidden md:flex" : "flex"} ${
                                    viewMode === mode.value
                                      ? "text-[#cd5c3d] font-normal bg-[#fdf3ec]"
                                      : "text-gray-700"
                                  }`}
                                >
                                  <div className="flex flex-col">
                                    <span className={`text-sm leading-tight ${viewMode === mode.value ? "font-normal text-[#cd5c3d]" : "font-normal text-gray-800"}`}>{mode.label}</span>
                                    <span className="text-xs mt-0.5 leading-tight text-gray-400 whitespace-nowrap">
                                      {mode.sublabel}
                                    </span>
                                  </div>
                                  {viewMode === mode.value && <Check className="w-4 h-4 text-[#cd5c3d] shrink-0 ml-2" />}
                                </button>
                              ))}
                            </div>
                          </div>,
                          document.body
                        )}
                      </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center shrink-0 w-auto justify-end pl-1 sm:pl-2 gap-1 sm:gap-1.5">
                    {/* Font Size Dropdown */}
                    <div className="relative inline-flex items-center" ref={fontMenuRef}>
                      <button
                        onClick={() => setShowFontMenu(!showFontMenu)}
                        className="flex items-center gap-1 px-2 py-1.5 text-xs sm:text-sm font-medium text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-colors border border-gray-200"
                        title="Change Font Size"
                      >
                        <span className="font-serif font-bold text-xs">A</span>
                        <span className="text-[11px] sm:text-xs text-gray-500">{fontSize}px</span>
                        <ChevronDown className={`w-3 h-3 text-gray-500 transition-transform duration-200 ${showFontMenu ? "rotate-180" : ""}`} />
                      </button>

                      {showFontMenu && (
                        <div className="absolute top-full right-0 mt-1.5 min-w-[84px] w-auto whitespace-nowrap bg-white border border-gray-200 rounded-2xl py-1 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                          <div className="px-3 py-1 text-[10px] font-normal text-gray-400 uppercase tracking-wider border-b border-gray-100 whitespace-nowrap px-2.5 py-1">
                            Font Size
                          </div>
                          {fontSizes.map((f) => (
                            <button
                              key={f.value}
                              onClick={() => {
                                setFontSize(f.value);
                                setShowFontMenu(false);
                              }}
                              className={`w-full text-left px-3 py-1.5 text-xs sm:text-sm flex items-center justify-between transition-colors ${fontSize === f.value
                                ? "text-[#cd5c3d] font-semibold bg-[#cd5c3d]/10"
                                : "text-gray-700 hover:bg-gray-50"
                                }`}
                            >
                              <span>{f.label}px</span>
                              {fontSize === f.value && <Check className="w-3.5 h-3.5 text-[#cd5c3d]" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => setIsSearchOpen(true)}
                      className="p-2 text-gray-500 hover:text-gray-800 rounded-md hover:bg-gray-100 transition-colors"
                      title="Search"
                    >
                      <Search className="w-5 h-5 stroke-1" />
                    </button>

                  </div>
                </div>
              )}

              {isFullScreen && (
                <>
                  {/* Top-right controls overlay */}
                  <div className="fixed top-5 right-5 z-50 flex items-center">
                    <button
                      onClick={() => {
                        const exit =
                          document?.exitFullscreen ||
                          document?.webkitExitFullscreen ||
                          document?.mozCancelFullScreen ||
                          document?.msExitFullscreen;
                        if (exit && document.fullscreenElement) {
                          try { exit.call(document); } catch (e) { }
                        }
                        setIsFullScreen(false);
                      }}
                      className="p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 hover:text-gray-900 transition-colors cursor-pointer shadow-sm"
                      title="Exit distraction free"
                    >
                      <X className="w-5 h-5 stroke-2" />
                    </button>
                  </div>

                  {/* Font size + auto scroll controls pill */}
                  <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-gray-100 hover:bg-gray-200/90 border border-gray-300 rounded-full px-5 py-2.5 text-gray-700 shadow-sm transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                        Size
                      </span>
                      <select
                        className="bg-transparent text-gray-700 hover:text-gray-900 text-sm outline-none cursor-pointer pr-1 font-medium"
                        value={fontSize}
                        onChange={(e) => setFontSize(e.target.value)}
                      >
                        {fontSizes.map((item) => (
                          <option
                            key={item.value}
                            value={item.value}
                            className="bg-white text-gray-800"
                          >
                            {item.label}px
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-px h-5 bg-gray-300" />

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                        Scroll
                      </span>
                      <button
                        onClick={() => setIsStopScroll((p) => !p)}
                        className="p-1.5 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 hover:text-gray-900 transition-colors flex items-center justify-center cursor-pointer"
                        title={isStopScroll ? "Resume auto-scroll" : "Pause auto-scroll"}
                      >
                        {!isStopScroll ? (
                          <Pause className="w-4 h-4 fill-current" />
                        ) : (
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}

              <div id="main-scroll-container" className="flex-1 overflow-y-auto bg-white">

                {/* Tabs are now in the sticky toolbar */}

                {/* Main Reading Container - expands width when in dual side-by-side mode */}
                <div className={`w-full mx-auto px-3 sm:px-6 py-8 md:py-12 transition-all duration-300 ${activeTab === "Language" && viewMode === "dual"
                  ? "max-w-[1240px]"
                  : "max-w-[800px]"
                  }`}>

                  {/* Language 1 & Language 2 Selectors in Parallel Mode */}
                  {activeTab === "Language" && (viewMode === "parallel" || viewMode === "dual") && (
                    <div className={`flex flex-row items-center mb-12 w-full ${viewMode === "dual" ? "justify-between" : "justify-center sm:justify-end gap-1.5 sm:gap-3"}`}>
                      {/* Language 1 Dropdown */}
                      <div className="relative inline-flex items-center shrink-0" ref={l1MenuRef}>
                        <button
                          onClick={() => {
                            setShowL1Menu(!showL1Menu);
                            setShowL2Menu(false);
                          }}
                          className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 text-[11px] sm:text-sm font-medium rounded-lg border border-gray-200 bg-white hover:border-[#cd5c3d] hover:text-[#cd5c3d] text-gray-700 transition-colors cursor-pointer text-left leading-tight shrink-0"
                        >
                          <span className="text-gray-500 font-normal">Language 1:</span>
                          <span className="font-normal text-[#001e2d]">
                            {languages.find(l => l.shortForm === dualLang1)?.name || dualLang1}
                          </span>
                          <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${showL1Menu ? "rotate-180 text-[#cd5c3d]" : ""}`} />
                        </button>

                        {showL1Menu && (
                          <div className="absolute top-full left-0 sm:left-0 sm:right-auto mt-1.5 w-44 bg-white border border-gray-200 rounded-xl z-50 animate-in fade-in zoom-in-95 duration-100">
                            <div className="px-3 pt-2.5 pb-1 text-[10px] font-normal text-gray-400 uppercase tracking-wider">
                              Language 1
                            </div>
                            <div className="py-1 flex flex-col">
                              {chapterAvailableLangs.map((l) => (
                                <button
                                  key={l.id}
                                  onClick={() => {
                                    handleSelectL1(l.shortForm);
                                    setShowL1Menu(false);
                                  }}
                                  className={`w-full text-left px-3.5 py-2 text-xs sm:text-sm font-normal flex items-center justify-between transition-colors ${
                                    dualLang1 === l.shortForm
                                      ? "bg-[#fdf3ec] text-[#cd5c3d]"
                                      : "text-gray-700 hover:bg-[#fdf3ec]/50 hover:text-[#cd5c3d]"
                                  }`}
                                >
                                  <span>{l.name}</span>
                                  {dualLang1 === l.shortForm && <Check className="w-3.5 h-3.5 text-[#cd5c3d]" />}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Language 2 Dropdown */}
                      <div className="relative inline-flex items-center shrink-0" ref={l2MenuRef}>
                        <button
                          onClick={() => {
                            setShowL2Menu(!showL2Menu);
                            setShowL1Menu(false);
                          }}
                          className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 text-[11px] sm:text-sm font-medium rounded-lg border border-gray-200 bg-white hover:border-[#cd5c3d] hover:text-[#cd5c3d] text-gray-700 transition-colors cursor-pointer text-left leading-tight shrink-0"
                        >
                          <span className="text-gray-500 font-normal">Language 2:</span>
                          <span className="font-normal text-[#001e2d]">
                            {chapterAvailableLangs.length <= 1 ? "None" : (languages.find(l => l.shortForm === dualLang2)?.name || dualLang2)}
                          </span>
                          <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${showL2Menu ? "rotate-180 text-[#cd5c3d]" : ""}`} />
                        </button>

                        {showL2Menu && (
                          <div className="absolute top-full right-0 mt-1.5 w-44 bg-white border border-gray-200 rounded-xl z-50 animate-in fade-in zoom-in-95 duration-100">
                            <div className="px-3 pt-2.5 pb-1 text-[10px] font-normal text-gray-400 uppercase tracking-wider">
                              Language 2
                            </div>
                            <div className="py-1 flex flex-col">
                              {chapterAvailableLangs.length <= 1 ? (
                                <div className="px-3.5 py-2.5 text-xs text-gray-400 italic">
                                  None (Single language)
                                </div>
                              ) : (
                                chapterAvailableLangs.map((l) => (
                                  <button
                                    key={l.id}
                                    onClick={() => {
                                      handleSelectL2(l.shortForm);
                                      setShowL2Menu(false);
                                    }}
                                    className={`w-full text-left px-3.5 py-2 text-xs sm:text-sm font-normal flex items-center justify-between transition-colors ${
                                      dualLang2 === l.shortForm
                                        ? "bg-[#fdf3ec] text-[#cd5c3d]"
                                        : "text-gray-700 hover:bg-[#fdf3ec]/50 hover:text-[#cd5c3d]"
                                    }`}
                                  >
                                    <span>{l.name}</span>
                                    {dualLang2 === l.shortForm && <Check className="w-3.5 h-3.5 text-[#cd5c3d]" />}
                                  </button>
                                ))
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Language Tab Content */}
                  {activeTab === "Language" && (
                    <LanguageTab
                      chapters={chapters}
                      currentChapterId={chapterId}
                      langMap={langMap}
                      lang={parallelLang}
                      fontSize={fontSize}
                      targetChapterId={targetChapterId}
                      viewMode={viewMode}
                      dualLang1={dualLang1}
                      dualLang2={dualLang2}
                      languages={languages}
                    />
                  )}

                  {/* Front Tab Content */}
                  {activeTab === "Front" && (
                    <FrontTab lesson={lesson} />
                  )}

                  {/* Reading Content */}
                  {activeTab === "Translation" && (
                    <TranslationTab
                      chapters={chapters}
                      currentChapterId={chapterId}
                      langMap={langMap}
                      lang="EN"
                      fontSize={fontSize}
                      targetChapterId={targetChapterId}
                    />
                  )}

                  {/* Source Tab Content */}
                  {activeTab === "Source" && (
                    <SourceTab
                      chapters={chapters}
                      currentChapterId={chapterId}
                      langMap={langMap}
                      fontSize={fontSize}
                      targetChapterId={targetChapterId}
                    />
                  )}

                </div>
              </div>
            </Panel>

            {/* RIGHT PANEL */}
            {showRightPanel && !isFullScreen && (
              <>
                <PanelResizeHandle className="w-2 relative flex items-center justify-center bg-gray-50 border-l border-gray-200 hover:bg-gray-100 transition-colors cursor-col-resize">
                  <div className="flex flex-col space-y-1">
                    <span className="block w-1 h-1 rounded-full bg-gray-400"></span>
                    <span className="block w-1 h-1 rounded-full bg-gray-400"></span>
                    <span className="block w-1 h-1 rounded-full bg-gray-400"></span>
                  </div>
                </PanelResizeHandle>
                <Panel defaultSize="20%" minSize="15%" maxSize="40%" className="hidden lg:flex flex-col bg-white border-l border-gray-200">
                  <div className="p-6 text-center text-gray-500 text-sm mt-10">
                    Right side panel content (e.g. notes, glossary).
                  </div>
                </Panel>
              </>
            )}
          </PanelGroup>
        </div>
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => {
          setAuthModalOpen(false);
          setPendingAction(null);
        }}
        onSuccess={() => {
          setAuthModalOpen(false);
          setTimeout(() => {
            if (pendingAction === "download") {
              handleDownloadPdf();
            } else if (pendingAction === "share") {
              handleShareClick();
            } else if (pendingAction === "mark") {
              handleMarkIt();
            }
            setPendingAction(null);
          }, 500); // Give auth state a moment to settle
        }}
      />

      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        lessonId={lessonId}
        chapters={selectedChapter ? [selectedChapter] : chapters.filter(c => c.id === (chapterId || visibleChapterId))}
        languages={languages}
        currentLang={currentLangCode}
        langMap={langMap}
        onResultClick={handleSearchResultClick}
      />
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        url={window.location.href}
        title={currentChapter?.name ? `${currentChapter.name} - The Agamas` : "The Agamas"}
      />
    </div>
  );
}
