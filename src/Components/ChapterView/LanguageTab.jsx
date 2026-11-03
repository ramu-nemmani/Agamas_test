import React, { useState, useEffect, useRef } from 'react';
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import DOMPurify from "dompurify";

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

const stripInlineStyles = (htmlString) => {
  if (!htmlString) return "";
  let sanitized = DOMPurify.sanitize(htmlString, { FORBID_ATTR: ["style"] });
  
  // Recursively remove empty tags or tags that only contain &nbsp;, <br>, whitespace
  let prev;
  do {
    prev = sanitized;
    sanitized = sanitized.replace(/<(p|h[1-6]|div|span|strong|b|em|i)[^>]*>\s*(?:&nbsp;|<br\s*\/?>|\s)*<\/\1>/gi, "");
    sanitized = sanitized.replace(/<p[^>]*>\s*<br\s*\/?>/gi, "<p>");
    sanitized = sanitized.replace(/<br\s*\/?>\s*<\/p>/gi, "</p>");
    sanitized = sanitized.replace(/(?:<br\s*\/?>\s*){2,}/gi, "<br/>");
  } while (sanitized !== prev);

  return sanitized.trim();
};

function LanguageChapterRenderer({ chapter, langMap, lang, fontSize, isFirst, targetChapterId, viewMode, dualLang1, dualLang2, languages }) {
  const [posts, setPosts] = useState([]);
  const [enPosts, setEnPosts] = useState([]);
  const [l1Posts, setL1Posts] = useState([]);
  const [l2Posts, setL2Posts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enLoading, setEnLoading] = useState(false);
  const [l1Loading, setL1Loading] = useState(false);
  const [l2Loading, setL2Loading] = useState(false);
  const [isVisible, setIsVisible] = useState(chapter.id === targetChapterId);
  const chapterRef = useRef(null);

  // Find the Firestore language ID for the chosen language
  const targetLangId = langMap[lang] || langMap[`${lang}-EN`] || langMap[`EN-${lang}`] || lang;
  const enLangId = langMap["EN"];

  // Helper to resolve Firestore language ID for any shortForm
  const getLangId = (code) => {
    if (!code) return null;
    return langMap[code] || langMap[`${code}-EN`] || langMap[`EN-${code}`] || langMap[code.toUpperCase()] || code;
  };

  const l1Id = getLangId(dualLang1 || "EN");
  const l2Id = getLangId(dualLang2 || (lang !== "EN" ? lang : "HI"));

  useEffect(() => {
    if (chapter.id === targetChapterId) {
      setIsVisible(true);
    }
  }, [chapter.id, targetChapterId]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "1000px 0px" }
    );
    if (chapterRef.current) {
      observer.observe(chapterRef.current);
    }
    return () => observer.disconnect();
  }, []);

  // Fetch chosen language posts
  useEffect(() => {
    if (!isVisible) return;
    if (!targetLangId) {
      setPosts([]);
      setLoading(false);
      return;
    }
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const postQuery = query(
          collection(db, "posts"),
          where("chapterId", "==", chapter.id),
          where("language", "==", targetLangId),
          orderBy("position")
        );
        const snapshot = await getDocs(postQuery);
        setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [chapter.id, targetLangId, isVisible]);

  // When viewMode is "parallel" or "dual", fetch L1 and L2 posts
  useEffect(() => {
    if (!isVisible) return;
    if (viewMode !== "parallel" && viewMode !== "dual") return;

    if (!l1Id) {
      setL1Posts([]);
      setL1Loading(false);
    } else {
      const fetchL1 = async () => {
        try {
          setL1Loading(true);
          const postQuery = query(
            collection(db, "posts"),
            where("chapterId", "==", chapter.id),
            where("language", "==", l1Id),
            orderBy("position")
          );
          const snapshot = await getDocs(postQuery);
          setL1Posts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (e) {
          console.error("Error fetching L1 posts:", e);
        } finally {
          setL1Loading(false);
        }
      };
      fetchL1();
    }

    if (!l2Id) {
      setL2Posts([]);
      setL2Loading(false);
    } else {
      const fetchL2 = async () => {
        try {
          setL2Loading(true);
          const postQuery = query(
            collection(db, "posts"),
            where("chapterId", "==", chapter.id),
            where("language", "==", l2Id),
            orderBy("position")
          );
          const snapshot = await getDocs(postQuery);
          setL2Posts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (e) {
          console.error("Error fetching L2 posts:", e);
        } finally {
          setL2Loading(false);
        }
      };
      fetchL2();
    }
  }, [chapter.id, l1Id, l2Id, isVisible, viewMode]);

  // Dual mode uses L1 and L2 posts directly via dualLang1 and dualLang2


  const renderSinglePost = (post, tag = "", isDual = false) => {
    if (!post) return null;
    return (
      <div key={post.id} id={`post-${post.id}`} data-post-position={post.position} className="relative group mb-4">
        {tag && (
          isDual ? (
            <div className="mb-4">
              <span className="text-xs uppercase font-semibold tracking-wider text-[#cd5c3d]">
                {tag}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-gray-100 text-[#cd5c3d]">
                {tag}
              </span>
            </div>
          )
        )}
        {post.post_title && post.post_title !== chapter.name && (
          <h4 
            className="font-semibold text-[#001e2d] text-base md:text-lg mb-3"
            style={{
              fontFamily: '"Noto Serif", "Noto Serif Fallback", serif',
              fontStyle: 'normal',
              fontVariantCaps: 'normal',
              fontVariantEastAsian: 'normal',
              fontVariantLigatures: 'none',
              fontVariantNumeric: 'normal'
            }}
          >
            {cleanPostTitle(post.post_title)}
          </h4>
        )}
        <div
          className={`leading-[1.8] text-justify space-y-3 text-[#2c2c2c] force-chapter-font font-normal [&_strong]:font-normal [&_b]:font-normal [&_p]:mb-3 [&_p:last-child]:mb-0`}
          style={{
            fontFamily: '"Noto Serif", "Noto Serif Fallback", serif',
            fontStyle: 'normal',
            fontVariantCaps: 'normal',
            fontVariantEastAsian: 'normal',
            fontVariantLigatures: 'none',
            fontVariantNumeric: 'normal'
          }}
          dangerouslySetInnerHTML={{
            __html: stripInlineStyles(post.post_content)
          }}
        />
      </div>
    );
  };

  const renderContent = () => {
    // In Parallel mode, check l1Loading & l2Loading
    if (viewMode === "parallel") {
      if (l1Loading || l2Loading) {
        return (
          <div className="flex justify-center py-16 w-full">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#cd5c3d] border-t-transparent"></div>
          </div>
        );
      }

      if (l1Posts.length === 0 && l2Posts.length === 0) {
        return (
          <div className="py-8 invisible w-full" aria-hidden="true" />
        );
      }

      const l1Name = languages?.find(l => l.shortForm === dualLang1)?.name || dualLang1;
      const l2Name = languages?.find(l => l.shortForm === dualLang2)?.name || dualLang2;
      const maxLength = Math.max(l1Posts.length, l2Posts.length);

      return (
        <div className="space-y-8">
          {Array.from({ length: maxLength }).map((_, i) => {
            const postL1 = l1Posts[i];
            const postL2 = l2Posts[i];
            const postId = postL1?.id || postL2?.id;

            return (
              <div
                key={postId || i}
                id={postId ? `post-${postId}` : undefined}
                data-post-position={postL1?.position ?? postL2?.position ?? (i + 1)}
                className="space-y-4 pb-8 border-b border-gray-100 last:border-b-0"
              >
                {/* Primary Language (L1) */}
                {postL1 && renderSinglePost(postL1, l1Name)}

                {/* Secondary Language (L2) directly beneath */}
                {postL2 && renderSinglePost(postL2, l2Name)}
              </div>
            );
          })}
        </div>
      );
    }

    if (loading || (enLoading && viewMode === "dual")) {
      return (
        <div className="flex justify-center py-16 w-full">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#cd5c3d] border-t-transparent"></div>
        </div>
      );
    }
    
    if (posts.length === 0 && enPosts.length === 0) {
      return (
        <div className="py-8 invisible w-full" aria-hidden="true" />
      );
    }

    // Dual Mode: Side-by-side columns using Language 1 and Language 2
    if (viewMode === "dual") {
      if (l1Loading || l2Loading) {
        return (
          <div className="flex justify-center py-16 w-full">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#cd5c3d] border-t-transparent"></div>
          </div>
        );
      }

      if (l1Posts.length === 0 && l2Posts.length === 0) {
        return (
          <div className="py-8 invisible w-full" aria-hidden="true" />
        );
      }

      const l1Name = languages?.find(l => l.shortForm === dualLang1)?.name || dualLang1;
      const l2Name = languages?.find(l => l.shortForm === dualLang2)?.name || dualLang2;
      const maxCount = Math.max(l1Posts.length, l2Posts.length);

      return (
        <div className="space-y-8">
          {Array.from({ length: maxCount }).map((_, i) => (
            <div key={i} className="relative grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-start pb-10 mb-8 border-b border-gray-200 last:border-b-0 last:pb-0 last:mb-0">
              {/* Vertical divider line between columns on medium and larger screens */}
              <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[1px] bg-gray-200 -translate-x-1/2" aria-hidden="true" />

              <div className="w-full">
                {l1Posts[i] ? (
                  renderSinglePost(l1Posts[i], i === 0 ? l1Name : "", true)
                ) : (
                  <div className="py-4 text-xs text-gray-400 italic">No content in {l1Name} for this section</div>
                )}
              </div>
              <div className="w-full">
                {l2Posts[i] ? (
                  renderSinglePost(l2Posts[i], i === 0 ? l2Name : "", true)
                ) : (
                  <div className="py-4 text-xs text-gray-400 italic">No content in {l2Name} for this section</div>
                )}
              </div>
            </div>
          ))}
        </div>
      );
    }

    // Default: None (Single language display)
    return (
      <div className="space-y-4">
        {posts.map((post) => renderSinglePost(post))}
      </div>
    );
  };

  return (
    <div ref={chapterRef} className={isFirst ? "" : "mt-16 pt-16 border-t border-gray-200"}>
      <div className="mb-14 text-center">
        <div 
          className="text-xs text-gray-500 mb-6 uppercase tracking-[0.2em]"
          style={{
            fontFamily: '"Noto Serif", "Noto Serif Fallback", serif',
            fontStyle: 'normal',
            fontVariantCaps: 'normal',
            fontVariantEastAsian: 'normal',
            fontVariantLigatures: 'none',
            fontVariantNumeric: 'normal',
            fontWeight: 600
          }}
        >
          Chapter {chapter.position}
        </div>
        <h1
          className="text-xl md:text-3xl leading-snug text-[#001e2d]"
          style={{
            fontFamily: '"Noto Serif", "Noto Serif Fallback", serif',
            fontStyle: 'normal',
            fontVariantCaps: 'normal',
            fontVariantEastAsian: 'normal',
            fontVariantLigatures: 'none',
            fontVariantNumeric: 'normal',
            fontWeight: 600
          }}
        >
          {chapter.name?.replace(/^Chapter\s+[0-9]+:/i, '').trim() || chapter.name}
        </h1>
      </div>

      {isVisible ? (
        <div className="flex flex-col" style={{ fontSize: `${fontSize}px` }}>
          {renderContent()}
        </div>
      ) : (
        <div className="py-16 flex justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#cd5c3d] border-t-transparent"></div>
        </div>
      )}
    </div>
  );
}

export default function LanguageTab({ chapters, currentChapterId, langMap, lang, fontSize, targetChapterId, viewMode, dualLang1, dualLang2, languages }) {
  // If currentChapterId is provided, render only the selected chapter
  const displayChapters = currentChapterId 
    ? chapters.filter(c => c.id === currentChapterId) 
    : chapters;

  return (
    <div className="pb-24">
      {displayChapters.map((chapter, index) => (
        <div key={chapter.id} id={`chapter-${chapter.id}`}>
          <LanguageChapterRenderer
            chapter={chapter}
            langMap={langMap}
            lang={lang}
            fontSize={fontSize}
            isFirst={index === 0}
            targetChapterId={targetChapterId}
            viewMode={viewMode}
            dualLang1={dualLang1}
            dualLang2={dualLang2}
            languages={languages}
          />
        </div>
      ))}
    </div>
  );
}
