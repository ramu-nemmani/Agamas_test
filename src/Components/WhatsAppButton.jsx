import { useEffect, useState } from "react";

const WhatsAppButton = () => {
  const [showBubble, setShowBubble] = useState(false);
  const [wobble, setWobble] = useState(false);

  useEffect(() => {
    // Show speech bubble after 2.5 seconds
    const timer = setTimeout(() => {
      setShowBubble(true);
    }, 2500);

    // Trigger wobble animation every 6 seconds
    const interval = setInterval(() => {
      setWobble(true);
      setTimeout(() => {
        setWobble(false);
      }, 1500);
    }, 6000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  return (
    <div
      className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end"
      onMouseLeave={() => setShowBubble(false)}
    >
      {/* Embedded CSS Animations */}
      <style>{`
        .wa-pulse-1 {
          animation: wa-pulse 2s infinite;
        }
        .wa-pulse-2 {
          animation: wa-pulse 2s infinite 0.8s;
        }
        .wa-float {
          animation: wa-float 4s ease-in-out infinite;
        }
        .wa-wobble {
          animation: wa-wobble 1.2s ease-in-out;
        }
        .wa-wave-hand {
          animation: wa-wave 2s ease-in-out infinite;
          transform-origin: 70% 70%;
          display: inline-block;
        }
        @keyframes wa-pulse {
          0% {
            transform: scale(1);
            opacity: 0.6;
          }
          100% {
            transform: scale(1.7);
            opacity: 0;
          }
        }
        @keyframes wa-float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        @keyframes wa-wobble {
          0%, 100% { transform: rotate(0deg); }
          15% { transform: rotate(-12deg) scale(1.08); }
          30% { transform: rotate(10deg) scale(1.08); }
          45% { transform: rotate(-8deg) scale(1.08); }
          60% { transform: rotate(6deg) scale(1.08); }
          75% { transform: rotate(-3deg) scale(1.08); }
        }
        @keyframes wa-wave {
          0%, 100% { transform: rotate(0deg); }
          20%, 60% { transform: rotate(-12deg); }
          40%, 80% { transform: rotate(14deg); }
        }
      `}</style>

      {/* Dismissible Preview Chat Card */}
      {showBubble && (
        <div className="mb-4 w-64 bg-white rounded-2xl shadow-2xl border border-[#e8e0d8] p-5 transition-all duration-300 relative select-none flex flex-col items-center text-center">
          {/* Close button */}
          <button
            onClick={() => setShowBubble(false)}
            className="absolute top-3.5 right-3.5 text-[#a0a0a0] hover:text-[#cd5c3d] text-xs font-semibold p-1 transition-colors"
            aria-label="Close"
          >
            ✕
          </button>

          {/* Waving Hand Emoji */}
          <div className="mb-3 text-5xl">
            <span className="wa-wave-hand">👋</span>
          </div>

          {/* Heading */}
          <h4 className="text-sm font-bold text-[#1e1e1e] font-sans mb-1.5">
            What are you looking for?
          </h4>

          {/* Description */}
          <p className="text-[11px] text-[#666] leading-relaxed mb-4 font-sans">
            Feel free to ask your questions here. We are always ready to assist
            you all the time whenever you need.
          </p>

          {/* Button inside card */}
          <a
            href="https://wa.me/919030258383"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#f4f7fa] hover:bg-[#eef2f6] text-[#0066cc] font-medium py-2.5 px-3 rounded-full flex items-center justify-center gap-1.5 border border-[#e0e8f0] transition-colors text-xs font-sans"
          >
            {/* Blue speech icon */}
            <svg
              className="w-3.5 h-3.5 text-[#0066cc]"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z" />
            </svg>
            Ask your question
          </a>
        </div>
      )}

      {/* Action Buttons Row */}
      <div className="flex items-center justify-end">
        {/* Pulsing Glowing Button Container */}
        <div
          className="relative wa-float"
          onMouseEnter={() => setShowBubble(true)}
        >
          {/* Pulsing Halos */}
          <div className="absolute inset-0 rounded-full bg-[#25D366] wa-pulse-1 pointer-events-none" />
          <div className="absolute inset-0 rounded-full bg-[#25D366] wa-pulse-2 pointer-events-none" />

          {/* Floating WhatsApp Action Button */}
          <a
            href="https://wa.me/919030258383"
            target="_blank"
            rel="noopener noreferrer"
            className={`relative z-10 w-14 h-14 bg-[#25D366] text-white rounded-full shadow-2xl hover:scale-110 transition-transform duration-300 flex items-center justify-center group ${
              wobble ? "wa-wobble" : ""
            }`}
            aria-label="Chat on WhatsApp"
          >
            <svg
              viewBox="0 0 24 24"
              width="28"
              height="28"
              stroke="currentColor"
              strokeWidth="0"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>

            {/* Simple slide-out label */}
            <span className="absolute right-full mr-4 bg-[#1e1e1e] text-white text-xs px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl border border-white/10">
              Chat on WhatsApp
            </span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppButton;
