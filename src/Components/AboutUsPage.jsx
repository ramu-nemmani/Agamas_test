import SEO from "./SEO";
import { Link } from "react-router-dom";
import drLimImg from "../assets/DRLim.webp";

export default function AboutUsPage() {
  const handleScrollToChapters = () => {
    const section = document.getElementById("chapters");
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-[#fdf8f4] text-[#0a0a0a] font-sans pb-6">
      <SEO
        title="About The Agamas | Ancient Dhamma Wisdom and Agama Teachings"
        description="Learn about The Agamas, a digital platform dedicated to preserving and sharing ancient Agama Dhamma scriptures, mindfulness teachings, Dharma wisdom, and contemplative guidance in English and Chinese."
        name="The Agamas"
        type="website"
      />

      {/* ── 1. MISSION HEADER ───────────────────────────────────────────── */}
      <section className="pt-8 md:pt-12 pb-12 relative">
        {/* Back to Home Button aligned with Navbar */}
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 w-full mb-6 md:mb-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[11px] md:text-xs font-bold tracking-widest text-[rgb(205,92,61)] uppercase hover:opacity-80 transition-opacity"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Home
          </Link>
        </div>

        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-full mx-auto text-center overflow-visible">
            <p className="text-[16px] font-bold text-[#64748b] font-sans uppercase tracking-[0.2em] mb-4 md:mb-6">
              our mission
            </p>
            <h1
              className="text-[32px] md:text-[52px] font-normal text-[#0f2e3d] tracking-tight leading-[1.2] mb-6 md:mb-8 md:whitespace-nowrap"
              style={{ fontFamily: '"PP Fragment Glare Regular", Georgia, serif' }}
            >
              Preserving Timeless Wisdom <span className="text-[rgb(205,92,61)] italic">for Modern Seekers.</span>
            </h1>
            <p className="max-w-4xl mx-auto text-[#555] text-[24px] font-normal font-sans leading-relaxed">
              The Agamas is a dedicated digital platform created to preserve,
              organize, and share the timeless teachings of the Agama scriptures,
              making them easily accessible, readable, and entirely free for students
              and researchers worldwide.
            </p>
          </div>
        </div>
      </section>

      {/* ── 2. FEATURE CARDS ───────────────────────────────────────────── */}
      <section className="pb-8 md:pb-12">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 grid gap-6 sm:grid-cols-2">
          {/* Card 1 */}
          <div className="rounded-3xl bg-[#fffdf8] border border-[#ECECEC] p-6 sm:p-8 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-800 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-book-open h-5 w-5" aria-hidden="true"><path d="M12 7v14"></path><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"></path></svg>
            </div>
            <h3 style={{ fontFamily: '"PP Fragment Glare Regular", Georgia, serif', fontSize: '20px', fontWeight: 'bold', color: 'rgb(0, 30, 45)' }}>
              Digital Preservation
            </h3>
            <p className="text-[#001e2d]/70 text-[16px] leading-relaxed font-sans mt-2">
              Safeguarding vulnerable ancient manuscripts and translating Sanskrit, Pali, and Tamil palm-leaf scriptures into clean, modern formats to ensure they remain alive for generations to come.
            </p>
          </div>

          {/* Card 2 */}
          <div className="rounded-3xl bg-[#fffdf8] border border-[#ECECEC] p-6 sm:p-8 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-800 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users h-5 w-5" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><path d="M16 3.128a4 4 0 0 1 0 7.744"></path><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><circle cx="9" cy="7" r="4"></circle></svg>
            </div>
            <h3 style={{ fontFamily: '"PP Fragment Glare Regular", Georgia, serif', fontSize: '20px', fontWeight: 'bold', color: 'rgb(0, 30, 45)' }}>
              Accessible Study
            </h3>
            <p className="text-[#001e2d]/70 text-[16px] leading-relaxed font-sans mt-2">
              Providing standard translations, readable digital slides, and bilingual views that bridges the gap between deep academic research and everyday spiritual reflection.
            </p>
          </div>

          {/* Card 3 */}
          <div className="rounded-3xl bg-[#fffdf8] border border-[#ECECEC] p-6 sm:p-8 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-800 mb-4">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h3 style={{ fontFamily: '"PP Fragment Glare Regular", Georgia, serif', fontSize: '20px', fontWeight: 'bold', color: 'rgb(0, 30, 45)' }}>
              Agama Text Collection
            </h3>
            <p className="text-[#001e2d]/70 text-[16px] leading-relaxed font-sans mt-2">
              Explore a growing collection of Agama writings arranged chapter-wise and topic-wise for easy reading.
            </p>
          </div>

          {/* Card 4 */}
          <div className="rounded-3xl bg-[#fffdf8] border border-[#ECECEC] p-6 sm:p-8 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-800 mb-4">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 5c-.975-3.3-3.036-6.3-6.088-8.5m5.412 8.5H3m14 1a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 style={{ fontFamily: '"PP Fragment Glare Regular", Georgia, serif', fontSize: '20px', fontWeight: 'bold', color: 'rgb(0, 30, 45)' }}>
              English and Chinese Access
            </h3>
            <p className="text-[#001e2d]/70 text-[16px] leading-relaxed font-sans mt-2">
              Read selected texts in English and Chinese, helping users from different backgrounds connect with the teachings.
            </p>
          </div>
        </div>
      </section>

      {/* ── 3. TEACHER CARD ────────────────────────────────────────────── */}
      <section className="pb-8 md:pb-12">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-[#fffdf8] border border-[#ECECEC] p-6 sm:p-10 shadow-sm">
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
              <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-full ring-2 ring-slate-100 bg-slate-100">
                <img
                  alt="Datuk Dr. Lim Siow Jin"
                  className="h-full w-full object-cover"
                  src={drLimImg}
                />
              </div>
              <div className="space-y-4 text-center sm:text-left">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#001e2d]/60">
                    The Guiding Teacher
                  </span>
                  <h2
                    className="mt-1"
                    style={{ fontFamily: '"PP Fragment Glare Regular", Georgia, serif', fontSize: '24px', fontWeight: 'bold', color: 'rgb(0, 30, 45)' }}
                  >
                    Datuk Dr Lim Siow Jin (Acharya Nagajiva)
                  </h2>
                </div>
                <p className="text-[#001e2d]/70 text-[16px] leading-relaxed font-sans">
                  Founder of DXN and Sunyatee International Foundation, Datuk Dr Lim has devoted decades to studying, researching, and preserving the timeless teachings of the Buddha and India's ancient seers. This project grows out of his deep wish that the timeless, peaceful wisdom of these ancient sutras remains freely and widely available to everyone who seeks it.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. WHY WE ARE DOING THIS ─────────────────────────────────────── */}
      <section className="px-6 pb-8 md:pb-12">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6 text-[#001e2d]/70 text-[16px] font-normal leading-relaxed font-sans">
            <h3
              className="mb-4"
              style={{ fontFamily: '"PP Fragment Glare Regular", Georgia, serif', fontSize: '24px', fontWeight: 700, color: 'rgb(0, 30, 45)' }}
            >
              Why We Are Doing This
            </h3>
            <p>
              Ancient manuscripts represent the peak of human reflection on consciousness, mindfulness, and our connection to all living beings. Yet, many of these texts are buried in locked archives, written in obsolete languages, or decaying physically on fragile palm leaves.
            </p>
            <p>
              By combining state-of-the-art high-resolution palm-leaf preservation, rigorous classical scholarly translations, and modern, responsive digital design, the Sunyatee International Foundation aims to break down these barriers. Every page on this platform is completely ad-free, open-access, and built to promote inner peace, mindfulness, and reflective learning.
            </p>
          </div>
        </div>
      </section>

      {/* ── 5. CALL TO ACTION ──────────────────────────────────────────── */}
      <section className="pb-12">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="pt-8 border-t border-[#001e2d]/10 text-center">
            <Link
              to="/"
              onClick={handleScrollToChapters}
              className="inline-flex items-center justify-center rounded-full bg-[rgb(205,92,61)] px-6 py-3 text-[16px] font-semibold text-white shadow-sm hover:opacity-90 transition active:scale-[0.98] font-sans"
            >
              Explore the Agamas Library
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
