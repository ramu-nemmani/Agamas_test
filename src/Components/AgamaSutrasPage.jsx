import SEO from "./SEO";
import { Link } from "react-router-dom";

export default function AgamaSutrasPage() {
  const handleScrollToChapters = () => {
    // If navigating back home, React Router will render LandingPage
    // We scroll to chapters section
    setTimeout(() => {
      const section = document.getElementById("chapters");
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  const collections = [
    {
      title: "Dirgha Agama (Long Discourses)",
      desc: "Contains longer discourses focusing on cosmological, mythological, and philosophical questions, laying down core teachings on morality, right view, and meditation.",
      sutras: "30 Sutras",
      focus: "Cosmology, spiritual authority, and foundational ethics."
    },
    {
      title: "Madhyama Agama (Middle-Length Discourses)",
      desc: "Comprises medium-length discourses covering essential teachings on karma, rebirth, selflessness, the structure of suffering, and practical mental cultivation.",
      sutras: "222 Sutras",
      focus: "Detailed doctrine, ethics, and monastic guidance."
    },
    {
      title: "Samyukta Agama (Connected Discourses)",
      desc: "Organized topically around key concepts like the Five Aggregates, the Six Sense Bases, the Noble Eightfold Path, and the Dependent Origination.",
      sutras: "1300+ Sutras",
      focus: "Core meditation subjects and psychological analysis."
    },
    {
      title: "Ekottarika Agama (Numbered Discourses)",
      desc: "Arranged numerically in ascending order (from ones to elevens), providing practical lists and explanations of teachings to aid memorization and daily practice.",
      sutras: "52 Chapters",
      focus: "Easy recall, numerical lists, lay practitioner instructions."
    }
  ];

  return (
    <div className="min-h-screen bg-[#fdf8f4] text-[#0a0a0a] font-sans pb-16 md:pb-24">
      <SEO
        title="Agama Sutras | Canonical Discourse Collections of Early Buddhism"
        description="Explore the Agama Sutras, early Buddhist discourses preserved in Chinese translations. Read chapter-wise translations and core Dharma teachings."
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
            <span className="text-[11px] font-semibold tracking-wider text-[#cd5c3d] uppercase">Sutra Collection</span>
          </div>
          <h1 className="text-4xl md:text-5.5xl font-light text-[#1e1e1e] tracking-tight leading-tight mb-4 font-serif-display">
            The <span className="text-[#cd5c3d] font-semibold">Agama Sutras</span>
          </h1>
          <div className="flex items-center justify-center gap-3 my-5">
            <div className="h-px w-16 bg-[#e8e0d8]" />
            <span className="text-[#cd5c3d] text-sm">❧</span>
            <div className="h-px w-16 bg-[#e8e0d8]" />
          </div>
          <p className="max-w-2xl mx-auto text-[#555] text-base md:text-lg leading-relaxed">
            The Agamas are the foundational collections of early Buddhist scriptures, preserving the direct teachings of the historical Buddha.
          </p>
        </div>
      </section>

      {/* Main Content Info */}
      <section className="py-16 md:py-20 border-b border-[#e8e0d8]/40 bg-[#fdfdfd]/50">
        <div className="max-w-screen-md mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-light text-[#1e1e1e] font-serif-display text-center mb-6">
            A Digital Repository of <span className="text-[#cd5c3d] font-semibold">Canonical Discourses</span>
          </h2>
          <p className="text-base md:text-lg leading-relaxed text-[#555] mb-6 font-normal">
            The Sanskrit term *Agama* literally means "that which has come down" or "sacred tradition". These scriptures are parallel to the Pāli Nikāyas and represent the oldest record of the Buddha's discourses on mindfulness, ethics, dependent origination, and liberation.
          </p>
          <p className="text-base md:text-lg leading-relaxed text-[#555] font-normal">
            Originally transmitted orally in ancient India, these discourses were translated into Chinese starting in the 2nd century CE and preserved in the Chinese Buddhist Canon (Taishō Tripiṭaka). Today, they serve as an invaluable resource for students, meditators, and scholars worldwide.
          </p>
        </div>
      </section>

      {/* Four Collections Section */}
      <section className="bg-[#f5ede4] py-20 border-b border-[#e8e0d8]/60">
        <div className="max-w-screen-xl mx-auto px-6 md:px-10">
          <div className="text-center mb-16">
            <span className="text-[11px] font-bold tracking-widest text-[#cd5c3d] uppercase block mb-1">Four Major Agamas</span>
            <h2 className="text-3xl md:text-4xl font-light text-[#1e1e1e] tracking-tight font-serif-display">
              Structure of the <span className="text-[#cd5c3d] font-semibold">Scriptures</span>
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
                    <span className="text-xs bg-[#cd5c3d0d] text-[#cd5c3d] font-semibold px-3 py-1 rounded-full uppercase tracking-wider">{item.sutras}</span>
                  </div>
                  <p className="text-sm md:text-base text-[#555] leading-relaxed mb-4">{item.desc}</p>
                </div>
                <div className="bg-[#fdf8f4] border border-[#e8e0d8]/60 rounded-xl p-4 mt-2">
                  <span className="text-xs font-semibold text-[#8a7a6c] uppercase block mb-1">Primary Focus:</span>
                  <p className="text-xs md:text-sm text-[#cd5c3d] font-medium leading-relaxed">{item.focus}</p>
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
            Begin Exploring the Scriptures
          </h2>
          <p className="max-w-lg mx-auto text-white/80 text-sm md:text-base mb-8">
            Access chapter-wise details and translations of canonical teachings on the homepage.
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
