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
  const sanitized = DOMPurify.sanitize(htmlString, { FORBID_ATTR: ["style"] });
  // Remove empty paragraphs/breaks that cause huge vertical white gaps
  return sanitized
    .replace(/<p[^>]*>(\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, "")
    .replace(/(<br\s*\/?>\s*){2,}/gi, "<br/>");
};

function ChapterContentRenderer({ chapter, langMap, lang, fontSize, isFirst, targetChapterId }) {
  const [posts, setPosts] = useState([]);
  const [isVisible, setIsVisible] = useState(chapter.id === targetChapterId);
  const chapterRef = useRef(null);

  const langId = langMap[lang];

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

  useEffect(() => {
    if (!isVisible) return;
    if (!langId) return;
    const fetchPosts = async () => {
      try {
        const postQuery = query(
          collection(db, "posts"),
          where("chapterId", "==", chapter.id),
          where("language", "==", langId),
          orderBy("position")
        );
        const snapshot = await getDocs(postQuery);
        setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (e) {
        console.error(e);
      }
    };
    fetchPosts();
  }, [chapter.id, langId, isVisible]);

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
        <div className="space-y-4" style={{ fontSize: `${fontSize}px` }}>
          {posts.length > 0 ? (
            posts.map((post) => (
              <div key={post.id} id={`post-${post.id}`} data-post-position={post.position} className="relative group">
                {post.post_title && post.post_title !== chapter.name && (
                  <h4 
                    className="font-semibold mb-2 text-[#001e2d] text-base md:text-lg"
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
            ))
          ) : (
            <div className="py-8 invisible" aria-hidden="true" />
          )}
        </div>
      ) : (
        <div className="py-16 flex justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#cd5c3d] border-t-transparent"></div>
        </div>
      )}
    </div>
  );
}

export default function TranslationTab({ chapters, currentChapterId, langMap, lang, fontSize, targetChapterId }) {
  // If currentChapterId is provided, render only the selected chapter
  const displayChapters = currentChapterId 
    ? chapters.filter(c => c.id === currentChapterId) 
    : chapters;

  return (
    <div className="pb-24">
      {displayChapters.map((c, index) => (
        <div key={c.id} id={`chapter-${c.id}`}>
          <ChapterContentRenderer
            chapter={c}
            langMap={langMap}
            lang={lang}
            fontSize={fontSize}
            isFirst={index === 0}
            targetChapterId={targetChapterId}
          />
        </div>
      ))}
    </div>
  );
}
