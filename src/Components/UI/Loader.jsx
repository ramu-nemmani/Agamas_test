import { useEffect, useState } from "react";

const words = ["Agamas", "阿伽马斯", "आगमस"];

const Loader = () => {
  const [displayText, setDisplayText] = useState("");
  const [current, setCurrent] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = words[current];
    let timeout;

    if (!deleting && displayText === word) {
      timeout = setTimeout(() => setDeleting(true), 1200);
    } else if (deleting && displayText === "") {
      setDeleting(false);
      setCurrent((c) => (c + 1) % words.length);
    } else {
      timeout = setTimeout(() => {
        setDisplayText((prev) =>
          deleting ? prev.slice(0, -1) : word.slice(0, prev.length + 1)
        );
      }, deleting ? 60 : 100);
    }

    return () => clearTimeout(timeout);
  }, [displayText, deleting, current]);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#fdf8f4]">
      {/* Decorative radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#cd5c3d0a] rounded-full blur-3xl" />
      </div>

      {/* Ornamental top stripe */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#cd5c3d] to-transparent opacity-60" />

      <div className="relative text-center px-8">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 bg-[#cd5c3d12] border border-[#cd5c3d30] text-[#cd5c3d] text-xs font-semibold tracking-widest uppercase rounded-full px-4 py-1.5 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#cd5c3d] inline-block animate-pulse" />
          Loading
        </div>

        {/* Animated word */}
        <h1
          className="text-4xl md:text-5xl font-light text-[#1e1e1e] tracking-tight min-h-[1.4em]"
          style={{ fontFamily: "'Lora', Georgia, serif" }}
        >
          <span className="text-[#cd5c3d] font-semibold">{displayText}</span>
          <span className="blinking-cursor text-[#cd5c3d]">|</span>
        </h1>

        {/* Subtitle */}
        <p className="text-sm text-[#aaa] mt-4 tracking-wide">
          A Translation As It Is
        </p>

        {/* Ornamental divider */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#cd5c3d50]" />
          <span className="text-[#cd5c3d] text-base select-none">❧</span>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#cd5c3d50]" />
        </div>
      </div>
    </div>
  );
};

export default Loader;
