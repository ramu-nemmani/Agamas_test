import { useState } from "react";
import { Feather } from "lucide-react";

export default function BookCover({ imageUrl, title, author, className = "", innerClassName = "", variant = "normal" }) {
  const [imgError, setImgError] = useState(false);

  if (imageUrl && !imgError) {
    if (variant === "large") {
      return (
        <div className={`rmsp-book-cover relative h-full w-full rounded-2xl overflow-hidden shadow-[0_8px_20px_rgba(0,0,0,0.15)] aspect-[2/3] max-w-[400px] ${className}`}>
           <img
             src={imageUrl}
             alt={title}
             className={`h-full w-full object-cover ${innerClassName}`}
             onError={() => setImgError(true)}
           />
        </div>
      );
    }
    
    return (
      <img
        src={imageUrl}
        alt={title}
        className={`h-full w-full object-cover aspect-[2/3] ${className} ${innerClassName}`}
        onError={() => setImgError(true)}
      />
    );
  }

  if (variant === "large") {
    return (
      <div className={`rmsp-book-cover relative h-full w-full bg-[#eee5da] p-6 flex flex-col justify-between items-center text-[#001e2d] rounded-2xl overflow-hidden shadow-[0_8px_20px_rgba(0,0,0,0.15)] aspect-[2/3] max-w-[400px] ${className} ${innerClassName}`}>
        <div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-black/60 via-black/25 to-transparent z-10"></div>
        <div className="absolute inset-y-0 left-4 w-[1px] bg-white/10 z-10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(#d3c6b5_1px,transparent_1px)] [background-size:16px_16px] opacity-35"></div>
        <div className="absolute inset-3 border border-[#001e2d]/10 rounded-xl pointer-events-none"></div>
        <div className="absolute inset-4 border border-[#001e2d]/5 rounded-xl pointer-events-none"></div>
        
        <div className="z-10 mt-10 flex flex-col items-center">
          <span className="text-[10px] md:text-xs uppercase tracking-[0.25em] font-semibold text-[#001e2d]/60 font-sans text-center">
            Sacred Scripture
          </span>
          <div className="my-3 h-[1px] w-12 bg-[#001e2d]/10"></div>
        </div>
        
        <div className="z-10 text-center px-4 flex flex-col items-center justify-center flex-1 w-full">
          <h3 className="font-serif text-xl md:text-2xl font-bold leading-snug tracking-wide text-[#001e2d] break-words">
            {title}
          </h3>
          {author && (
            <p className="mt-3 font-serif text-[13px] md:text-sm italic tracking-wide text-[#001e2d]/70">
              {author}
            </p>
          )}
        </div>
        
        <div className="z-10 mb-8 flex flex-col items-center">
          <Feather className="h-5 w-5 text-[#001e2d]/30" />
          <div className="mt-2 text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-[#001e2d]/40 font-semibold font-sans">
            SIF Library
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative h-full w-full bg-[#eee5da] p-4 flex flex-col justify-between items-center text-[#001e2d] ${className} ${innerClassName}`}>
      <div className="absolute inset-0 bg-[radial-gradient(#d3c6b5_1px,transparent_1px)] [background-size:16px_16px] opacity-35" />
      <div className="absolute inset-2 border border-[#001e2d]/10 rounded-lg pointer-events-none" />
      <div className="absolute inset-3 border border-[#001e2d]/5 rounded-lg pointer-events-none" />

      <div className="z-10 mt-6 flex flex-col items-center">
        <span className="text-[9px] uppercase tracking-[0.25em] font-semibold text-[#001e2d]/60 font-sans text-center">
          Sacred Scripture
        </span>
        <div className="my-2 h-[1px] w-8 bg-[#001e2d]/10" />
      </div>

      <div className="z-10 text-center px-2 flex flex-col items-center justify-center flex-1 w-full">
        <h3 className="font-serif text-base font-bold leading-snug tracking-wide text-[#001e2d] transition-colors break-words">
          {title}
        </h3>
        {author && (
          <p className="mt-2 text-[#001e2d]/70 text-[10px] font-medium leading-tight text-center font-sans">
            {author.split("(")[0].trim()}<br />
            {author.includes("(") && <span className="text-[#666] font-normal italic">({author.split("(")[1]}</span>}
          </p>
        )}
      </div>

      <div className="z-10 mb-6 flex flex-col items-center">
        <Feather className="h-4 w-4 text-[#001e2d]/30" />
        <div className="mt-2 text-[8px] uppercase tracking-[0.2em] text-[#001e2d]/40 font-semibold font-sans text-center">
          SIF Library
        </div>
      </div>
    </div>
  );
}
