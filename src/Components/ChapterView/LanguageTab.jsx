import React, { useState, useEffect, useRef } from 'react';
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import DOMPurify from "dompurify";

const stripInlineStyles = (htmlString) => {
  return DOMPurify.sanitize(htmlString, { FORBID_ATTR: ["style"] });
};

function LanguageChapterRenderer({ chapter, langMap, lang, fontSize, isFirst }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const chapterRef = useRef(null);

  // Find the Firestore language ID for the chosen language
  const targetLangId = langMap[lang] || langMap[`${lang}-EN`] || langMap[`EN-${lang}`] || lang;

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

  const renderSinglePost = (post) => {
    if (!post) return null;
    return (
      <div key={post.id} id={`post-${post.id}`} className="relative group mb-8">
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
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center py-16 w-full">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#cd5c3d] border-t-transparent"></div>
        </div>
      );
    }
    
    if (posts.length === 0) {
      return (
        <div className="py-8 invisible w-full" aria-hidden="true" />
      );
    }

    return (
      <div className="space-y-6">
        {posts.map((post) => renderSinglePost(post))}
      </div>
    );
  };

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
        <div className="flex flex-col" style={{ fontSize: `${fontSize}px` }}>
          {renderContent()}
        </div>
      ) : (
        <div className="py-32 flex justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#cd5c3d] border-t-transparent"></div>
        </div>
      )}
    </div>
  );
}

export default function LanguageTab({ chapters, langMap, lang, fontSize }) {
  return (
    <div className="pb-24">
      {chapters.map((chapter, index) => (
        <div key={chapter.id} id={`chapter-${chapter.id}`}>
          <LanguageChapterRenderer
            chapter={chapter}
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
