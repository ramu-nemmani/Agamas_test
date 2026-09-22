import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { collection, doc, getDoc, getDocs, orderBy, query, where, setDoc, addDoc } from "firebase/firestore";
import DOMPurify from "dompurify";
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from "react-resizable-panels";
import { ArrowLeft, ArrowRight, Bookmark, Check, Maximize2, X, ChevronDown, List, PanelLeft, PanelRight, Search, Glasses, LibraryBig, ChevronsUpDown, ChevronRight, FileType, FileText, Headphones, Share2, Menu } from "lucide-react";

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
  const lang = searchParams.get("lang") || "CN-EN";
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

  // Settings
  const [fontSize, setFontSize] = useState("16");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auth & Bookmarks
  const { user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [markItStatus, setMarkItStatus] = useState(false);

  const [showLeftPanel, setShowLeftPanel] = useState(window.innerWidth >= 1024);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Translation");
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [parallelLang, setParallelLang] = useState(lang);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const containerRef = useRef(null);

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

  useSaveProgress({
    bookId: lessonId,
    bookTitle: lesson?.name,
    coverUrl: lesson?.image || null,
    lastUrl: `/chapter-view/${lessonId}/${chapterId}?lang=${lang}`,
    dependencies: [lessonId, chapterId, lang, lesson]
  });

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

      setTimeout(() => {
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
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    
    if (!currentChapter) {
      ToastMSG("error", "Chapter not found.");
      return;
    }
    const langId = langMap[lang];
    const pdfUrl = currentChapter?.pdfLink?.[langId];
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
      
      const currentUser = auth.currentUser || user;
      if (currentUser) {
        try {
          await addDoc(collection(db, "downloads"), {
            userId: currentUser.uid,
            lessonId: lessonId,
            lessonName: lesson?.name || "",
            chapterId: chapterId,
            chapterName: currentChapter?.name || "",
            language: lang,
            pdfLink: pdfUrl,
            timestamp: new Date().toISOString()
          });
        } catch (err) {
          console.error("Error tracking download:", err);
        }
      }
    } else {
      ToastMSG("error", "PDF not available for this chapter in this language.");
    }
  };



  const handleShareClick = () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    setIsShareModalOpen(true);
  };

  const currentChapterIndex = chapters.findIndex(c => c.id === chapterId);
  const prevChapter = currentChapterIndex > 0 ? chapters[currentChapterIndex - 1] : null;
  const nextChapter = currentChapterIndex < chapters.length - 1 ? chapters[currentChapterIndex + 1] : null;

  const handleSearchResultClick = (result) => {
    // navigate to chapter if different
    if (result.chapterId !== chapterId) {
      navigate(`/chapter-view/${lessonId}/${result.chapterId}?lang=${lang}`);
    }
    
    setIsSearchOpen(false);
    
    // wait for render then scroll
    setTimeout(() => {
      const el = document.getElementById(`post-${result.post.id}`);
      const container = document.getElementById('main-scroll-container');
      if (el && container) {
        const elTop = el.getBoundingClientRect().top;
        const containerTop = container.getBoundingClientRect().top;
        container.scrollTop += (elTop - containerTop) - 60; // 60px offset for header
      }
    }, 500);
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
    <div className={`overflow-hidden flex flex-col ${isFullScreen ? "fixed inset-0 h-screen z-[100] bg-white" : "h-[calc(100vh)] bg-white"}`} ref={containerRef}>
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
              <span className="font-semibold text-[#001e2d] text-sm uppercase">Table of Contents</span>
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

               {/* Chapter List */}
               {chapters.map((c) => (
                 <div key={c.id} className="border-b border-gray-100 last:border-b-0">
                   <button
                     onClick={() => {
                       navigate(`/chapter-view/${lessonId}/${c.id}?lang=${lang}`);
                       setShowLeftPanel(false);
                     }}
                     className="w-full py-2.5 px-2 text-left text-sm transition-colors flex gap-3 rounded-md items-start font-light text-[#001e2d] hover:bg-gray-50"
                     style={{
                       fontFamily: '"Noto Serif", "Noto Serif Fallback", serif'
                     }}
                   >
                     <span className="shrink-0 text-xs text-gray-400 mt-[2px]">{c.position.toString().padStart(2, '0')}.</span>
                     <span className="leading-snug">
                       {c.name?.replace(/^Chapter\s+[0-9]+:/i, '').trim() || c.name}
                     </span>
                   </button>
                 </div>
               ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Full Screen Banner */}
      {!isFullScreen && (
        <div className="sticky z-30 w-full flex justify-center bg-white">
          <div className="w-full max-w-[1336px] bg-[#f0f4f6]">
            <button 
              onClick={() => setIsFullScreen(true)}
              className="w-full flex items-center justify-center gap-2 py-1.5 text-xs text-[#155370]/70 hover:text-[#155370] hover:bg-black/5 transition-colors cursor-pointer"
            >
              <ChevronsUpDown className="w-3.5 h-3.5" />
              <span className="font-medium">Full Screen</span>
            </button>
          </div>
        </div>
      )}

      <div className={`flex flex-1 min-h-0 w-full mx-auto max-w-[1336px] ${isFullScreen ? "" : "px-0 pb-0 lg:px-8 lg:pb-4 pt-0 bg-[#f0f4f6]"}`}>
        <div className={`flex h-full w-full overflow-hidden ${isFullScreen ? "bg-white" : ""}`}>
          <PanelGroup orientation="horizontal" id="agamas-reader-panels">
          
          {/* LEFT PANEL */}
          {showLeftPanel && !isFullScreen && (
            <>
              <Panel defaultSize="20%" minSize="15%" maxSize="40%" className="hidden md:flex flex-col bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="flex flex-col h-full w-full">
                  <div className="w-full border-b border-gray-200 pt-3 pb-2.5 flex justify-center">
                    <div className="text-[15px] text-[#555] font-medium tracking-wide border-b-2 border-[#cd5c3d] pb-1.5 px-2 inline-block">
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
                       
                       {/* Chapter List */}
                       {chapters.map((c) => (
                         <div key={c.id} className="border-b border-gray-100 last:border-b-0">
                           <button
                             onClick={() => {
                               navigate(`/chapter-view/${lessonId}/${c.id}?lang=${lang}`);
                             }}
                             className="w-full py-2 px-3 text-left text-sm transition-colors flex gap-3 rounded-md items-start font-light text-[#001e2d]"
                             style={{
                               fontFamily: '"Noto Serif", "Noto Serif Fallback", serif',
                               fontStyle: 'normal',
                               fontVariantCaps: 'normal',
                               fontVariantEastAsian: 'normal',
                               fontVariantLigatures: 'none',
                               fontVariantNumeric: 'normal'
                             }}
                           >
                             <span className="shrink-0 text-xs text-gray-400 mt-[2px]">{c.position.toString().padStart(2, '0')}.</span>
                             <span className="leading-snug">
                               {c.name?.replace(/^Chapter\s+[0-9]+:/i, '').trim() || c.name}
                             </span>
                           </button>
                         </div>
                       ))}
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
               <div className="sticky top-0 w-full flex items-center justify-between py-1 px-1 sm:px-4 bg-white z-20 min-h-[48px] border-b border-gray-100">
                 <div className="flex w-auto lg:w-[110px]">
                   <button 
                     onClick={() => setShowLeftPanel(!showLeftPanel)}
                     className="p-2 text-gray-500 hover:text-gray-800 rounded-md hover:bg-gray-100 transition-colors"
                     title="Toggle Table of Contents"
                   >
                     <PanelLeft className="w-5 h-5 stroke-1" />
                   </button>
                 </div>
                 
                 <div className="flex-1 flex justify-start md:justify-center pointer-events-auto min-w-0">
                    <div className="flex items-center md:justify-center gap-1 sm:gap-3 bg-white px-1 sm:px-2 overflow-x-auto no-scrollbar w-full">
                      {["Front", "Translation"].map(tab => (
                        <button 
                          key={tab}
                          onClick={() => {
                            setActiveTab(tab);
                          }}
                          className={`inline-flex items-center justify-center whitespace-nowrap px-3 py-2 sm:px-3 sm:py-1.5 text-sm transition-all border-b-2 ${
                            activeTab === tab 
                              ? "font-semibold text-[#cd5c3d] border-[#cd5c3d]" 
                              : "text-gray-500 hover:text-gray-800 hover:border-gray-200 border-transparent"
                          }`}
                        >
                          {tab}
                        </button>
                      ))}

                      {/* Language Dropdown Tab */}
                      <div className="relative inline-flex items-center h-full">
                        <button 
                          onClick={() => {
                            setActiveTab("Language");
                            setShowLangMenu(!showLangMenu);
                          }}
                          className={`inline-flex items-center justify-center whitespace-nowrap px-3 py-2 sm:px-3 sm:py-1.5 text-sm transition-all border-b-2 ${
                            activeTab === "Language"
                              ? "font-semibold text-[#cd5c3d] border-[#cd5c3d]" 
                              : "text-gray-500 hover:text-gray-800 hover:border-gray-200 border-transparent"
                          }`}
                        >
                          Language <ChevronDown className="ml-1 w-3 h-3" />
                        </button>
                        {showLangMenu && (
                          <div className="absolute top-full left-0 mt-[1px] w-48 bg-white border border-gray-100 rounded-b-lg shadow-lg overflow-hidden z-50">
                            <div className="py-1 flex flex-col">
                              {languages.filter(l => l.shortForm).map((l) => (
                                <button
                                  key={l.id}
                                  onClick={() => {
                                    setParallelLang(l.shortForm);
                                    setShowLangMenu(false);
                                    setActiveTab("Language");
                                  }}
                                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                                    parallelLang === l.shortForm ? "font-semibold text-[#cd5c3d] bg-[#fdf3ec]" : "text-gray-700"
                                  }`}
                                >
                                  {l.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {["Source"].map(tab => (
                        <button 
                          key={tab}
                          onClick={() => {
                            setActiveTab(tab);
                          }}
                          className={`inline-flex items-center justify-center whitespace-nowrap px-3 py-2 sm:px-3 sm:py-1.5 text-sm transition-all border-b-2 ${
                            activeTab === tab 
                              ? "font-semibold text-[#cd5c3d] border-[#cd5c3d]" 
                              : "text-gray-500 hover:text-gray-800 hover:border-gray-200 border-transparent"
                          }`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                 </div>

                  <div className="flex items-center shrink-0 w-auto md:w-[110px] justify-end bg-white pl-1 sm:pl-2">
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
               <div className="fixed top-4 right-6 z-50">
                 <button
                   onClick={() => setIsFullScreen(false)}
                   className="p-3 bg-white/80 backdrop-blur border border-gray-200 shadow-sm rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                   title="Exit Distraction Free"
                 >
                   <X className="w-5 h-5 stroke-1" />
                 </button>
               </div>
             )}

             <div id="main-scroll-container" className="flex-1 overflow-y-auto bg-white">

               {/* Tabs are now in the sticky toolbar */}

               <div className="w-full max-w-[800px] mx-auto px-6 py-10 md:py-16">
                 
                 {/* Language Tab Content */}
                 {activeTab === "Language" && (
                   <LanguageTab 
                     chapters={chapters}
                     langMap={langMap}
                     lang={parallelLang}
                     fontSize={fontSize}
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
                     langMap={langMap} 
                     lang={lang} 
                     fontSize={fontSize} 
                   />
                 )}

                 {/* Source Tab Content */}
                 {activeTab === "Source" && (
                   <SourceTab />
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
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          setAuthModalOpen(false);
        }}
      />
      
      <SearchOverlay 
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        lessonId={lessonId}
        chapters={chapters}
        languages={languages}
        currentLang={lang}
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
