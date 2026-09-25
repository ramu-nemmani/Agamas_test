import React, { useState, useEffect, useRef } from 'react';
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import DOMPurify from "dompurify";

const stripInlineStyles = (htmlString) => {
  return DOMPurify.sanitize(htmlString, { FORBID_ATTR: ["style"] });
};

function LanguageChapterRenderer({ chapter, langMap, lang, fontSize, isFirst }) {
  const [enPosts, setEnPosts] = useState([]);
  const [langPosts, setLangPosts] = useState([]);
  const [enLoading, setEnLoading] = useState(true);
  const [langLoading, setLangLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const chapterRef = useRef(null);

  const enLangId = langMap["EN"];
  const selectedLangId = langMap[lang];

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
    if (!enLangId) {
      setEnLoading(false);
      return;
    }
    const fetchEnPosts = async () => {
      try {
        const postQuery = query(
          collection(db, "posts"),
          where("chapterId", "==", chapter.id),
          where("language", "==", enLangId),
          orderBy("position")
        );
        const snapshot = await getDocs(postQuery);
        setEnPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (e) {
        console.error(e);
      } finally {
        setEnLoading(false);
      }
    };
    fetchEnPosts();
  }, [chapter.id, enLangId, isVisible]);

  useEffect(() => {
    if (!isVisible) return;
    if (!selectedLangId) {
      setLangPosts([]);
      setLangLoading(false);
      return;
    }
    const fetchLangPosts = async () => {
      try {
        const postQuery = query(
          collection(db, "posts"),
          where("chapterId", "==", chapter.id),
          where("language", "==", selectedLangId),
          orderBy("position")
        );
        const snapshot = await getDocs(postQuery);
        setLangPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (e) {
        console.error(e);
      } finally {
        setLangLoading(false);
      }
    };
    fetchLangPosts();
  }, [chapter.id, selectedLangId, isVisible]);

  const renderSinglePost = (post) => {
    if (!post) return null;
    return (
      <div className="relative group">
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

  const renderParallelPosts = () => {
    if (enLoading || langLoading) {
      return (
        <div className="flex justify-center py-16 w-full">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#cd5c3d] border-t-transparent"></div>
        </div>
      );
    }
    
    if (enPosts.length === 0 && langPosts.length === 0) {
      return (
        <div className="text-center py-16 text-gray-500 italic bg-white rounded-lg border border-gray-200 w-full">
          No content available.
        </div>
      );
    }

    const maxLength = Math.max(enPosts.length, langPosts.length);
    return Array.from({ length: maxLength }).map((_, i) => (
      <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start border-b border-gray-100 last:border-b-0 pb-8 last:pb-0 mb-8 last:mb-0">
        <div>
          {enPosts[i] ? renderSinglePost(enPosts[i]) : (
            <div className="text-center py-4 text-gray-400 italic">No English translation for this section</div>
          )}
        </div>
        <div>
          {langPosts[i] ? renderSinglePost(langPosts[i]) : (
            <div className="text-center py-4 text-gray-400 italic">No content available in this language</div>
          )}
        </div>
      </div>
    ));
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
          {renderParallelPosts()}
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
