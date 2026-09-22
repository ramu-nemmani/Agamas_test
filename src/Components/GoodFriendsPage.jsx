import SEO from "./SEO";
import { Link } from "react-router-dom";

export default function GoodFriendsPage() {
  const handleScrollToChapters = () => {
    setTimeout(() => {
      const section = document.getElementById("chapters");
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  const friendQualities = [
    {
      title: "1. Generous & Selfless",
      desc: "A good friend shares what is hard to share, helps unconditionally, and acts out of kindness rather than seeking gain or fame."
    },
    {
      title: "2. Truthful & Wise",
      desc: "They speak honestly, guide us away from harmful actions, and encourage us to cultivate moral habits and wisdom."
    },
    {
      title: "3. Patient & Forgiving",
      desc: "They stand by us in times of difficulty, tolerate our flaws while helping us grow, and provide a steady presence."
    },
    {
      title: "4. Inspiring Practice",
      desc: "They inspire us to cultivate mindfulness, study the Dharma, practice meditation, and walk the path of inner transformation."
    }
  ];

  return (
    <div className="min-h-screen bg-[#fdf8f4] text-[#0a0a0a] font-sans pb-16 md:pb-24">
      <SEO
        title="Kalyana-mitrata | The Value of Spiritual Friendship in the Agamas"
        description="Learn about the importance of good spiritual friends (Kalyana-mitra) for progress on the path of inner transformation, as taught in early scriptures."
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
            <span className="text-[11px] font-semibold tracking-wider text-[#cd5c3d] uppercase">Association</span>
          </div>
          <h1 className="text-4xl md:text-5.5xl font-light text-[#1e1e1e] tracking-tight leading-tight mb-4 font-serif-display">
            Spiritual <span className="text-[#cd5c3d] font-semibold">Friendship</span>
          </h1>
          <div className="flex items-center justify-center gap-3 my-5">
            <div className="h-px w-16 bg-[#e8e0d8]" />
            <span className="text-[#cd5c3d] text-sm">❧</span>
            <div className="h-px w-16 bg-[#e8e0d8]" />
          </div>
          <p className="max-w-2xl mx-auto text-[#555] text-base md:text-lg leading-relaxed">
            Understand the immense value of association with good friends (Kalyāṇa-mitratā) on the path to awakening and peace.
          </p>
        </div>
      </section>

      {/* Intro section */}
      <section className="py-16 md:py-20 border-b border-[#e8e0d8]/40 bg-[#fdfdfd]/50">
        <div className="max-w-screen-md mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-light text-[#1e1e1e] font-serif-display text-center mb-6">
            The Importance of a <span className="text-[#cd5c3d] font-semibold">Good Companion (Kalyāṇa-mitra)</span>
          </h2>
          <p className="text-base md:text-lg leading-relaxed text-[#555] mb-6">
            In early scriptures, the Buddha emphasized that good association is not just a helpful factor, but indeed "the whole of the holy life". Spiritual friendship provides the protection, feedback, and inspiration required to progress on the path.
          </p>
          <p className="text-base md:text-lg leading-relaxed text-[#555]">
            By associating with those who possess faith, moral habits, generosity, and wisdom, we naturally absorb these qualities. Good friends help us stay aligned with right view and prevent us from falling into heedlessness.
          </p>
        </div>
      </section>

      {/* Qualities Grid */}
      <section className="bg-[#f5ede4] py-20 border-b border-[#e8e0d8]/60">
        <div className="max-w-screen-xl mx-auto px-6 md:px-10">
          <div className="text-center mb-16">
            <span className="text-[11px] font-bold tracking-widest text-[#cd5c3d] uppercase block mb-1">Kalyāṇa-mitra</span>
            <h2 className="text-3xl md:text-4xl font-light text-[#1e1e1e] tracking-tight font-serif-display">
              Qualities of a <span className="text-[#cd5c3d] font-semibold">Spiritual Friend</span>
            </h2>
            <div className="flex items-center justify-center gap-3 my-5">
              <div className="h-px w-16 bg-[#e8e0d8]" />
              <span className="text-[#cd5c3d] text-sm">❧</span>
              <div className="h-px w-16 bg-[#e8e0d8]" />
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 justify-center">
            {friendQualities.map((item, idx) => (
              <div key={idx} className="bg-white border border-[#e8e0d8] rounded-3xl p-8 hover:border-[#cd5c3d50] transition-colors duration-300 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-[#1e1e1e] font-serif-display mb-4 border-b border-[#f5ede4] pb-3 text-[#cd5c3d]">{item.title}</h3>
                  <p className="text-xs md:text-sm text-[#555] leading-relaxed">{item.desc}</p>
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
            Explore Scripture Teachings
          </h2>
          <p className="max-w-lg mx-auto text-white/80 text-sm md:text-base mb-8">
            Access chapters describing wise association and the practice of Kalyana-mitrata on the homepage.
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
