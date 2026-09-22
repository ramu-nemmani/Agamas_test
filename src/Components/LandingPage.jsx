import Lessons from "./Lessons";
import TalksVideos from "./TalksVideos";
import SEO from "./SEO";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import drLimImg from "../assets/DRLim.webp";
import drRajeshImg from "../assets/Dr.webp";
import bgTrain from "../assets/bg_train.webp";
import heroImg from "../assets/herobg.webp";
import floralImg from "../assets/floral.webp";
import wisdomImg from "../assets/wisdom.webp";

const landingImages = {
  collage1: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800",
  collage2: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800",
  collage3: "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&q=80&w=800",
  collage4: "https://images.unsplash.com/photo-1528319725582-ddc096101511?auto=format&fit=crop&q=80&w=800",
  collage5: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=800",
  collage6: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800",
  readerShowcase: wisdomImg
};

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (custom) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      delay: (custom || 0) * 0.15,
      ease: [0.215, 0.610, 0.355, 1.000],
    },
  }),
};

const testimonials = [
  {
    quote: "The Agamas website has completely transformed my morning reading routine. The translations are clear, respectful, and deeply resonant.",
    initial: "A",
    name: "Anjali P.",
    role: "Daily Reader"
  },
  {
    quote: "A treasure trove of ancient wisdom made accessible for the modern seeker. I find myself returning here whenever I need clarity and peace.",
    initial: "R",
    name: "Rohan K.",
    role: "Student of Philosophy"
  },
  {
    quote: "The careful organization of these sacred texts allows me to study chapter by chapter at my own pace. Truly a gift to the world.",
    initial: "M",
    name: "Meera S.",
    role: "Researcher"
  },
  {
    quote: "A valuable digital space for exploring Agamas and timeless wisdom.",
    initial: "V",
    name: "Vikram D.",
    role: "General Reader"
  }
];

export default function LandingPage() {
  const location = useLocation();
  const [activeFaq, setActiveFaq] = useState(null);
  const [activeFeature, setActiveFeature] = useState(null);

  const toggleFeature = (feature) => {
    setActiveFeature(activeFeature === feature ? null : feature);
  };

  const welcomeRef = useRef(null);
  const [welcomeProgress, setWelcomeProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!welcomeRef.current) return;
      const rect = welcomeRef.current.getBoundingClientRect();
      const elementHeight = rect.height;
      const viewportHeight = window.innerHeight;
      const scrollRange = elementHeight - viewportHeight;
      if (scrollRange <= 0) return;
      const scrolled = -rect.top;
      const rawProgress = scrolled / scrollRange;
      const clampedProgress = Math.max(0, Math.min(1, rawProgress));
      setWelcomeProgress(clampedProgress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getInterpolatedValue = (startVal, endVal, range, p) => {
    const [startP, endP] = range;
    if (p <= startP) return startVal;
    if (p >= endP) return endVal;
    const ratio = (p - startP) / (endP - startP);
    return startVal + (endVal - startVal) * ratio;
  };

  const textOpacity = getInterpolatedValue(1, 0, [0.25, 0.65], welcomeProgress);
  const bgOverlayOpacity = getInterpolatedValue(0, 1, [0.25, 0.65], welcomeProgress);

  const t1_x = getInterpolatedValue(-75, 0, [0.08, 0.72], welcomeProgress);
  const t1_y = getInterpolatedValue(-55, 0, [0.08, 0.72], welcomeProgress);
  const t1_r = getInterpolatedValue(-22, 0, [0.08, 0.72], welcomeProgress);
  const transform1 = `translate3d(${t1_x}vw, ${t1_y}vh, 0) rotate(${t1_r}deg)`;

  const t2_x = getInterpolatedValue(75, 0, [0.12, 0.75], welcomeProgress);
  const t2_y = getInterpolatedValue(-50, 0, [0.12, 0.75], welcomeProgress);
  const t2_r = getInterpolatedValue(20, 0, [0.12, 0.75], welcomeProgress);
  const transform2 = `translate3d(${t2_x}vw, ${t2_y}vh, 0) rotate(${t2_r}deg)`;

  const t3_x = getInterpolatedValue(-85, 0, [0.05, 0.70], welcomeProgress);
  const t3_y = getInterpolatedValue(-5, 0, [0.05, 0.70], welcomeProgress);
  const t3_r = getInterpolatedValue(-12, 0, [0.05, 0.70], welcomeProgress);
  const transform3 = `translate3d(${t3_x}vw, ${t3_y}vh, 0) rotate(${t3_r}deg)`;

  const t4_x = getInterpolatedValue(85, 0, [0.16, 0.80], welcomeProgress);
  const t4_y = getInterpolatedValue(10, 0, [0.16, 0.80], welcomeProgress);
  const t4_r = getInterpolatedValue(15, 0, [0.16, 0.80], welcomeProgress);
  const transform4 = `translate3d(${t4_x}vw, ${t4_y}vh, 0) rotate(${t4_r}deg)`;

  const t5_x = getInterpolatedValue(-65, 0, [0.10, 0.74], welcomeProgress);
  const t5_y = getInterpolatedValue(55, 0, [0.10, 0.74], welcomeProgress);
  const t5_r = getInterpolatedValue(-25, 0, [0.10, 0.74], welcomeProgress);
  const transform5 = `translate3d(${t5_x}vw, ${t5_y}vh, 0) rotate(${t5_r}deg)`;

  const t6_x = getInterpolatedValue(65, 0, [0.14, 0.78], welcomeProgress);
  const t6_y = getInterpolatedValue(50, 0, [0.14, 0.78], welcomeProgress);
  const t6_r = getInterpolatedValue(25, 0, [0.14, 0.78], welcomeProgress);
  const transform6 = `translate3d(${t6_x}vw, ${t6_y}vh, 0) rotate(${t6_r}deg)`;

  useEffect(() => {
    if (!location.hash) return;
    const scrollToSection = () => {
      const section = document.getElementById(location.hash.substring(1));
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };
    const timeout = setTimeout(scrollToSection, 100);
    return () => clearTimeout(timeout);
  }, [location.hash]);

  return (
    <div className="min-h-screen bg-[#fdf8f4] text-[#0a0a0a] font-sans">
      <SEO
        title="The Agamas - A Translation As It Is"
        description="Discover the ancient Agama texts—the real-time notes of the teachings of the Teacher—survived and retained in Chinese translations from original Sanskrit, now retranslated into English."
        name="The Agamas"
        type="website"
      />

      {/* ── 1. HERO SECTION ── */}
      <section className="sticky top-[76px] z-0 min-h-[calc(100vh-76px)] lg:h-[calc(100vh-76px)] flex flex-col justify-between bg-white text-white overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroImg}
            alt="Hero Background"
            className="absolute inset-0 w-full h-full object-cover opacity-100"
          />
          <div className="absolute inset-0 bg-black/15" />
        </div>

        {/* Hero Top Title Content */}
        <div className="relative z-10 mx-auto max-w-[1360px] w-full flex-1 flex flex-col justify-end pb-6 pt-16 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            className="max-w-[900px] text-left"
          >
            <motion.h1
              variants={fadeInUp}
              custom={1}
              className="font-light leading-[1.15] tracking-tight text-left"
              style={{
                color: "#EEE5DA",
                fontFamily: "'PP Fragment Glare Regular', 'Playfair Display', Georgia, serif",
                fontSize: "clamp(44px, 7vw, 54px)",
                fontWeight: "400",
                backgroundColor: "transparent",
              }}
            >
              You Don't Need to Have<br />it All Figured Out.
            </motion.h1>
            <motion.h2
              variants={fadeInUp}
              custom={2.2}
              className="mt-4 text-left"
              style={{
                fontSize: "clamp(52px, 6vw, 62px)",
                color: "RGB(238, 229, 218)",
                fontStyle: "italic",
                fontWeight: "400",
                lineHeight: "1.1",
              }}
            >
              Just a Place to Start
            </motion.h2>
          </motion.div>
        </div>

        {/* Hero Bottom Content (Three-Column Strip) */}
        <div className="relative z-10 mx-auto w-full max-w-[1360px] px-4 sm:px-6 lg:px-8 pb-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="border-t border-white"
          >
            <div className="flex w-full flex-col md:flex-row">
              {/* What You'll Learn */}
              <div className="flex min-w-0 flex-1 flex-col pt-5 pb-7 text-left">
                <h3
                  className="m-0"
                  style={{
                    fontFamily: "'PP Fragment Glare Regular', 'Playfair Display', Georgia, serif",
                    fontStyle: "italic",
                    color: "#eee5da",
                    fontSize: "clamp(1.188rem, 1.077rem + 0.469vw, 1.5rem)",
                    lineHeight: "1.6",
                    fontWeight: "normal",
                  }}
                >
                  What You’ll Learn
                </h3>
                <a href="#lessons" className="mt-0.5 inline-block w-fit font-sans text-[16px] text-white underline decoration-white underline-offset-4 transition-colors duration-200 hover:text-white">
                  Learn More
                </a>
              </div>

              {/* What You'll Gain */}
              <div className="relative flex min-w-0 flex-1 flex-col pt-5 pb-7 md:pl-6 text-left before:absolute before:left-0 before:top-0 before:h-px before:w-full md:before:h-[94px] md:before:w-px before:bg-white before:content-['']">
                <h3
                  className="m-0"
                  style={{
                    fontFamily: "'PP Fragment Glare Regular', 'Playfair Display', Georgia, serif",
                    fontStyle: "italic",
                    color: "#eee5da",
                    fontSize: "clamp(1.188rem, 1.077rem + 0.469vw, 1.5rem)",
                    lineHeight: "1.6",
                    fontWeight: "normal",
                  }}
                >
                  What You’ll Gain
                </h3>
                <a href="#vision-mission" className="mt-0.5 inline-block w-fit font-sans text-[16px] text-white underline decoration-white underline-offset-4 transition-colors duration-200 hover:text-white">
                  Learn More
                </a>
              </div>

              {/* Who Should Attend */}
              <div className="relative flex min-w-0 flex-1 flex-col pt-5 pb-7 md:pl-6 text-left before:absolute before:left-0 before:top-0 before:h-px before:w-full md:before:h-[94px] md:before:w-px before:bg-white before:content-['']">
                <h3
                  className="m-0"
                  style={{
                    fontFamily: "'PP Fragment Glare Regular', 'Playfair Display', Georgia, serif",
                    fontStyle: "italic",
                    color: "#eee5da",
                    fontSize: "clamp(1.188rem, 1.077rem + 0.469vw, 1.5rem)",
                    lineHeight: "1.6",
                    fontWeight: "normal",
                  }}
                >
                  Who Should Attend?
                </h3>
                <a href="#vision-mission" className="mt-0.5 inline-block w-fit font-sans text-[16px] text-white underline decoration-white underline-offset-4 transition-colors duration-200 hover:text-white">
                  Learn More
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>



      {/* ── MAIN CONTENT CARD OVERLAY ───────────────────────────────────────────── */}
      <main className="relative z-10 bg-[#f3ede5] rounded-t-[32px] md:rounded-t-[48px] border-t border-[#001e2d]/5">

        {/* ── LESSONS ──────────────────────────────────────────────────── */}
        <section className="pt-16 md:pt-20 pb-0 text-[#001e2d]">
          <Lessons />
        </section>








        {/* ── TALKS & VIDEOS ───────────────────────────────────────────── */}
        <section className="pt-16 md:pt-20 pb-0 text-[#001e2d]">
          <div className="max-w-screen-xl mx-auto px-6 md:px-10 text-center mb-5 flex flex-col items-center gap-4">
            <h2 className="text-[#001e2d]" style={{ fontFamily: '"PP Fragment Glare Regular", Georgia, serif', fontSize: '48px', fontWeight: 400 }}>
              Talks & <span className="font-serif-display italic text-[#cd5c3d] font-normal">Videos</span>
            </h2>
            <p
              className="text-[#888]"
              style={{
                fontFamily: '"Open Sans", Helvetica, Arial, Lucida, sans-serif',
                fontSize: '20px',
                fontStyle: 'normal',
                fontVariantCaps: 'normal',
                fontVariantEastAsian: 'normal',
                fontVariantLigatures: 'normal',
                fontVariantNumeric: 'normal',
                fontWeight: 400
              }}
            >
              Discourses, interviews, and study sessions by teachers and speakers.
            </p>
          </div>
          <TalksVideos hideSectionHeader />
        </section>

        {/* ── WHERE TO BEGIN ──────────────────────────────────────── */}
        <section className="pt-16 pb-8 md:pt-28 md:pb-12 text-[#001e2d]">
          <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-8 md:gap-16 items-start md:items-center">
            <div className="flex-1 space-y-4">
              <span className="text-[14px] md:text-[16px] font-bold tracking-[3px] text-[#001e2d]/60 uppercase font-sans block">
                WHERE TO BEGIN
              </span>
              <h2
                className="text-[#001e2d] tracking-tight leading-[1.1] text-[38px] sm:text-[46px] md:text-[52px]"
                style={{
                  fontFamily: '"PP Fragment Glare Regular", Georgia, serif',
                  fontWeight: 400,
                  fontStyle: 'normal'
                }}
              >
                Every <span
                  className="text-[#cd5c3d] text-[42px] sm:text-[50px] md:text-[56px]"
                  style={{
                    fontFamily: '"PP Fragment Glare Regular", Georgia, serif',
                    fontStyle: 'italic',
                    fontWeight: 400
                  }}
                >Journey</span><br />is Unique
              </h2>
            </div>
            <div className="flex-1 space-y-6">
              <p
                className="text-[#001e2d]/80 text-[18px] md:text-[20px] font-normal leading-relaxed"
                style={{ fontFamily: '"Open Sans", Helvetica, Arial, Lucida, sans-serif' }}
              >
                Welcome to The Agamas—a place to slow down, reflect, and reconnect with timeless wisdom. Whether you’re curious about ancient teachings, seeking clarity, or studying the scriptures, you’re invited to explore at your own pace.
              </p>
            </div>
          </div>
        </section>

        {/* ── 3. YOU'RE WELCOME HERE SECTION (Scroll Animation) ── */}
        <div ref={welcomeRef} className="relative w-full h-[200vh]">
          <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center bg-[#f3ede5]">

            <motion.div
              style={{ opacity: textOpacity }}
              className="relative z-[10] mx-auto max-w-[680px] text-center px-4 sm:px-6 lg:px-8 space-y-3 pointer-events-none select-none"
            >
              <img src={floralImg} alt="Floral Logo" className="w-24 mx-auto mb-6 object-contain" />
              <span className="text-[16px] font-bold tracking-[3px] text-[#001e2d]/60 uppercase font-sans block">
                OPEN TO ALL
              </span>

              <h2
                className="leading-tight text-[#001e2d] text-[38px] sm:text-[46px] md:text-[52px]"
                style={{
                  fontFamily: '"PP Fragment Glare Regular", Georgia, serif',
                  fontWeight: 400,
                  fontStyle: 'normal'
                }}
              >
                You're <span
                  className="text-[#cd5c3d] text-[42px] sm:text-[50px] md:text-[56px]"
                  style={{
                    fontFamily: '"PP Fragment Glare Regular", Georgia, serif',
                    fontStyle: 'italic',
                    fontWeight: 400
                  }}
                >Welcome</span> Here
              </h2>

              <p className="text-[#001e2d]/80 text-[20px] font-sans font-normal leading-relaxed max-w-[580px] mx-auto pt-4">
                From translating authentic scriptures under guided supervision to offering a distraction-free digital reader, our resources are crafted to ground, support, and connect seekers at every step.
              </p>
            </motion.div>

            {/* Section BG Color Overlay Layer */}
            <motion.div
              style={{ opacity: bgOverlayOpacity }}
              className="absolute inset-0 bg-[#f3ede5] pointer-events-none z-[15]"
            />

            {/* 6 Pinned Capsule-Shaped Images with Radial Convergence/Divergence Trajectories */}
            {/* Image 1: Top-Left */}
            <motion.div
              style={{ transform: transform1 }}
              className="absolute z-[20] w-40 h-60 md:w-56 md:h-90 rounded-[200px] overflow-hidden border-[3px] border-white pointer-events-none"
            >
              <div className="w-full h-full bg-slate-200">
                <img src={landingImages.collage1} className="w-full h-full object-cover" alt="scripture collage 1" />
              </div>
            </motion.div>

            {/* Image 2: Top-Right */}
            <motion.div
              style={{ transform: transform2 }}
              className="absolute z-[21] w-40 h-60 md:w-56 md:h-90 rounded-[200px] overflow-hidden border-[3px] border-white pointer-events-none"
            >
              <div className="w-full h-full bg-slate-200">
                <img src={landingImages.collage2} className="w-full h-full object-cover" alt="scripture collage 2" />
              </div>
            </motion.div>

            {/* Image 3: Center-Left */}
            <motion.div
              style={{ transform: transform3 }}
              className="absolute z-[22] w-40 h-60 md:w-56 md:h-90 rounded-[200px] overflow-hidden border-[3px] border-white pointer-events-none"
            >
              <div className="w-full h-full bg-slate-200">
                <img src={landingImages.collage3} className="w-full h-full object-cover" alt="scripture collage 3" />
              </div>
            </motion.div>

            {/* Image 4: Center-Right */}
            <motion.div
              style={{ transform: transform4 }}
              className="absolute z-[23] w-40 h-60 md:w-56 md:h-90 rounded-[200px] overflow-hidden border-[3px] border-white pointer-events-none"
            >
              <div className="w-full h-full bg-slate-200">
                <img src={landingImages.collage4} className="w-full h-full object-cover" alt="scripture collage 4" />
              </div>
            </motion.div>

            {/* Image 5: Bottom-Left */}
            <motion.div
              style={{ transform: transform5 }}
              className="absolute z-[24] w-40 h-60 md:w-56 md:h-90 rounded-[200px] overflow-hidden border-[3px] border-white pointer-events-none"
            >
              <div className="w-full h-full bg-slate-200">
                <img src={landingImages.collage5} className="w-full h-full object-cover" alt="scripture collage 5" />
              </div>
            </motion.div>

            {/* Image 6: Bottom-Right */}
            <motion.div
              style={{ transform: transform6 }}
              className="absolute z-[25] w-40 h-60 md:w-56 md:h-90 rounded-[200px] overflow-hidden border-[3px] border-white pointer-events-none"
            >
              <div className="w-full h-full bg-slate-200">
                <img src={landingImages.collage6} className="w-full h-full object-cover" alt="scripture collage 6" />
              </div>
            </motion.div>

          </div>
        </div>

        {/* ── VISION, MISSION, IMPORTANCE ──────────────────────────────────────── */}
        <section id="vision-mission" className="relative py-24 text-[#001e2d] bg-[#fffdf8] z-20">
          {/* Curved Transition Divider */}
          <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0] transform -translate-y-[99%] z-20 pointer-events-none">
            <svg
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
              className="relative block w-full h-[60px] md:h-[100px]"
            >
              <path
                d="M0,120 C600,0 600,0 1200,120 L1200,120 L0,120 Z"
                fill="#fffdf8"
              />
            </svg>
          </div>

          <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-[900px] mx-auto mb-20 space-y-4">
              <span className="text-[14px] md:text-[16px] font-bold tracking-[3px] text-[#001e2d]/60 uppercase font-sans block mb-6 text-center">
                VISION · MISSION · IMPORTANCE
              </span>
              <h2 className="text-[#001e2d] text-center" style={{ fontFamily: '"PP Fragment Glare Regular", Georgia, serif', fontSize: 'clamp(36px, 5vw, 48px)', lineHeight: 1.2, fontWeight: 400 }}>
                Why Sunyatee International<br className="hidden sm:block" /> Foundation is<br className="hidden sm:block" /> building this <span style={{ fontStyle: 'italic', color: 'rgb(205, 92, 61)', fontSize: 'clamp(42px, 6vw, 56px)', fontWeight: 400 }}>library.</span>
              </h2>
              <p
                className="text-[#001e2d]/80 max-w-[760px] mx-auto leading-relaxed text-center mt-6"
                style={{
                  fontFamily: '"Open Sans", Helvetica, Arial, Lucida, sans-serif',
                  fontSize: '20px',
                  fontStyle: 'normal',
                  fontVariantCaps: 'normal',
                  fontVariantEastAsian: 'normal',
                  fontVariantLigatures: 'normal',
                  fontVariantNumeric: 'normal',
                  fontWeight: 400
                }}
              >
                A quiet, digital space where Agama wisdom stays accessible, respectful, and free for sincere readers everywhere.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-12 text-center">
              {/* Vision */}
              <div 
                className="flex flex-col items-center text-center space-y-5 group cursor-pointer"
                onClick={() => toggleFeature('vision')}
              >
                <div className="relative w-[80px] h-[120px] flex items-center justify-center">
                  <img alt="shape background" className={`absolute inset-0 w-full h-full object-contain transition-all duration-300 group-hover:opacity-0 group-hover:scale-90 ${activeFeature === 'vision' ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`} src="https://www.namchak.org/wp-content/uploads/2025/11/1.png" />
                  <img alt="Vase of Treasure" className={`relative z-10 w-full h-full object-contain transition-all duration-300 group-hover:opacity-100 group-hover:scale-100 ${activeFeature === 'vision' ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`} src="https://www.namchak.org/wp-content/uploads/2026/02/illustration-symbol-3.svg" />
                </div>
                <span className="text-[14px] font-bold tracking-[2px] text-[rgb(205,92,61)] uppercase font-sans block">VISION</span>
                <h3 style={{ fontFamily: '"PP Fragment Glare Regular", Georgia, serif', fontSize: '22px', fontWeight: 400, color: 'rgb(0, 30, 45)', lineHeight: 1.3, minHeight: '56px' }}>
                  Agama wisdom, within reach of every sincere reader.
                </h3>
                <ul className="text-left font-sans text-[15px] md:text-[16px] text-[#001e2d]/80 space-y-4 pt-2 w-full leading-relaxed">
                  <li className="flex items-start gap-3">
                    <span className="text-[rgb(205,92,61)] mt-0.5 font-bold shrink-0">✓</span>
                    <span>To let India's Agama heritage flow beyond rare bookshelves and academies.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[rgb(205,92,61)] mt-0.5 font-bold shrink-0">✓</span>
                    <span>To bring ancient wisdom to the hands of people who want to read, reflect, and live by it.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[rgb(205,92,61)] mt-0.5 font-bold shrink-0">✓</span>
                    <span>To create an inclusive space for seekers from all walks of life.</span>
                  </li>
                </ul>
              </div>

              {/* Mission */}
              <div 
                className="flex flex-col items-center text-center space-y-5 group cursor-pointer"
                onClick={() => toggleFeature('mission')}
              >
                <div className="relative w-[80px] h-[120px] flex items-center justify-center">
                  <img alt="shape background" className={`absolute inset-0 w-full h-full object-contain transition-all duration-300 group-hover:opacity-0 group-hover:scale-90 ${activeFeature === 'mission' ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`} src="https://www.namchak.org/wp-content/uploads/2025/11/2.png" />
                  <img alt="Victory Banner" className={`relative z-10 w-full h-full object-contain transition-all duration-300 group-hover:opacity-100 group-hover:scale-100 ${activeFeature === 'mission' ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`} src="https://www.namchak.org/wp-content/uploads/2026/02/illustration-symbol-2.svg" />
                </div>
                <span className="text-[14px] font-bold tracking-[2px] text-[rgb(205,92,61)] uppercase font-sans block">MISSION</span>
                <h3 style={{ fontFamily: '"PP Fragment Glare Regular", Georgia, serif', fontSize: '22px', fontWeight: 400, color: 'rgb(0, 30, 45)', lineHeight: 1.3, minHeight: '56px' }}>
                  Preserve, retranslate, and share freely.
                </h3>
                <ul className="text-left font-sans text-[15px] md:text-[16px] text-[#001e2d]/80 space-y-4 pt-2 w-full leading-relaxed">
                  <li className="flex items-start gap-3">
                    <span className="text-[rgb(205,92,61)] mt-0.5 font-bold shrink-0">✓</span>
                    <span>Collect Agamas from authentic sources and safeguard them digitally.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[rgb(205,92,61)] mt-0.5 font-bold shrink-0">✓</span>
                    <span>Re-translate them in clear language, without losing depth or respect.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[rgb(205,92,61)] mt-0.5 font-bold shrink-0">✓</span>
                    <span>Make these sacred teachings freely accessible to all worldwide.</span>
                  </li>
                </ul>
              </div>

              {/* Importance */}
              <div 
                className="flex flex-col items-center text-center space-y-5 group cursor-pointer"
                onClick={() => toggleFeature('importance')}
              >
                <div className="relative w-[80px] h-[120px] flex items-center justify-center">
                  <img alt="shape background" className={`absolute inset-0 w-full h-full object-contain transition-all duration-300 group-hover:opacity-0 group-hover:scale-90 ${activeFeature === 'importance' ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`} src="https://www.namchak.org/wp-content/uploads/2025/11/3.png" />
                  <img alt="Auspicious Drawing" className={`relative z-10 w-full h-full object-contain transition-all duration-300 group-hover:opacity-100 group-hover:scale-100 ${activeFeature === 'importance' ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`} src="https://www.namchak.org/wp-content/uploads/2026/02/illustration-symbol-1.svg" />
                </div>
                <span className="text-[14px] font-bold tracking-[2px] text-[rgb(205,92,61)] uppercase font-sans block">IMPORTANCE</span>
                <h3 style={{ fontFamily: '"PP Fragment Glare Regular", Georgia, serif', fontSize: '22px', fontWeight: 400, color: 'rgb(0, 30, 45)', lineHeight: 1.3, minHeight: '56px' }}>
                  Keeping timeless teachings alive in a changing world.
                </h3>
                <ul className="text-left font-sans text-[15px] md:text-[16px] text-[#001e2d]/80 space-y-4 pt-2 w-full leading-relaxed">
                  <li className="flex items-start gap-3">
                    <span className="text-[rgb(205,92,61)] mt-0.5 font-bold shrink-0">✓</span>
                    <span>the reading room becomes a stable reference point for future generations.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[rgb(205,92,61)] mt-0.5 font-bold shrink-0">✓</span>
                    <span>It helps preserve our spiritual heritage in its truest and most respectful form.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[rgb(205,92,61)] mt-0.5 font-bold shrink-0">✓</span>
                    <span>It inspires mindful living, inner peace, and compassionate action.</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-20 w-full flex justify-center">
              <Link
                className="relative inline-flex items-center justify-center py-4 px-10 text-center font-bold text-[#001e2d] hover:opacity-80 transition-opacity"
                to="/#chapters"
                onClick={(e) => {
                  if (location.pathname === "/") {
                    e.preventDefault();
                    const section = document.getElementById("chapters");
                    if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
                    window.location.hash = "chapters";
                  }
                }}
                style={{ fontFamily: '"Open Sans", Helvetica, Arial, Lucida, sans-serif', fontSize: '18px', lineHeight: '18px', fontWeight: 700 }}
              >
                Learn More About The Agamas<span className="ml-2">→</span>
                <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 245 62" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path className="draw-path" d="M221.454 1.05992C209.233 1.05992 196.967 0.844056 184.758 1.23176C152.169 2.26666 119.695 6.1216 87.9185 11.0694C62.8697 14.9696 32.0837 18.8916 11.2304 30.315C6.18539 33.0786 1.43096 36.7352 1.03015 41.4414C0.265972 50.4143 14.1888 53.7299 24.416 55.5319C61.6914 62.0998 101.664 61.6475 139.728 59.8278C160.389 58.8402 181.344 57.1035 201.302 53.1262C212.268 50.9411 223.078 48.2177 232.898 44.1478C236.243 42.7616 243.25 40.0257 243.783 36.7159C243.94 35.74 244.181 34.1569 243.783 33.1933C243.336 32.1125 238.317 30.4143 237.128 30.0143C229.872 27.5744 221.408 25.6031 213.617 24.2578" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* ── DISCOVER TIMELESS WISDOM BANNER ──────────────────────────────────────── */}
        <div className="relative py-32 px-4 sm:px-6 lg:px-8 text-white overflow-hidden bg-slate-950 min-h-[60vh] flex items-center justify-center">
          <div className="absolute inset-0 z-0">
            <img alt="Discover Timeless Wisdom Background" className="w-full h-full object-cover opacity-100" src={bgTrain} />
          </div>
          <div className="relative z-10 mx-auto max-w-[1360px] w-full text-center flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="max-w-[900px] text-center flex flex-col items-center justify-center space-y-6" style={{ opacity: 1, transform: 'none' }}>
              <h2 style={{ fontStyle: 'italic', fontSize: '76px', color: 'rgb(238, 229, 218)', textAlign: 'center', lineHeight: 1.1, fontFamily: '"PP Fragment Glare Regular", "Playfair Display", Georgia, serif', fontWeight: 400 }}>
                Awaken Your Spirit
              </h2>
            </div>
          </div>
        </div>

        {/* ── OUR TEACHERS ───────────────────────────────────────────── */}
        <div id="leadership" className="pt-12 pb-8 md:pt-16 md:pb-12 text-[#001e2d]">
          <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
            <div className="text-left mb-16">
              <span className="text-[16px] font-bold tracking-[3px] text-[#001e2d]/60 uppercase font-sans">
                OUR TEACHERS
              </span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_1.3fr_1.9fr] gap-12 items-center">
              <div className="space-y-4">
                <h3 className="leading-tight text-[#001e2d]" style={{ fontFamily: '"PP Fragment Glare Regular", Georgia, serif', fontSize: 'clamp(28px, 5vw, 36px)', fontWeight: 400 }}>
                  Datuk Dr Lim Siow Jin
                </h3>
                <p style={{ fontFamily: '"PP Fragment Glare Regular", Georgia, serif', fontSize: '24px', color: 'rgb(216, 117, 25)' }}>
                  (Acharya Nagajiva)
                </p>
                <p style={{ color: 'rgb(18, 18, 18)', fontFamily: '"Open Sans", Helvetica, Arial, Lucida, sans-serif', fontSize: '16px', fontWeight: 400, lineHeight: 1.75 }}>
                  Founder of DXN and Sunyatee International Foundation, Datuk Dr Lim Siow Jin (Acharya Nagajiva) has devoted decades of his life to studying, preserving, and translating the teachings of the Buddha and India's ancient seers. Through his deep research, personal compassion, and dedication, he established The Agamas project as a digital sanctuary. Under his guidance, the foundation continues to curate and translate these classical scriptures, ensuring they remain alive, readable, and freely accessible to scholars, practitioners, and seekers across the globe.
                </p>
              </div>
              <div className="flex justify-center">
                <div className="relative w-full max-w-[400px] aspect-[3/4] overflow-hidden shadow-lg bg-slate-200 border border-[#001e2d]/10" style={{ borderRadius: '500px' }}>
                  <img alt="Datuk Dr. Lim Siow Jin" className="w-full h-full object-cover object-top" src={drLimImg} />
                </div>
              </div>
              <div className="space-y-6 lg:pl-6 border-t border-[#001e2d]/10 lg:border-t-0 lg:border-l lg:border-[#001e2d]/15 pt-8 lg:pt-0">
                <blockquote className="normal text-left leading-relaxed" style={{ fontFamily: '"PP Fragment Glare Regular", Helvetica, Arial, Lucida, sans-serif', fontSize: '26px', color: 'rgb(18, 18, 18)' }}>
                  "By preserving these ancient Agama scriptures, we keep the eternal flame of the Buddha's wisdom alive for the generations yet to come."
                </blockquote>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_1.3fr_1.9fr] gap-12 items-center mt-20">
              <div className="space-y-4">
                <h3 className="leading-tight text-[#001e2d]" style={{ fontFamily: '"PP Fragment Glare Regular", Georgia, serif', fontSize: 'clamp(28px, 5vw, 36px)', fontWeight: 400 }}>
                  Dr. Rajesh Savera
                </h3>
                <p style={{ fontFamily: '"PP Fragment Glare Regular", Georgia, serif', fontSize: '24px', color: 'rgb(216, 117, 25)' }}>
                  (Teacher & Contributor)
                </p>
                <p style={{ color: 'rgb(18, 18, 18)', fontFamily: '"Open Sans", Helvetica, Arial, Lucida, sans-serif', fontSize: '16px', fontWeight: 400, lineHeight: 1.75 }}>
                  Dr. Rajesh Savera is an instrumental part of The Agamas project. His dedication to traditional teachings and translation efforts ensures that ancient scriptures are accurately and respectfully presented for modern readers.
                </p>
              </div>
              <div className="flex justify-center">
                <div className="relative w-full max-w-[400px] aspect-[3/4] overflow-hidden shadow-lg bg-slate-200 border border-[#001e2d]/10" style={{ borderRadius: '500px' }}>
                  <img alt="Dr. Rajesh Savera" className="w-full h-full object-cover object-top" src={drRajeshImg} />
                </div>
              </div>
              <div className="space-y-6 lg:pl-6 border-t border-[#001e2d]/10 lg:border-t-0 lg:border-l lg:border-[#001e2d]/15 pt-8 lg:pt-0">
                <blockquote className="normal text-left leading-relaxed" style={{ fontFamily: '"PP Fragment Glare Regular", Helvetica, Arial, Lucida, sans-serif', fontSize: '26px', color: 'rgb(18, 18, 18)' }}>
                  "Translation is more than converting words; it is the sacred act of carrying ancient spiritual light into the modern mind."
                </blockquote>
              </div>
            </div>
          </div>
        </div>

        {/* ── 7. A DIGITAL SPACE FOR TIMELESS WISDOM (2-Column Slide Layout) ── */}
        <div className="pt-12 pb-16 md:pt-16 md:pb-20 text-[#001e2d]">
          <div className="mx-auto max-w-[1360px] grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-0 items-center px-4 sm:px-6 lg:px-8">

            {/* Left Column: Image Box */}
            <div className="flex justify-center lg:justify-start order-2 lg:order-1 mt-4 lg:mt-0">
              <div className="relative w-full max-w-[540px] aspect-[4/3] overflow-hidden shadow-xl rounded-[32px] bg-slate-200">
                <img
                  src={landingImages.readerShowcase}
                  alt="A Digital Space for Timeless Wisdom"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Right Column: Text content */}
            <div className="space-y-6 order-1 lg:order-2 -ml-0 lg:-ml-8 text-center lg:text-left">
              <h2
                className="leading-[1.15] text-[#001e2d] text-[36px] sm:text-[46px] md:text-[52px]"
                style={{
                  fontFamily: '"PP Fragment Glare Regular", Georgia, serif',
                  fontWeight: 400,
                  marginBottom: "20px"
                }}
              >
                A Digital Space for <span
                  className="text-[#cd5c3d] text-[32px] xs:text-[38px] sm:text-[50px] md:text-[56px] whitespace-nowrap"
                  style={{
                    fontFamily: '"PP Fragment Glare Regular", Georgia, serif',
                    fontStyle: "italic",
                    fontWeight: 400
                  }}
                >Timeless Wisdom</span>
              </h2>
              <div className="space-y-4">
                <p
                  className="text-[#001e2d]"
                  style={{
                    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                    fontSize: "20px",
                    fontWeight: 400
                  }}
                >
                  We're Here to Help You Find Your Path.
                </p>
                <p
                  style={{
                    fontFamily: '"Open Sans", Helvetica, Arial, Lucida, sans-serif',
                    fontSize: "17px",
                    lineHeight: "1.65",
                    color: "#001E2D",
                    opacity: 0.8,
                    fontWeight: 400
                  }}
                >
                  The Agamas is more than a scripture website. It is a digital bridge between ancient wisdom and modern seekers. Through this platform, we hope to support clarity, compassion, mindfulness, and deeper understanding in everyday life. Explore curated translations, parallel chapters, and contemplative study tools crafted to enrich your daily reading practice.
                </p>
              </div>
              <div className="pt-2 flex justify-center lg:justify-start">
                <a
                  href="#chapters"
                  className="relative inline-flex items-center justify-center py-3 px-8 text-center font-bold text-[#001e2d] hover:opacity-80 transition-opacity group"
                  style={{
                    fontFamily: '"Open Sans", Helvetica, Arial, Lucida, sans-serif',
                    fontSize: '18px',
                    fontWeight: 700
                  }}
                >
                  <span>Ready to Explore</span>
                  <svg
                    className="absolute inset-0 w-full h-full pointer-events-none transition-transform duration-300 group-hover:scale-105"
                    preserveAspectRatio="none"
                    viewBox="0 0 245 62"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      className="draw-path"
                      d="M221.454 1.05992C209.233 1.05992 196.967 0.844056 184.758 1.23176C152.169 2.26666 119.695 6.1216 87.9185 11.0694C62.8697 14.9696 32.0837 18.8916 11.2304 30.315C6.18539 33.0786 1.43096 36.7352 1.03015 41.4414C0.265972 50.4143 14.1888 53.7299 24.416 55.5319C61.6914 62.0998 101.664 61.6475 139.728 59.8278C160.389 58.8402 181.344 57.1035 201.302 53.1262C212.268 50.9411 223.078 48.2177 232.898 44.1478C236.243 42.7616 243.25 40.0257 243.783 36.7159C243.94 35.74 244.181 34.1569 243.783 33.1933C243.336 32.1125 238.317 30.4143 237.128 30.0143C229.872 27.5744 221.408 25.6031 213.617 24.2578"
                      stroke="#002031"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </a>
              </div>
            </div>

          </div>
        </div>

        {/* ── TESTIMONIALS ──────────────────────────────────────────────── */}
        <section className="pt-12 pb-16 md:pt-20 md:pb-28 text-[#001e2d]" id="testimonials">
          <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-[800px] mx-auto mb-16 space-y-2">
              <span className="uppercase tracking-[0.2em] text-[16px] font-bold text-[#888888] font-sans block text-center">
                TESTIMONIALS
              </span>
              <h2 className="text-[#001e2d]" style={{ fontFamily: '"PP Fragment Glare Regular", Georgia, serif', fontSize: 'clamp(40px, 6vw, 52px)', fontWeight: 400 }}>
                Reflections from Our <span className="italic" style={{ color: '#cd5c3d' }}>Readers</span>
              </h2>
              <p
                className="text-[#001e2d]/70 max-w-xl mx-auto mt-4"
                style={{
                  fontFamily: '"Open Sans", Helvetica, Arial, Lucida, sans-serif',
                  fontSize: '20px',
                  fontStyle: 'normal',
                  fontVariantCaps: 'normal',
                  fontVariantEastAsian: 'normal',
                  fontVariantLigatures: 'normal',
                  fontVariantNumeric: 'normal',
                  fontWeight: 400
                }}
              >
                Ancient wisdom, modern impact. Here's what our readers have to say about their journey.
              </p>
            </div>

            <div className="w-full max-w-[1180px] mx-auto overflow-hidden">
              <div className="testimonials-marquee-container">
                <div className="testimonials-marquee-group">
                  {testimonials.map((t, idx) => (
                    <div key={`t1-${idx}`} className="testimonials-card group flex flex-col justify-between bg-white border border-[#ECECEC] rounded-[20px] p-[18px] lg:p-[24px] min-h-[220px] transition-colors duration-300 ease-in-out hover:border-[#cd5c3d] cursor-pointer">
                      <div className="flex flex-col">
                        <svg className="w-[32px] h-[32px] text-[#cd5c3d] fill-current mb-[16px]" viewBox="0 0 24 24">
                          <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"></path>
                        </svg>
                        <p className="text-left text-[16px] lg:text-[16px] font-normal text-[#6F6F6F] leading-[1.8] font-sans">
                          “{t.quote}”
                        </p>
                      </div>
                      <div className="flex flex-col mt-4">
                        <div className="border-t border-[#ECECEC] my-[12px]"></div>
                        <div className="flex items-center gap-[12px]">
                          <div className="w-[40px] h-[40px] lg:w-[48px] lg:h-[48px] rounded-full bg-[#fdf8f4] border border-[#ECECEC] flex items-center justify-center shrink-0">
                            <span className="font-sans text-[18px] lg:text-[22px] font-bold text-[#cd5c3d] select-none">{t.initial}</span>
                          </div>
                          <div className="flex flex-col text-left">
                            <h4 className="font-sans text-[16px] lg:text-[16px] font-medium text-[#1D2235] mb-[4px] leading-none">{t.name}</h4>
                            <p className="font-sans text-[14px] lg:text-[15px] font-normal text-[#777777] leading-none">{t.role}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="testimonials-marquee-group" aria-hidden="true">
                  {testimonials.map((t, idx) => (
                    <div key={`t2-${idx}`} className="testimonials-card group flex flex-col justify-between bg-white border border-[#ECECEC] rounded-[20px] p-[18px] lg:p-[24px] min-h-[220px] transition-colors duration-300 ease-in-out hover:border-[#cd5c3d] cursor-pointer">
                      <div className="flex flex-col">
                        <svg className="w-[32px] h-[32px] text-[#cd5c3d] fill-current mb-[16px]" viewBox="0 0 24 24">
                          <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"></path>
                        </svg>
                        <p className="text-left text-[16px] lg:text-[16px] font-normal text-[#6F6F6F] leading-[1.8] font-sans">
                          “{t.quote}”
                        </p>
                      </div>
                      <div className="flex flex-col mt-4">
                        <div className="border-t border-[#ECECEC] my-[12px]"></div>
                        <div className="flex items-center gap-[12px]">
                          <div className="w-[40px] h-[40px] lg:w-[48px] lg:h-[48px] rounded-full bg-[#fdf8f4] border border-[#ECECEC] flex items-center justify-center shrink-0">
                            <span className="font-sans text-[18px] lg:text-[22px] font-bold text-[#cd5c3d] select-none">{t.initial}</span>
                          </div>
                          <div className="flex flex-col text-left">
                            <h4 className="font-sans text-[16px] lg:text-[16px] font-medium text-[#1D2235] mb-[4px] leading-none">{t.name}</h4>
                            <p className="font-sans text-[14px] lg:text-[15px] font-normal text-[#777777] leading-none">{t.role}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────────── */}
        <section className="pt-10 pb-20" id="faq">
          <div className="max-w-screen-md mx-auto px-6">
            <div className="text-center mb-12 flex flex-col items-center gap-2 md:gap-3">
              <p className="uppercase tracking-[0.2em] text-[16px] font-bold text-[#888] font-sans">
                FREQUENTLY ASKED QUESTIONS
              </p>
              <h2 className="text-[52px] text-[#001e2d] font-agamas-faq font-normal">
                You Ask? We <span className="text-[#cd5c3d] italic font-normal">Answer</span>
              </h2>
            </div>

            <div className="bg-white/45 border border-[#001e2d]/5 rounded-[32px] divide-y divide-[#001e2d]/5 overflow-hidden shadow-sm">
              {[
                {
                  q: "What is The Agamas website about?",
                  a: "The Agamas website is a digital platform that shares Agama texts and teachings in an organized format for reading, study, and reflection.",
                },
                {
                  q: "Who can use this website?",
                  a: "Students, researchers, readers, and anyone interested in ancient classical knowledge can use this website.",
                },
                {
                  q: "Are the teachings available in multiple languages?",
                  a: "Yes. The website includes English and Chinese content for selected texts.",
                },
                {
                  q: "What type of teachings are available?",
                  a: "The website includes teachings on awareness, generosity, good conduct, good friendship, right view, the Five Precepts, and other classical topics.",
                },
                {
                  q: "Is this website useful for personal practice?",
                  a: "Yes. Many teachings on the website are related to awareness, breathing, reflection, and inner development, which can support personal practice.",
                },
                {
                  q: "Is the content arranged chapter-wise?",
                  a: "Yes. The texts are organized by chapters and sections, making it easier to browse and study.",
                },
                {
                  q: "Can I use this website for research?",
                  a: "Yes. The structured format can be useful for classical studies, comparative reading, and personal research.",
                },
              ].map((faq, idx) => {
                const isOpen = activeFaq === idx;
                return (
                  <div
                    key={idx}
                    className="w-full overflow-hidden"
                  >
                    <button
                      className="w-full flex items-center justify-between p-6 md:px-8 md:py-6 text-left focus:outline-none group cursor-pointer transition-colors"
                      onClick={() => setActiveFaq(isOpen ? null : idx)}
                    >
                      <span className="text-[16px] font-sans font-semibold transition-colors text-[#001e2d] group-hover:text-[#cd5c3d] pr-4">
                        {faq.q}
                      </span>
                      <span
                        className={`text-[#001e2d]/60 group-hover:text-[#cd5c3d] transition-colors shrink-0 ml-4 flex items-center justify-center transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus w-5 h-5 stroke-[2.5]" aria-hidden="true">
                          {isOpen ? (
                            <path d="M5 12h14"></path>
                          ) : (
                            <>
                              <path d="M5 12h14"></path>
                              <path d="M12 5v14"></path>
                            </>
                          )}
                        </svg>
                      </span>
                    </button>
                    <div
                      className={`transition-all duration-300 ease-in-out ${isOpen ? "max-h-60" : "max-h-0"} overflow-hidden`}
                    >
                      <div className="px-6 md:px-8 pb-6 text-sm md:text-[15px] text-[#001e2d]/70 leading-relaxed bg-transparent">
                        {faq.a}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Contact Banner */}
        <section className="relative py-24 md:py-32 flex items-center justify-center text-center bg-[#050b10]">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50"
            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1518182170546-076616fd4627?q=80&w=2000&auto=format&fit=crop")' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050b10] via-[#050b10]/60 to-transparent" />
          <div className="absolute inset-0 bg-black/40" />

          <div className="relative z-10 max-w-4xl mx-auto px-6 flex flex-col items-center">
            <h2 className="text-4xl md:text-[56px] text-[#fdf8f4] font-agamas-faq font-normal leading-tight mb-8">
              Have Questions? Connect<br className="hidden md:block" /> With Us
            </h2>
            <p className="text-[#cbd5e1] font-sans text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-10 opacity-90">
              Whether you want to learn more about the Agama scriptures, inquire about our translations, or collaborate, we are here to support your journey.
            </p>
            <Link
              to="/contact-us"
              className="relative inline-flex items-center justify-center py-4 px-10 text-center font-bold transition-opacity hover:opacity-80 group"
              style={{
                color: "#EEE5DA",
                fontFamily: '"Open Sans", Helvetica, Arial, Lucida, sans-serif',
                fontSize: "18px",
                lineHeight: "18px",
                fontWeight: "700"
              }}
            >
              Contact Us<span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
              <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 245 62" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path className="draw-path" d="M221.454 1.05992C209.233 1.05992 196.967 0.844056 184.758 1.23176C152.169 2.26666 119.695 6.1216 87.9185 11.0694C62.8697 14.9696 32.0837 18.8916 11.2304 30.315C6.18539 33.0786 1.43096 36.7352 1.03015 41.4414C0.265972 50.4143 14.1888 53.7299 24.416 55.5319C61.6914 62.0998 101.664 61.6475 139.728 59.8278C160.389 58.8402 181.344 57.1035 201.302 53.1262C212.268 50.9411 223.078 48.2177 232.898 44.1478C236.243 42.7616 243.25 40.0257 243.783 36.7159C243.94 35.74 244.181 34.1569 243.783 33.1933C243.336 32.1125 238.317 30.4143 237.128 30.0143C229.872 27.5744 221.408 25.6031 213.617 24.2578" stroke="#EEE5DA" strokeWidth="1.5" strokeLinecap="round"></path>
              </svg>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
