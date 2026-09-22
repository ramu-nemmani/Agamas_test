import SEO from "./SEO";
import { Link } from "react-router-dom";

export default function FivePreceptsPage() {
  const handleScrollToChapters = () => {
    setTimeout(() => {
      const section = document.getElementById("chapters");
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  const precepts = [
    {
      title: "1. Abstaining from Taking Life (Ahiṃsā / Non-harming)",
      desc: "To respect all living beings and cherish life, avoiding intentional killing or causing physical harm to any sentient creature."
    },
    {
      title: "2. Abstaining from Stealing (Adattādāna / Generosity)",
      desc: "To refrain from taking what is not given, cultivating honesty, integrity, and respect for the possessions of others."
    },
    {
      title: "3. Abstaining from Sexual Misconduct (Kāmeṣumithyācāra / Right Conduct)",
      desc: "To practice responsibility in relationships, protecting mutual trust, safety, emotional integrity, and moral stability."
    },
    {
      title: "4. Abstaining from False Speech (Mṛṣāvāda / Truthfulness)",
      desc: "To speak truthfully, constructively, and kindly, avoiding lies, harsh language, slandering, or gossip that creates division."
    },
    {
      title: "5. Abstaining from Intoxicants (Surāmerayamajjapamādaṭṭhānā / Mindfulness)",
      desc: "To protect clarity of mind and prevent heedlessness, avoiding substances that cloud judgment, lead to negligence, or impair moral guard."
    }
  ];

  return (
    <div className="min-h-screen bg-[#fdf8f4] text-[#0a0a0a] font-sans pb-16 md:pb-24">
      <SEO
        title="The Five Precepts (Pañca-śīla) | Buddhist Ethics & Morality"
        description="Study the Five Precepts (Panca-sila) from early Agama scriptures. The foundation of Buddhist ethics: non-harming, truthfulness, and mindfulness."
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
            <span className="text-[11px] font-semibold tracking-wider text-[#cd5c3d] uppercase">Ethics & Śīla</span>
          </div>
          <h1 className="text-4xl md:text-5.5xl font-light text-[#1e1e1e] tracking-tight leading-tight mb-4 font-serif-display">
            The <span className="text-[#cd5c3d] font-semibold">Five Precepts</span>
          </h1>
          <div className="flex items-center justify-center gap-3 my-5">
            <div className="h-px w-16 bg-[#e8e0d8]" />
            <span className="text-[#cd5c3d] text-sm">❧</span>
            <div className="h-px w-16 bg-[#e8e0d8]" />
          </div>
          <p className="max-w-2xl mx-auto text-[#555] text-base md:text-lg leading-relaxed">
            The foundation of moral behavior, safety, and psychological freedom, providing protection for ourselves and society.
          </p>
        </div>
      </section>

      {/* Intro section */}
      <section className="py-16 md:py-20 border-b border-[#e8e0d8]/40 bg-[#fdfdfd]/50">
        <div className="max-w-screen-md mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-light text-[#1e1e1e] font-serif-display text-center mb-6">
            The Foundation of <span className="text-[#cd5c3d] font-semibold">Ethical Living (Śīla)</span>
          </h2>
          <p className="text-base md:text-lg leading-relaxed text-[#555] mb-6">
            In early Buddhist teachings, the Five Precepts (*Pañca-śīla*) are not commandments but voluntary commitments to protect life, properties, relationships, communication, and mindfulness.
          </p>
          <p className="text-base md:text-lg leading-relaxed text-[#555]">
            By practicing these precepts, we reduce harmful karma, cultivate inner peace, and establish a steady mental base necessary for successful meditation and wisdom development.
          </p>
        </div>
      </section>

      {/* Five Precepts List */}
      <section className="bg-[#f5ede4] py-20 border-b border-[#e8e0d8]/60">
        <div className="max-w-screen-xl mx-auto px-6 md:px-10">
          <div className="text-center mb-16">
            <span className="text-[11px] font-bold tracking-widest text-[#cd5c3d] uppercase block mb-1">Pañca-śīla</span>
            <h2 className="text-3xl md:text-4xl font-light text-[#1e1e1e] tracking-tight font-serif-display">
              The Five Voluntary <span className="text-[#cd5c3d] font-semibold">Precepts</span>
            </h2>
            <div className="flex items-center justify-center gap-3 my-5">
              <div className="h-px w-16 bg-[#e8e0d8]" />
              <span className="text-[#cd5c3d] text-sm">❧</span>
              <div className="h-px w-16 bg-[#e8e0d8]" />
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 justify-center">
            {precepts.map((item, idx) => (
              <div key={idx} className="bg-white border border-[#e8e0d8] rounded-3xl p-8 hover:border-[#cd5c3d50] transition-colors duration-300 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg md:text-xl font-semibold text-[#1e1e1e] font-serif-display mb-4 border-b border-[#f5ede4] pb-3 text-[#cd5c3d]">{item.title}</h3>
                  <p className="text-sm text-[#555] leading-relaxed">{item.desc}</p>
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
            Learn More from the Scriptures
          </h2>
          <p className="max-w-lg mx-auto text-white/80 text-sm md:text-base mb-8">
            Access specific sutras explaining the practice of moral habits on the homepage.
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
