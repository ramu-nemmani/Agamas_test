import { useState } from "react";
import SEO from "./SEO";
import { Link } from "react-router-dom";

export default function FAQPage() {
  const [activeFaq, setActiveFaq] = useState(null);

  const faqs = [
    { q: "What is The Agamas website about?", a: "The Agamas website is a digital platform that shares Agama Buddhist scriptures and teachings in an organized format for reading, study, and reflection." },
    { q: "Who can use this website?", a: "Students, researchers, Buddhist practitioners, meditation learners, and anyone interested in ancient spiritual wisdom can use this website." },
    { q: "Are the teachings available in multiple languages?", a: "Yes. The website includes English and Chinese content for selected sutras." },
    { q: "What type of teachings are available?", a: "The website includes teachings on mindfulness, generosity, morality, the Three Jewels, good friendship, right view, the Five Precepts, and other Dharma topics." },
    { q: "Is this website useful for meditation practice?", a: "Yes. Many teachings on the website are related to mindfulness, breathing, tranquility, impermanence, and reflection, which can support meditation practice." },
    { q: "Is the content arranged chapter-wise?", a: "Yes. The sutras are organized by chapters and sections, making it easier to browse and study." },
    { q: "Can I use this website for research?", a: "Yes. The structured format can be useful for Buddhist studies, comparative reading, and personal research." }
  ];


  return (
    <div className="min-h-screen bg-[#fdf8f4] text-[#0a0a0a] font-sans pb-16 md:pb-24">
      <SEO
        title="FAQ | Questions and Answers about The Agamas and Teachings"
        description="Find answers to common questions about the Agama scriptures, translations, study resources, and digital preservation initiatives."
        name="The Agamas"
        type="website"
      />

      {/* Hero Section */}
      <section className="relative pt-8 md:pt-10 pb-8 md:pb-10 overflow-hidden border-b border-[#e8e0d8]/40">
        <div className="absolute inset-0 bg-gradient-to-br from-[#fdf3ec] via-[#fdf8f4] to-[#f5ede4] pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-[#cd5c3d0d] rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <div className="text-center mb-8 flex flex-col items-center gap-2 md:gap-3">
            <p className="uppercase tracking-[0.2em] text-[16px] font-bold text-[#888] font-sans">
              FREQUENTLY ASKED QUESTIONS
            </p>
            <h1 className="text-[52px] text-[#001e2d] font-agamas-faq font-normal">
              You Ask? We <span className="text-[#cd5c3d] italic font-normal">Answer</span>
            </h1>
          </div>
          <p className="max-w-2xl mx-auto text-[#555] text-base md:text-lg leading-relaxed">
            Find answers to common questions about the platform, scriptural formats, translation languages, and usage guidelines.
          </p>
        </div>
      </section>

      {/* FAQ content */}
      <section className="py-16 md:py-20 border-b border-[#e8e0d8]/40 bg-[#fdfdfd]/50">
        <div className="max-w-screen-md mx-auto px-6">
          <div className="bg-white/45 border border-[#001e2d]/5 rounded-[32px] divide-y divide-[#001e2d]/5 overflow-hidden shadow-sm">
            {faqs.map((faq, idx) => {
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
    </div>
  );
}
