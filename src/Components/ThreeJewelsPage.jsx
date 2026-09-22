import SEO from "./SEO";
import { Link } from "react-router-dom";

export default function ThreeJewelsPage() {
  const handleScrollToChapters = () => {
    setTimeout(() => {
      const section = document.getElementById("chapters");
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  const jewels = [
    {
      title: "1. The Buddha (The Awakened Teacher)",
      desc: "Taking refuge in the historical Buddha — the discoverer of the path to awakening and the embodiment of wisdom, compassion, and mental purity.",
      aspects: "Teacher, exemplar of liberation, guide."
    },
    {
      title: "2. The Dharma (The Ultimate Truth)",
      desc: "Taking refuge in the teachings, the natural law, and the path of practice that leads directly to the cessation of suffering and realization of inner peace.",
      aspects: "Canonical scriptures, universal principles, practical path."
    },
    {
      title: "3. The Sangha (The Spiritual Community)",
      desc: "Taking refuge in the community of practitioners — those who study, practice, realize, and preserve the teachings across generations.",
      aspects: "Noble disciples, community of practice, historical lineage."
    }
  ];

  return (
    <div className="min-h-screen bg-[#fdf8f4] text-[#0a0a0a] font-sans pb-16 md:pb-24">
      <SEO
        title="The Three Jewels (Triratna) | Refuge in Buddha, Dharma, Sangha"
        description="Understand the significance of taking refuge in the Three Jewels (Triratna): the Buddha, the Dharma (teachings), and the Sangha (community) in the Agamas."
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
            <span className="text-[11px] font-semibold tracking-wider text-[#cd5c3d] uppercase">Refuge & Devotion</span>
          </div>
          <h1 className="text-4xl md:text-5.5xl font-light text-[#1e1e1e] tracking-tight leading-tight mb-4 font-serif-display">
            The <span className="text-[#cd5c3d] font-semibold">Three Jewels</span>
          </h1>
          <div className="flex items-center justify-center gap-3 my-5">
            <div className="h-px w-16 bg-[#e8e0d8]" />
            <span className="text-[#cd5c3d] text-sm">❧</span>
            <div className="h-px w-16 bg-[#e8e0d8]" />
          </div>
          <p className="max-w-2xl mx-auto text-[#555] text-base md:text-lg leading-relaxed">
            Discover the three-fold refuge (Triratna) that guides practitioners on the path of awakening and moral stability.
          </p>
        </div>
      </section>

      {/* Intro section */}
      <section className="py-16 md:py-20 border-b border-[#e8e0d8]/40 bg-[#fdfdfd]/50">
        <div className="max-w-screen-md mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-light text-[#1e1e1e] font-serif-display text-center mb-6">
            Taking Refuge in <span className="text-[#cd5c3d] font-semibold">Buddha, Dharma, and Sangha</span>
          </h2>
          <p className="text-base md:text-lg leading-relaxed text-[#555] mb-6">
            The *Triratna* or Three Jewels are the primary reference points for all Buddhist schools. Taking refuge is a conscious act of trust, recognizing the Buddha as the ultimate teacher, the Dharma as the path of truth, and the Sangha as the community of noble practitioners.
          </p>
          <p className="text-base md:text-lg leading-relaxed text-[#555]">
            In the Agamas, refuge is described as a protective dwelling for the mind. When we orient our lives around these three qualities, we establish a secure base that protects us from error, negligence, and suffering.
          </p>
        </div>
      </section>

      {/* Three Jewels Grid */}
      <section className="bg-[#f5ede4] py-20 border-b border-[#e8e0d8]/60">
        <div className="max-w-screen-xl mx-auto px-6 md:px-10">
          <div className="text-center mb-16">
            <span className="text-[11px] font-bold tracking-widest text-[#cd5c3d] uppercase block mb-1">Triratna</span>
            <h2 className="text-3xl md:text-4xl font-light text-[#1e1e1e] tracking-tight font-serif-display">
              The Three pillars of <span className="text-[#cd5c3d] font-semibold">Refuge</span>
            </h2>
            <div className="flex items-center justify-center gap-3 my-5">
              <div className="h-px w-16 bg-[#e8e0d8]" />
              <span className="text-[#cd5c3d] text-sm">❧</span>
              <div className="h-px w-16 bg-[#e8e0d8]" />
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {jewels.map((item, idx) => (
              <div key={idx} className="bg-white border border-[#e8e0d8] rounded-3xl p-8 hover:border-[#cd5c3d50] transition-colors duration-300 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg md:text-xl font-semibold text-[#1e1e1e] font-serif-display mb-4 border-b border-[#f5ede4] pb-3 text-[#cd5c3d]">{item.title}</h3>
                  <p className="text-sm text-[#555] leading-relaxed mb-6">{item.desc}</p>
                </div>
                <div className="bg-[#fdf8f4] border border-[#e8e0d8]/60 rounded-xl p-4 mt-2">
                  <span className="text-xs font-semibold text-[#8a7a6c] uppercase block mb-1">Key Aspects:</span>
                  <p className="text-xs md:text-sm text-[#cd5c3d] font-medium leading-relaxed">{item.aspects}</p>
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
            Explore Refuge Sutras
          </h2>
          <p className="max-w-lg mx-auto text-white/80 text-sm md:text-base mb-8">
            Browse scriptures exploring the Buddha, Dharma, and Sangha on the homepage.
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
