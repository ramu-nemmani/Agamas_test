import SEO from "./SEO";
import { Link } from "react-router-dom";

export default function ChineseTeachingsPage() {
  const handleScrollToChapters = () => {
    setTimeout(() => {
      const section = document.getElementById("chapters");
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  const collections = [
    {
      title: "Chang Ahan Jing (Dirgha Agama)",
      desc: "Translated by Buddhayaśas and Zhu Fonian in 413 CE. Comprises 22 discourses emphasizing cosmology, early Buddhist history, and teachings to dismantle false views.",
      dynasty: "Later Qin Dynasty"
    },
    {
      title: "Zhong Ahan Jing (Madhyama Agama)",
      desc: "Translated by Gautama Saṅghadeva in 398 CE. Contains 222 discourses focusing on the analytical exploration of mental factors, ethics, and monastic life.",
      dynasty: "Eastern Jin Dynasty"
    },
    {
      title: "Zayi Ahan Jing (Samyukta Agama)",
      desc: "Translated by Guṇabhadra in 443 CE. The largest collection, connecting short sutras with specific mindfulness, concentration, and insight practice systems.",
      dynasty: "Liu Song Dynasty"
    },
    {
      title: "Zengyi Ahan Jing (Ekottarika Agama)",
      desc: "Translated by Gautama Saṅghadeva in 397 CE. Arranges core teachings in lists from one to eleven, detailing lay moral habits, spiritual qualities, and practice techniques.",
      dynasty: "Eastern Jin Dynasty"
    }
  ];

  return (
    <div className="min-h-screen bg-[#fdf8f4] text-[#0a0a0a] font-sans pb-16 md:pb-24">
      <SEO
        title="Chinese Agama Teachings | Early Buddhist Canonical Texts"
        description="Study early Agama scriptures in Chinese. Access the original Chinese canonical translations of Dirgha, Madhyama, Samyukta, and Ekottarika Agamas."
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
            <span className="text-[11px] font-semibold tracking-wider text-[#cd5c3d] uppercase">Chinese Canons</span>
          </div>
          <h1 className="text-4xl md:text-5.5xl font-light text-[#1e1e1e] tracking-tight leading-tight mb-4 font-serif-display">
            Chinese <span className="text-[#cd5c3d] font-semibold">Teachings</span>
          </h1>
          <div className="flex items-center justify-center gap-3 my-5">
            <div className="h-px w-16 bg-[#e8e0d8]" />
            <span className="text-[#cd5c3d] text-sm">❧</span>
            <div className="h-px w-16 bg-[#e8e0d8]" />
          </div>
          <p className="max-w-2xl mx-auto text-[#555] text-base md:text-lg leading-relaxed">
            Exploring the original classical Chinese Agama collections preserved in the Taishō Tripiṭaka.
          </p>
        </div>
      </section>

      {/* Intro section */}
      <section className="py-16 md:py-20 border-b border-[#e8e0d8]/40 bg-[#fdfdfd]/50">
        <div className="max-w-screen-md mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-light text-[#1e1e1e] font-serif-display text-center mb-6">
            Preserved in the <span className="text-[#cd5c3d] font-semibold">Classical Chinese Canon</span>
          </h2>
          <p className="text-base md:text-lg leading-relaxed text-[#555] mb-6">
            The Chinese Agamas (阿含經) were translated from Sanskrit or Middle Indo-Aryan dialects during the 4th and 5th centuries CE. They represent the shared heritage of early Buddhist schools before sectarian divisions arose.
          </p>
          <p className="text-base md:text-lg leading-relaxed text-[#555]">
            As one of the most complete collections of early discourses, the Chinese translations serve as a crucial cross-reference to the Pāli Nikāyas. By studying these texts, practitioners and researchers can reconstruct the earliest layers of Buddhist doctrine with great accuracy.
          </p>
        </div>
      </section>

      {/* Chinese translation lists */}
      <section className="bg-[#f5ede4] py-20 border-b border-[#e8e0d8]/60">
        <div className="max-w-screen-xl mx-auto px-6 md:px-10">
          <div className="text-center mb-16">
            <span className="text-[11px] font-bold tracking-widest text-[#cd5c3d] uppercase block mb-1">Chinese Texts</span>
            <h2 className="text-3xl md:text-4xl font-light text-[#1e1e1e] tracking-tight font-serif-display">
              Translation <span className="text-[#cd5c3d] font-semibold">History</span>
            </h2>
            <div className="flex items-center justify-center gap-3 my-5">
              <div className="h-px w-16 bg-[#e8e0d8]" />
              <span className="text-[#cd5c3d] text-sm">❧</span>
              <div className="h-px w-16 bg-[#e8e0d8]" />
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {collections.map((item, idx) => (
              <div key={idx} className="bg-white border border-[#e8e0d8] rounded-3xl p-8 shadow-sm hover:border-[#cd5c3d50] transition-colors duration-300 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4 border-b border-[#f5ede4] pb-3">
                    <h3 className="text-lg md:text-xl font-semibold text-[#1e1e1e] font-serif-display">{item.title}</h3>
                    <span className="text-[10px] bg-[#cd5c3d0d] text-[#cd5c3d] font-bold px-3 py-1 rounded-full uppercase tracking-wider">{item.dynasty}</span>
                  </div>
                  <p className="text-sm text-[#555] leading-relaxed mb-4">{item.desc}</p>
                </div>
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
            Read Chinese and English Chapters
          </h2>
          <p className="max-w-lg mx-auto text-white/80 text-sm md:text-base mb-8">
            Access bilingual text listings on our main page to study the original Chinese scriptures alongside English translations.
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
