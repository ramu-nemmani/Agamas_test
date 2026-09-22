import SEO from "./SEO";
import { Link } from "react-router-dom";

export default function MindfulnessTeachingsPage() {
  const handleScrollToChapters = () => {
    setTimeout(() => {
      const section = document.getElementById("chapters");
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  const establishments = [
    {
      title: "1. Contemplation of the Body (Kāya-smṛtyupasthāna)",
      desc: "Observing breathing (Anapanasmrti), bodily postures, movements, anatomical parts, and the decay of the physical form to see the body as impermanent."
    },
    {
      title: "2. Contemplation of Feelings (Vedanā-smṛtyupasthāna)",
      desc: "Mindfully recognizing raw sensory feelings as pleasant, unpleasant, or neutral, understanding their arising and passing without reacting."
    },
    {
      title: "3. Contemplation of the Mind (Citta-smṛtyupasthāna)",
      desc: "Observing the active states of consciousness — whether filled with lust, anger, confusion, concentration, or freedom."
    },
    {
      title: "4. Contemplation of Dharmas (Dharma-smṛtyupasthāna)",
      desc: "Monitoring mental objects and psychological realities, such as the Five Hindrances, the Five Aggregates, the Six Sense Spheres, and the Seven Factors of Awakening."
    }
  ];

  return (
    <div className="min-h-screen bg-[#fdf8f4] text-[#0a0a0a] font-sans pb-16 md:pb-24">
      <SEO
        title="Mindfulness Teachings in the Agamas | Early Buddhist Meditation"
        description="Learn about the foundations of mindfulness (Smrti / Satipatthana) according to early Agama scriptures. Practice right mindfulness and meditation."
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
            <span className="text-[11px] font-semibold tracking-wider text-[#cd5c3d] uppercase">Meditation</span>
          </div>
          <h1 className="text-4xl md:text-5.5xl font-light text-[#1e1e1e] tracking-tight leading-tight mb-4 font-serif-display">
            Mindfulness <span className="text-[#cd5c3d] font-semibold">Teachings</span>
          </h1>
          <div className="flex items-center justify-center gap-3 my-5">
            <div className="h-px w-16 bg-[#e8e0d8]" />
            <span className="text-[#cd5c3d] text-sm">❧</span>
            <div className="h-px w-16 bg-[#e8e0d8]" />
          </div>
          <p className="max-w-2xl mx-auto text-[#555] text-base md:text-lg leading-relaxed">
            Discover the direct paths to awareness, mental clarity, and liberation through the four establishments of mindfulness.
          </p>
        </div>
      </section>

      {/* Intro section */}
      <section className="py-16 md:py-20 border-b border-[#e8e0d8]/40 bg-[#fdfdfd]/50">
        <div className="max-w-screen-md mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-light text-[#1e1e1e] font-serif-display text-center mb-6">
            The Foundation of Right <span className="text-[#cd5c3d] font-semibold">Mindfulness (Samyak-smṛti)</span>
          </h2>
          <p className="text-base md:text-lg leading-relaxed text-[#555] mb-6">
            In early Buddhist teachings, mindfulness (Smṛti) is not simply a tool for relaxation but a dynamic discipline designed to unlock deep insights. The primary system of practice is *Smṛtyupasthāna* (Satipaṭṭhāna) — the four establishments of mindfulness.
          </p>
          <p className="text-base md:text-lg leading-relaxed text-[#555]">
            By placing awareness consistently on bodily processes, sensory feelings, conscious mind states, and mental factors, practitioners learn to observe things as they really are, without the distortion of attachment or aversion.
          </p>
        </div>
      </section>

      {/* Four Establishments List */}
      <section className="bg-[#f5ede4] py-20 border-b border-[#e8e0d8]/60">
        <div className="max-w-screen-xl mx-auto px-6 md:px-10">
          <div className="text-center mb-16">
            <span className="text-[11px] font-bold tracking-widest text-[#cd5c3d] uppercase block mb-1">Satipaṭṭhāna</span>
            <h2 className="text-3xl md:text-4xl font-light text-[#1e1e1e] tracking-tight font-serif-display">
              Four Establishments of <span className="text-[#cd5c3d] font-semibold">Mindfulness</span>
            </h2>
            <div className="flex items-center justify-center gap-3 my-5">
              <div className="h-px w-16 bg-[#e8e0d8]" />
              <span className="text-[#cd5c3d] text-sm">❧</span>
              <div className="h-px w-16 bg-[#e8e0d8]" />
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {establishments.map((item, idx) => (
              <div key={idx} className="bg-white border border-[#e8e0d8] rounded-3xl p-8 shadow-sm hover:border-[#cd5c3d50] transition-colors duration-300">
                <h3 className="text-lg md:text-xl font-semibold text-[#1e1e1e] font-serif-display mb-4 border-b border-[#f5ede4] pb-3 text-[#cd5c3d]">{item.title}</h3>
                <p className="text-sm md:text-base text-[#555] leading-relaxed">{item.desc}</p>
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
            Explore Mindfulness Sutras
          </h2>
          <p className="max-w-lg mx-auto text-white/80 text-sm md:text-base mb-8">
            Read discourses specifically on meditation and mental training from the home page.
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
