import React, { useState, useEffect, useRef } from 'react';
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import DOMPurify from "dompurify";

const stripInlineStyles = (htmlString) => {
  return DOMPurify.sanitize(htmlString, { FORBID_ATTR: ["style"] });
};

function ChapterContentRenderer({ chapter, langMap, lang, fontSize, isFirst }) {
  const [posts, setPosts] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const chapterRef = useRef(null);

  const langId = langMap[lang];

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
      <div className="mb-16 text-center">
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
        <div className="space-y-8" style={{ fontSize: `${fontSize}px` }}>
          {posts.length > 0 ? (
            posts.map((post) => (
              <div key={post.id} id={`post-${post.id}`} className="relative group">
                {post.post_title && post.post_title !== chapter.name && (
                  <h4 
                    className="font-semibold mb-4 text-[#001e2d] text-lg"
                    style={{
                      fontFamily: '"Noto Serif", "Noto Serif Fallback", serif',
                      fontStyle: 'normal',
                      fontVariantCaps: 'normal',
                      fontVariantEastAsian: 'normal',
                      fontVariantLigatures: 'none',
                      fontVariantNumeric: 'normal'
                    }}
                  >
                    {post.post_title}
                  </h4>
                )}
                <div
                  className={`leading-[1.8] text-justify space-y-5 text-[#2c2c2c] force-chapter-font font-normal [&_strong]:font-normal [&_b]:font-normal`}
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
            <div className="text-center py-16 text-gray-500 italic bg-white rounded-lg border border-gray-200">
              No text available in this translation.
            </div>
          )}
        </div>
      ) : (
        <div className="py-32 flex justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#cd5c3d] border-t-transparent"></div>
        </div>
      )}
    </div>
  );
}

export default function TranslationTab({ chapters, langMap, lang, fontSize }) {
  return (
    <div className="pb-24">
      {chapters.map((c, index) => (
        <div key={c.id} id={`chapter-${c.id}`}>
          <ChapterContentRenderer
            chapter={c}
            langMap={langMap}
            lang={lang}
            fontSize={fontSize}
            isFirst={index === 0}
          />
        </div>
      ))}
    </div>
  );
}
