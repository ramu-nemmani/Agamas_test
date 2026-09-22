import React from 'react';

export default function LanguageTab({ chapters, langMap, lang, fontSize }) {
  // Mock UI for the parallel language view until backend data structure is ready.
  return (
    <div className="pb-24">
      {chapters.map((chapter, index) => (
        <div key={chapter.id} id={`chapter-${chapter.id}`} className={index === 0 ? "" : "mt-16 pt-16 border-t border-gray-200"}>
          
          {/* Header */}
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
              className="text-2xl md:text-4xl leading-snug text-[#001e2d]"
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

          {/* MOCK PARALLEL UI */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12" style={{ fontSize: `${fontSize}px` }}>
            
            {/* Column 1 (e.g. English) */}
            <div className="space-y-6">
              <h3 className="text-xs font-bold text-gray-400 mb-4 border-b border-gray-200 pb-2 uppercase tracking-[0.1em]">
                English Translation (Mock)
              </h3>
              <p 
                className="leading-[1.8] text-justify text-[#2c2c2c] font-normal" 
                style={{
                  fontFamily: '"Noto Serif", "Noto Serif Fallback", serif',
                  fontStyle: 'normal',
                  fontVariantCaps: 'normal',
                  fontVariantEastAsian: 'normal',
                  fontVariantLigatures: 'none',
                  fontVariantNumeric: 'normal'
                }}
              >
                Thus have I heard. At one time the Buddha was staying at Śrāvastī in Jeta's Grove, Anāthapiṇḍada's Park. At that time, the World-honored One addressed the monks...
              </p>
              <p 
                className="leading-[1.8] text-justify text-[#2c2c2c] font-normal"
                style={{
                  fontFamily: '"Noto Serif", "Noto Serif Fallback", serif',
                  fontStyle: 'normal',
                  fontVariantCaps: 'normal',
                  fontVariantEastAsian: 'normal',
                  fontVariantLigatures: 'none',
                  fontVariantNumeric: 'normal'
                }}
              >
                [This is a placeholder for the parallel language UI. The backend data structure will be updated later to support splitting paragraphs side-by-side.]
              </p>
            </div>

            {/* Column 2 (e.g. Chinese) */}
            <div className="space-y-6">
              <h3 className="text-xs font-bold text-gray-400 mb-4 border-b border-gray-200 pb-2 uppercase tracking-[0.1em]">
                Original Text (Mock)
              </h3>
              <p 
                className="leading-[1.8] text-justify text-[#2c2c2c] font-normal"
                style={{
                  fontFamily: '"Noto Serif", "Noto Serif Fallback", serif',
                  fontStyle: 'normal',
                  fontVariantCaps: 'normal',
                  fontVariantEastAsian: 'normal',
                  fontVariantLigatures: 'none',
                  fontVariantNumeric: 'normal'
                }}
              >
                如是我聞。一時，佛在舍衛國祇樹給孤獨園。爾時，世尊告諸比丘...
              </p>
              <p 
                className="leading-[1.8] text-justify text-[#2c2c2c] font-normal"
                style={{
                  fontFamily: '"Noto Serif", "Noto Serif Fallback", serif',
                  fontStyle: 'normal',
                  fontVariantCaps: 'normal',
                  fontVariantEastAsian: 'normal',
                  fontVariantLigatures: 'none',
                  fontVariantNumeric: 'normal'
                }}
              >
                [這是一個平行語言UI的佔位符。後端數據結構稍後將更新，以支持並排拆分段落。]
              </p>
            </div>

          </div>
        </div>
      ))}
    </div>
  );
}
