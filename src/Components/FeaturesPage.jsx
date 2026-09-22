import { Link } from "react-router-dom";

const FeaturesPage = () => {
  const features = [
    {
      title: "Structured Text Library",
      desc: "All teachings are organized by chapters and text numbers, making it easy to search and study.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-layers w-6 h-6" aria-hidden="true"><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"></path><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"></path><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"></path></svg>
      )
    },
    {
      title: "Bilingual Content",
      desc: "English and Chinese content helps readers understand the teachings across language traditions.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles w-6 h-6" aria-hidden="true"><path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"></path><path d="M20 2v4"></path><path d="M22 4h-4"></path><circle cx="4" cy="20" r="2"></circle></svg>
      )
    },
    {
      title: "Clean Reading Experience",
      desc: "The website is designed for focused reading without unnecessary distractions.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-moon w-6 h-6" aria-hidden="true"><path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"></path></svg>
      )
    },
    {
      title: "Topic-Based Learning",
      desc: "Users can explore teachings related to awareness, good conduct, generosity, right view, and personal growth.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-activity w-6 h-6" aria-hidden="true"><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"></path></svg>
      )
    },
    {
      title: "Accessible Anytime",
      desc: "The platform allows users to access Agama teachings from anywhere through a digital format.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-smartphone w-6 h-6" aria-hidden="true"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"></rect><path d="M12 18h.01"></path></svg>
      )
    },
    {
      title: "Useful for Students & Readers",
      desc: "Suitable for learners, researchers, and anyone interested in these early classical texts.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-heart w-6 h-6" aria-hidden="true"><path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"></path></svg>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-[#fffdf8] pt-12 pb-24">
      <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <div className="mb-8 -ml-1">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#cd5c3d] hover:opacity-80 transition font-sans"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left h-4 w-4" aria-hidden="true">
              <path d="m12 19-7-7 7-7"></path>
              <path d="M19 12H5"></path>
            </svg>
            Back to Home
          </Link>
        </div>

        {/* Header */}
        <div className="text-center max-w-[800px] mx-auto mb-16 space-y-4">
          <span className="text-[16px] font-bold tracking-[3px] text-[#001e2d]/60 uppercase font-sans block mb-4 text-center">
            FEATURES
          </span>
          <h2 className="text-[#001e2d] text-center" style={{ fontFamily: '"PP Fragment Glare Regular", Georgia, serif', fontSize: 'clamp(40px, 6vw, 52px)', lineHeight: 1, fontWeight: 400 }}>
            Why Choose <span style={{ fontStyle: 'italic', color: '#cd5c3d', fontSize: 'clamp(52px, 6vw, 62px)', fontWeight: 400 }}>The Agamas</span>
          </h2>
          <p className="text-[#001e2d]/85 text-[24px] max-w-[620px] mx-auto font-sans leading-relaxed text-center mt-4">
            The platform is designed to make ancient wisdom easy to access, read, and reflect upon.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="relative overflow-hidden bg-[#fffdf8] border border-[#ECECEC] rounded-3xl p-8 pt-20 text-left space-y-4 transition-all duration-300 hover:border-[#D8C3A5]"
            >
              <div className="absolute top-0 left-0 w-16 h-16 bg-[#F8F3EC] border-r border-b border-[#ECECEC] rounded-br-[24px] flex items-center justify-center text-[#cd5c3d]">
                {feature.icon}
              </div>
              <div className="w-8 h-[2px] bg-[#cd5c3d]"></div>
              <h3 style={{ fontFamily: '"PP Fragment Glare Regular", Georgia, serif', fontSize: '20px', fontWeight: 'bold', color: '#001e2d' }}>
                {feature.title}
              </h3>
              <p className="text-[#001e2d]/70 text-[16px] leading-relaxed font-sans">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturesPage;
