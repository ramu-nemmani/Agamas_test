import DOMPurify from "dompurify";
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
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Download,
  Maximize2,
  Pause,
  Play,
  RotateCcw,
  Square,
  X,
  BookOpen,
  Bookmark,
  Check,
} from "lucide-react";
import { useEffect, useRef, useState, useMemo } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { useLanguages } from "../context/LanguageContext";
import { db, auth } from "../firebase";
import TimestampToDate from "../utils/TimestampToDate";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";
import { useSaveProgress } from "../hooks/useSaveProgress";

export default function ViewPost({ isFullScreen, setIsFullScreen }) {
  const customStyles = `
    .force-chapter-font * {
      font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji" !important;
      font-size: 14px !important;
      font-style: normal !important;
      font-variant-caps: normal !important;
      font-variant-east-asian: normal !important;
      font-variant-ligatures: normal !important;
      font-variant-numeric: normal !important;
      font-weight: 400 !important;
    }
  `;
  const { lessonId } = useParams();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const lang = searchParams.get("lang");
  const postNo = searchParams.get("postNo");
  const blockParam = searchParams.get("block");
  const navigate = useNavigate();
  const { languages } = useLanguages();
  const langMap = {};
  languages.forEach((item) => {
    const shortKey = item.shortForm;
    if (shortKey) langMap[shortKey] = item.id;
  });

  const containerRef = useRef(null);
  const postRef = useRef(null);
  const [Chapter, setChapter] = useState();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isStopScroll, setIsStopScroll] = useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState(null);
  const [currentBlockIndex, setCurrentBlockIndex] = useState(null);
  const [selectedFontsize, setSelectedFontsize] = useState("text-[14px]");
  const [postsList, setPostsList] = useState({});
  const [currentPost, setCurrentPost] = useState({});

  const { user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [markItStatus, setMarkItStatus] = useState(false);

  useSaveProgress({
    bookId: lessonId,
    bookTitle: Chapter?.LessonName,
    coverUrl: Chapter?.image || null,
    lastUrl: `/chapters/${lessonId}/${Chapter?.name || 'chapter'}?id=${id}&postNo=${postNo}&lang=${lang}${currentBlockIndex !== null ? `&block=${currentBlockIndex}` : ''}`,
    dependencies: [id, postNo, lang, Chapter, currentBlockIndex]
  });

  const executeDownload = async () => {
    const pdfLink = Chapter?.pdfLink?.[langMap[lang]];
    if (pdfLink) {
      window.open(pdfLink, "_blank");
      const currentUser = auth.currentUser || user;
      if (currentUser && id) {
        try {
          await setDoc(doc(collection(db, "downloads")), {
            userId: currentUser.uid,
            chapterId: id,
            chapterName: Chapter?.name || "",
            lessonId: lessonId,
            lessonName: Chapter?.LessonName || "",
            language: lang || "",
            pdfLink: pdfLink,
            timestamp: new Date().toISOString()
          });
        } catch(err) {
          console.error("Error saving download history:", err);
        }
      }
    } else {
      alert("PDF not available for the selected language.");
    }
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

  const executeMarkIt = async () => {
    setMarkItStatus(true);
    try {
      const currentUser = auth.currentUser || user;
      if (id && currentUser) {
        await setDoc(doc(db, "bookmarks", `${currentUser.uid}_${id}`), {
          userId: currentUser.uid,
          chapterId: id,
          chapterName: Chapter?.name || "",
          lessonId: lessonId,
          lessonName: Chapter?.LessonName || "",
          blockIndex: currentBlockIndex,
          timestamp: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error("Error marking it:", err);
    }
    setTimeout(() => setMarkItStatus(false), 2000);
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

  const executePendingAction = () => {
    if (pendingAction === 'download') {
      executeDownload();
    } else if (pendingAction === 'markIt') {
      executeMarkIt();
    }
    setPendingAction(null);
  };

  const fontSizes = [
    { label: "12", value: "text-[12px]" },
    { label: "14", value: "text-[14px]" },
    { label: "16", value: "text-[16px]" },
    { label: "18", value: "text-[18px]" },
    { label: "22", value: "text-[22px]" },
    { label: "26", value: "text-[26px]" },
  ];

  async function fetchLesson() {
    try {
      const snap = await getDoc(doc(db, "lessons", lessonId));
      return snap.data()?.name;
    } catch (e) {
      console.log(e);
    }
  }

  async function fetchChapter() {
    try {
      const snap = await getDoc(doc(db, "chapters", id));
      setChapter({ id, LessonName: await fetchLesson(), ...snap.data() });
    } catch (e) {
      console.log(e);
    }
  }

  const totalPosts = postsList[lang]?.length || 0;

  const fetchPosts = async () => {
    try {
      const isExist = postsList[lang]?.length > 0;
      if (isExist) {
        setCurrentPost(postsList[lang].find((p) => p.position == postNo));
        return;
      }
      const postQuery = query(
        collection(db, "posts"),
        where("chapterId", "==", id),
        where("language", "==", langMap[lang]),
        orderBy("position"),
      );
      const snapshot = await getDocs(postQuery);
      setCurrentPost({});
      const posts = snapshot.docs.map((doc) => {
        const data = doc.data();
        const post = {
          id: doc.id,
          ...data,
          post_modified:
            TimestampToDate(data.post_modified) ||
            TimestampToDate(data.post_date),
        };
        if (data.position == postNo) setCurrentPost(post);
        return post;
      });
      setPostsList((pre) => ({ ...pre, [lang]: posts }));
      stop();
    } catch (e) {
      console.log(e);
    }
  };

  const speakBlock = (index) => {
    const block = document.getElementById(`block-${index}`);
    if (!block) {
      stop();
      return;
    }
    const text = block.innerText?.trim();
    if (!text) {
      speakBlock(index + 1);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Map short forms to BCP 47 language tags for SpeechSynthesis
    const speechLangMap = {
      EN: "en-US",
      HI: "hi-IN",
      HE: "hi-IN", // Hindi-English parallel
      EH: "hi-IN", // English-Hindi parallel
      CN: "zh-CN",
      CE: "zh-CN", // Chinese-English parallel
      TA: "ta-IN",
      TE: "te-IN",
      ML: "ml-IN",
      MR: "mr-IN",
      BN: "bn-IN",
      GU: "gu-IN",
      KN: "kn-IN",
      PA: "pa-IN",
      FR: "fr-FR",
      ES: "es-ES",
      DE: "de-DE",
      JA: "ja-JP",
      RU: "ru-RU",
      KO: "ko-KR",
      AR: "ar-SA",
      PT: "pt-BR",
      IT: "it-IT",
    };
    
    utterance.lang = speechLangMap[lang?.toUpperCase()] || "en-US";
    
    // Ensure that parallel languages or mixed texts use a voice capable of reading both.
    // E.g., Chinese voice can read English, and Hindi voice can read English.
    if (lang?.toUpperCase() === "CE" || /[\u4e00-\u9fa5]/.test(text)) {
      utterance.lang = "zh-CN";
    } else if (lang?.toUpperCase() === "HE" || lang?.toUpperCase() === "EH" || /[\u0900-\u097F]/.test(text)) {
      utterance.lang = "hi-IN";
    }
    
    // Attempt to pick a preferred voice (Google or Female) to prevent unexpected male defaults
    const voices = window.speechSynthesis.getVoices();
    const targetLang = utterance.lang;
    let preferredVoice = voices.find(v => v.lang === targetLang && v.name.includes('Google'));
    if (!preferredVoice) {
      preferredVoice = voices.find(v => v.lang === targetLang && (
        v.name.toLowerCase().includes('female') || 
        v.name.toLowerCase().includes('zira') || 
        v.name.toLowerCase().includes('swara') || 
        v.name.toLowerCase().includes('kalpana')
      ));
    }
    if (!preferredVoice) {
      preferredVoice = voices.find(v => v.lang === targetLang);
    }
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    utterance.rate = 1;
    utterance.pitch = 1;
    const blockId = `block-${index}`;
    setSelectedBlockId(blockId);
    const rect = block.getBoundingClientRect();
    window.scrollTo({
      top: rect.top + window.pageYOffset - window.innerHeight / 2,
      behavior: "smooth",
    });
    speechSynthesis.speak(utterance);
    utterance.onend = () => {
      if (!speechSynthesis.paused) {
        setCurrentBlockIndex(index + 1);
        speakBlock(index + 1);
      }
    };
  };

  const play = () => {
    if (speechSynthesis.paused || speechSynthesis.speaking) {
      speechSynthesis.resume();
    } else {
      const start = currentBlockIndex ?? 0;
      setCurrentBlockIndex(start);
      speakBlock(start);
      setIsStopScroll(true);
    }
    setIsPlaying(true);
  };

  const pause = () => {
    if (speechSynthesis.speaking) {
      speechSynthesis.pause();
      setIsPlaying(false);
    }
  };

  const stop = () => {
    speechSynthesis.cancel();
    setIsPlaying(false);
    setCurrentBlockIndex(null);
    setSelectedBlockId(null);
    setIsStopScroll(false);
  };

  useEffect(() => {
    if (!id) return;
    fetchChapter();
    

    return () => speechSynthesis.cancel();
  }, []);



  useEffect(() => {
    if (!id || !lang || !postNo || !langMap[lang]) {
      if (!lang) navigate(`?id=${id}&postNo=${postNo}&lang=CN`);
      return;
    }
    fetchPosts();
  }, [lang, id, postNo, langMap[lang]]);

  // Jump to specific block if parameter is present
  useEffect(() => {
    if (blockParam !== null && currentPost?.post_content) {
      const idx = parseInt(blockParam, 10);
      if (!isNaN(idx)) {
        setCurrentBlockIndex(idx);
        setSelectedBlockId(`block-${idx}`);
        // Scroll after a tiny delay to ensure DOM is rendered
        setTimeout(() => {
          const blockEl = document.getElementById(`block-${idx}`);
          if (blockEl) {
            const rect = blockEl.getBoundingClientRect();
            window.scrollTo({
              top: rect.top + window.pageYOffset - window.innerHeight / 2,
              behavior: "smooth",
            });
          }
        }, 300);
      }
    }
  }, [blockParam, currentPost]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container && !isFullScreen && isStopScroll) return;
    if (isFullScreen) {
      const request =
        container.requestFullscreen ||
        container.webkitRequestFullscreen ||
        container.mozRequestFullScreen ||
        container.msRequestFullscreen;
      if (request) request.call(container);
    }
    let scrollY = 0;
    const scrollSpeed = 0.5;
    const interval = 60;
    let scrollInterval = null;
    let delayTimeout = null;
    delayTimeout = setTimeout(() => {
      scrollInterval = setInterval(() => {
        if (
          scrollY + container.clientHeight >= container.scrollHeight ||
          isStopScroll
        ) {
          clearInterval(scrollInterval);
          setIsStopScroll(true);
          return;
        }
        scrollY += scrollSpeed;
        container.scrollTop += scrollSpeed;
      }, interval);
    }, 10000);
    return () => {
      clearTimeout(delayTimeout);
      clearInterval(scrollInterval);
    };
  }, [Chapter, isFullScreen, isStopScroll]);

  function stripInlineStyles(htmlString) {
    return DOMPurify.sanitize(htmlString, { FORBID_ATTR: ["style"] });
  }

  /* ── Full-screen reading mode ──────────────────────────────────── */
  if (isFullScreen) {
    return (
      <div
        className="h-screen overflow-y-auto bg-[#0d0a08] text-white"
        ref={containerRef}
      >
        <style>{customStyles}</style>
        {/* Controls overlay */}
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2">
          <button
            onClick={() => {
              if (isPlaying) {
                stop();
              } else {
                setIsStopScroll((p) => !p);
              }
            }}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
            title={isStopScroll ? "Resume scroll" : "Pause scroll"}
          >
            {isStopScroll ? (
              <Play className="w-5 h-5" />
            ) : (
              <Pause className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={() => {
              const exit =
                document?.exitFullscreen ||
                document?.webkitExitFullscreen ||
                document?.mozCancelFullScreen ||
                document?.msExitFullscreen;
              if (exit) exit.call(document);
              setIsFullScreen(false);
            }}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
            title="Exit fullscreen"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Font size + listen controls */}
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/60 uppercase tracking-wider">
              Size
            </span>
            <select
              className="bg-transparent text-white text-sm outline-none cursor-pointer"
              value={selectedFontsize}
              onChange={(e) => setSelectedFontsize(e.target.value)}
            >
              {fontSizes.map((item) => (
                <option
                  key={item.value}
                  value={item.value}
                  className="bg-[#1a1008] text-white"
                >
                  {item.label}px
                </option>
              ))}
            </select>
          </div>
          <div className="w-px h-5 bg-white/20" />
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/60 uppercase tracking-wider">
              Listen
            </span>
            {!isPlaying ? (
              <button
                onClick={play}
                className="p-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white transition"
              >
                {speechSynthesis.speaking ? (
                  <RotateCcw className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </button>
            ) : (
              <>
                <button
                  onClick={pause}
                  className="p-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white transition"
                >
                  <Pause className="w-4 h-4" />
                </button>
                <button
                  onClick={stop}
                  className="p-1.5 rounded-full bg-red-500/40 hover:bg-red-500/60 text-white transition"
                >
                  <Square className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto px-6 py-16">
          <div className={`leading-loose space-y-3 ${selectedFontsize}`}>
            {currentPost?.post_content
              ?.match(/<p[^>]*>[\s\S]*?<\/p>/gi)
              ?.map((para, index) => {
                const blockId = `block-${index}`;
                return (
                  <p
                    key={blockId}
                    id={blockId}
                    className={`force-chapter-font cursor-pointer transition-all duration-200 rounded-xl px-1 -mx-1 hover:bg-white/5 ${
                      selectedBlockId === blockId
                        ? "bg-[#cd5c3d20]"
                        : ""
                    }`}
                    onClick={() => {
                      if (isPlaying || speechSynthesis.speaking) return;
                      setCurrentBlockIndex(index);
                      setSelectedBlockId(blockId);
                    }}
                    dangerouslySetInnerHTML={{
                      __html: stripInlineStyles(para),
                    }}
                  />
                );
              })}
          </div>
        </div>
      </div>
    );
  }

  /* ── Normal reading mode ───────────────────────────────────────── */
  return (
    <div className="bg-[#fdf8f4] min-h-screen" ref={containerRef}>
      <style>{customStyles}</style>
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className="w-full select-none sticky top-[88px] z-40 bg-[#fdf8f4]">
        <div className="max-w-[1360px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-3 md:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto shrink-0 max-w-full overflow-hidden">
            <button
              onClick={() => navigate("./..")}
              className="inline-flex items-center gap-1.5 text-sm text-[#888] hover:text-[#cd5c3d] transition-colors shrink-0 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform shrink-0" />
              <span className="shrink-0">Back</span>
            </button>
            <span className="text-[#e8e0d8] shrink-0">|</span>
            <span
              className="text-base font-light text-[#1e1e1e] truncate"
              style={{ fontFamily: "'Lora', Georgia, serif" }}
            >
              {Chapter?.LessonName}
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto overflow-x-auto no-scrollbar pb-1 sm:pb-0 shrink-0">
            <button
              onClick={handleMarkIt}
              className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold border rounded-full transition cursor-pointer shrink-0 ${
                markItStatus 
                  ? "border-green-600 bg-green-50 text-green-700 hover:bg-green-100" 
                  : "border-slate-800 text-slate-800 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {markItStatus ? <Check className="w-3 h-3" /> : <Bookmark className="w-3 h-3" />}
              <span className="hidden sm:inline">{markItStatus ? "Saved!" : "Mark It"}</span>
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold border rounded-full transition cursor-pointer border-slate-800 text-slate-800 hover:bg-slate-800 hover:text-white disabled:opacity-50 shrink-0"
            >
              <Download className="w-3 h-3" />
              <span className="hidden sm:inline">Download</span>
            </button>
            <button
              onClick={() => navigate(`/book/${lessonId}/read?chapterId=${id}&postNo=${postNo}&lang=${lang}`)}
              className="px-3 py-1.5 rounded-full border border-[rgb(205,92,61)] bg-[rgb(205,92,61)] text-white text-xs font-semibold cursor-pointer transition hover:bg-[#fff9f1] hover:text-[rgb(205,92,61)] shrink-0"
            >
              Page Reader
            </button>
            <button
              onClick={() => setIsFullScreen(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold border rounded-full transition cursor-pointer border-slate-800 text-slate-800 hover:bg-slate-800 hover:text-white shrink-0"
            >
              <Maximize2 className="w-3 h-3" />
              <span className="hidden sm:inline">Full Screen</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1360px] mx-auto w-full px-4 sm:px-6 lg:px-8 pt-2 pb-6 md:pt-3 md:pb-8 flex flex-col lg:flex-row gap-6">
        {/* ── Left Sidebar: Post List ─────────────────────────────── */}
        <aside className="w-full lg:w-64 shrink-0 flex-shrink-0 lg:sticky lg:top-[152px] lg:h-[calc(100vh-160px)] hidden md:flex flex-col gap-3 select-none">
          <div className="flex flex-col gap-0.5 overflow-y-auto no-scrollbar flex-grow py-3 pr-3 pl-0 -ml-3.5 rounded-2xl">
            {postsList[lang]?.map((p) => {
              const isActive = Number(postNo) === Number(p.position);
              return (
                <Link
                  key={p.position}
                  to={`?postNo=${p.position}&lang=${lang}&id=${id}`}
                  className={`flex items-baseline gap-2 rounded-full px-3.5 py-2 text-xs transition-all ${
                    isActive
                      ? "bg-[#cd5c3d12] text-[#cd5c3d] font-semibold"
                      : "text-[#555] hover:bg-[#fdf3ec] hover:text-[#cd5c3d]"
                  }`}
                >
                  <span className="font-mono text-[10px] text-[#bbb] shrink-0 w-4 text-right">
                    {p.position}.
                  </span>
                  <span className="leading-snug">{p.post_title}</span>
                </Link>
              );
            })}
          </div>
        </aside>

        {/* ── Main Content ────────────────────────────────────────── */}
        <main className="flex-1 min-w-0">
          <div className="bg-white border border-[#e8e0d8] rounded-2xl overflow-hidden">
            {/* Post header */}
            <div className="border-b border-[#e8e0d8] px-6 md:px-10 py-6">
              <h2
                className="text-2xl md:text-3xl font-semibold text-[#1e1e1e] mb-2"
                style={{ fontFamily: "'Lora', Georgia, serif" }}
              >
                {currentPost?.post_title}
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-sm text-[#888]">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#cd5c3d]" />
                  {Chapter?.name}
                </span>
                {currentPost?.post_author && (
                  <span>Translated by {currentPost.post_author}</span>
                )}
              </div>
            </div>

            {/* Post body */}
            <div className="px-6 md:px-10 py-8">
              <div
                className={`leading-loose space-y-3 ${selectedFontsize} text-[#2c2c2c]`}
                ref={postRef}
              >
                {currentPost?.post_content
                  ?.match(/<p[^>]*>[\s\S]*?<\/p>/gi)
                  ?.map((para, index) => {
                    const blockId = `block-${index}`;
                    return (
                      <div
                        key={blockId}
                        id={blockId}
                        className={`force-chapter-font cursor-pointer px-2 sm:px-3 rounded-xl transition-all duration-200 py-1.5 ${
                          selectedBlockId === blockId
                            ? "bg-amber-500/10 border border-amber-500/20"
                            : "hover:bg-amber-500/5 border border-transparent"
                        }`}
                        onClick={() => {
                          if (isPlaying || speechSynthesis.speaking) return;
                          setCurrentBlockIndex(index);
                          setSelectedBlockId(blockId);
                        }}
                        dangerouslySetInnerHTML={{
                          __html: stripInlineStyles(para),
                        }}
                      />
                    );
                  })}
              </div>
            </div>

            {/* Post footer */}
            {currentPost?.post_modified && (
              <div className="border-t border-[#e8e0d8] px-6 md:px-10 py-4 text-xs text-[#aaa]">
                Last updated: {currentPost.post_modified}
              </div>
            )}
          </div>

          {/* ── Prev / Next navigation ─────────────────────────── */}
          <div className="flex items-center justify-between mt-4 gap-3">
            <button
              disabled={+postNo <= 1}
              onClick={() =>
                navigate(`?id=${id}&postNo=${+postNo - 1}&lang=${lang}`)
              }
              className="inline-flex items-center gap-2 text-sm font-medium border border-[#e8e0d8] bg-white hover:border-[#cd5c3d] hover:text-[#cd5c3d] rounded-full px-4 py-2.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" /> Previous
            </button>
            <span className="text-sm text-[#aaa]">
              {totalPosts > 0 ? `${postNo} / ${totalPosts}` : "—"}
            </span>
            <button
              disabled={+postNo >= totalPosts}
              onClick={() =>
                navigate(`?id=${id}&postNo=${+postNo + 1}&lang=${lang}`)
              }
              className="inline-flex items-center gap-2 text-sm font-medium border border-[#e8e0d8] bg-white hover:border-[#cd5c3d] hover:text-[#cd5c3d] rounded-full px-4 py-2.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </main>

        {/* ── Right Sidebar: Controls ─────────────────────────────── */}
        <aside className="w-full lg:w-64 shrink-0 flex-shrink-0 lg:sticky lg:top-[152px] lg:h-[calc(100vh-160px)] flex flex-col gap-5 select-none overflow-y-auto py-3 pr-1">
          {/* Language */}
          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase font-bold tracking-widest text-[#A5A5A9]">
              Language
            </label>
            <div className="relative">
              <select
                value={lang}
                onChange={(e) =>
                  navigate(
                    `?id=${id}&postNo=${postNo}&lang=${e.target.value}`,
                  )
                }
                className="w-full py-3 pl-4 pr-10 rounded-full border text-sm font-normal focus:outline-none cursor-pointer appearance-none bg-white border-[#f0ede6] text-slate-800"
              >
                {languages.filter(l => l.shortForm).map((l) => (
                  <option key={l.id} value={l.shortForm}>
                    {l.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Font Size */}
          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase font-bold tracking-widest text-[#A5A5A9]">
              Font Size
            </label>
            <div className="relative">
              <select
                className="w-full py-3 pl-4 pr-10 rounded-full border text-sm font-normal focus:outline-none cursor-pointer appearance-none bg-white border-[#f0ede6] text-slate-800"
                value={selectedFontsize}
                onChange={(e) => setSelectedFontsize(e.target.value)}
              >
                {fontSizes.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}px
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Listen */}
          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase font-bold tracking-widest text-[#A5A5A9]">
              Listen
            </label>
            <div className="flex flex-col gap-2">
              {!isPlaying ? (
                <button
                  onClick={play}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-[#1c1c1e] hover:bg-[#2c2c2e] text-white text-sm font-semibold transition cursor-pointer"
                >
                  {speechSynthesis.speaking ? (
                    <RotateCcw className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  <span>{speechSynthesis.speaking ? "Resume" : "Play"}</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={pause}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-[#1c1c1e] hover:bg-[#2c2c2e] text-white text-sm font-semibold transition cursor-pointer"
                  >
                    <Pause className="w-4 h-4" /> <span>Pause</span>
                  </button>
                  <button
                    onClick={stop}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition cursor-pointer"
                  >
                    <Square className="w-4 h-4" /> <span>Stop</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </aside>
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
  );
}


