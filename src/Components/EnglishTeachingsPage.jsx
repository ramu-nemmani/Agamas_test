import SEO from "./SEO";
import { Link } from "react-router-dom";

export default function EnglishTeachingsPage() {
  const handleScrollToChapters = () => {
    setTimeout(() => {
      const section = document.getElementById("chapters");
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  const teachingPillars = [
    {
      title: "Literal Translation ('As It Is')",
      desc: "Translating classical text structures with precision, avoiding modern interpretations or personal biases to maintain the direct essence of early teachings.",
      icon: (
        <svg className="w-5 h-5 text-[#cd5c3d]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
      )
    },
    {
      title: "Clarity & Simplicity",
      desc: "Presenting complex Buddhist scriptures in clean, modern English. Useful for students, meditation practitioners, and researchers alike.",
      icon: (
        <svg className="w-5 h-5 text-[#cd5c3d]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l8.904-4.43m-8.904-.666L17 7.5m-8.904 7.738L3.063 6.227A1.218 1.218 0 013 5.5V4.5A1.5 1.5 0 014.5 3h1.363c.484 0 .942.235 1.227.636l4.223 6.035" />
        </svg>
      )
    },
    {
      title: "Guide to Practice",
      desc: "Focusing on scriptures that directly explain moral development (Śīla), mindful observation (Smṛti), concentration (Samādhi), and liberating insight (Prajñā).",
      icon: (
        <svg className="w-5 h-5 text-[#cd5c3d]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-[#fdf8f4] text-[#0a0a0a] font-sans pb-16 md:pb-24">
      <SEO
        title="English Agama Teachings | Study Early Buddhist Scriptures"
        description="Read selected Agama sutra translations, commentaries, and guides in English. Access clear teachings on mindfulness, morality, and wisdom."
        name="The Agamas"
        type="website"
      />

      {/* Hero Section */}
      <section className="relative pt-8 md:pt-10 pb-8 md:pb-10 overflow-hidden border-b border-[#e8e0d8]/40">
        <div className="absolute inset-0 bg-gradient-to-br from-[#fdf3ec] via-[#fdf8f4] to-[#f5ede4] pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-[#cd5c3d0d] rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-[#cd5c3d0d] border border-[#cd5c3d1a] rounded-full px-3.5 py-1 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#cd5c3d] inline-block" />
            <span className="text-[11px] font-semibold tracking-wider text-[#cd5c3d] uppercase">Translations</span>
          </div>
          <h1 className="text-4xl md:text-5.5xl font-light text-[#1e1e1e] tracking-tight leading-tight mb-4 font-serif-display">
            English <span className="text-[#cd5c3d] font-semibold">Teachings</span>
          </h1>
          <div className="flex items-center justify-center gap-3 my-5">
            <div className="h-px w-16 bg-[#e8e0d8]" />
            <span className="text-[#cd5c3d] text-sm">❧</span>
            <div className="h-px w-16 bg-[#e8e0d8]" />
          </div>
          <p className="max-w-2xl mx-auto text-[#555] text-base md:text-lg leading-relaxed">
            Bringing ancient wisdom to English-speaking readers with literal precision, preserving semantic intent and original textual guidance.
          </p>
        </div>
      </section>

      {/* Intro section */}
      <section className="py-16 md:py-20 border-b border-[#e8e0d8]/40 bg-[#fdfdfd]/50">
        <div className="max-w-screen-md mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-light text-[#1e1e1e] font-serif-display text-center mb-6">
            Translating the Dharma for the <span className="text-[#cd5c3d] font-semibold">Modern World</span>
          </h2>
          <p className="text-base md:text-lg leading-relaxed text-[#555] mb-6">
            For centuries, the Agama scriptures have been preserved primarily in classical languages like Classical Chinese, Tibetan, and reconstructed Sanskrit fragments. The unavailability of these texts in English has left a gap in the study of early Buddhism for global practitioners.
          </p>
          <p className="text-base md:text-lg leading-relaxed text-[#555]">
            Our platform bridges this gap by offering high-quality, verified English translations. By working under the continuous guidance of experienced teachers and scholars, we ensure the translated English sutras match the exact depth and instructions of the original scriptures.
          </p>
        </div>
      </section>

      {/* Design Grid */}
      <section className="bg-[#f5ede4] py-20 border-b border-[#e8e0d8]/60">
        <div className="max-w-screen-xl mx-auto px-6 md:px-10">
          <div className="text-center mb-16">
            <span className="text-[11px] font-bold tracking-widest text-[#cd5c3d] uppercase block mb-1">Methodology</span>
            <h2 className="text-3xl md:text-4xl font-light text-[#1e1e1e] tracking-tight font-serif-display">
              Translation <span className="text-[#cd5c3d] font-semibold">Pillars</span>
            </h2>
            <div className="flex items-center justify-center gap-3 my-5">
              <div className="h-px w-16 bg-[#e8e0d8]" />
              <span className="text-[#cd5c3d] text-sm">❧</span>
              <div className="h-px w-16 bg-[#e8e0d8]" />
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {teachingPillars.map((item, idx) => (
              <div key={idx} className="bg-white border border-[#e8e0d8] rounded-3xl p-8 hover:border-[#cd5c3d50] transition-colors duration-300 flex flex-col items-start">
                <div className="w-12 h-12 rounded-2xl bg-[#cd5c3d0d] flex items-center justify-center mb-6">
                  {item.icon}
                </div>
                <h3 className="text-lg md:text-xl font-semibold text-[#1e1e1e] font-serif-display mb-3">{item.title}</h3>
                <p className="text-sm text-[#555] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="max-w-screen-xl mx-auto px-6 md:px-10 mt-12">
        <div className="bg-[#cd5c3d] rounded-3xl p-10 md:p-14 text-white text-center shadow-xl shadow-[#cd5c3d30] relative overflow-hidden">
          <div className="absolute inset-0 opacity-5 bg-radial-glow select-none pointer-events-none" />
          <h2 className="text-3xl md:text-4xl font-light tracking-tight mb-4 font-serif-display text-white">
            Access English Scripture Translations
          </h2>
          <p className="max-w-lg mx-auto text-white/80 text-sm md:text-base mb-8">
            Browse our list of translated chapters on the main page to start reading English versions of the Agamas.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/"
              onClick={handleScrollToChapters}
              className="inline-flex items-center justify-center px-8 py-3.5 bg-white text-[#cd5c3d] rounded-xl font-semibold shadow-lg hover:bg-[#fdf8f4] transition-all duration-200"
            >
              Explore Agama Sutras
            </Link>
            <Link
              to="/"
              className="text-white hover:text-white/80 transition-colors font-medium text-sm flex items-center gap-1.5"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
