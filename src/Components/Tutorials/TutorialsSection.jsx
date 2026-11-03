import { collection, getDocs } from "firebase/firestore";
import { Play, X, ChevronRight, Sparkles, BookOpen, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db } from "../../firebase";

export default function TutorialsSection() {
  const [tutorials, setTutorials] = useState([]);
  const [activeModalVideo, setActiveModalVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTutorials() {
      try {
        setLoading(true);
        const snapshot = await getDocs(collection(db, "tutorials"));
        const list = snapshot.docs.map((doc) => {
          const d = doc.data();
          return {
            id: doc.id,
            title: d.title || "Untitled Tutorial",
            description: d.description || "",
            position: Number(d.position ?? d.Position ?? 99),
            videoURL: d.videoURL || d.VideoURL || "",
            thumbnailURL: d.thumbnailURL || d.thumbnailURl || d.thumnailURL || "",
            category: d.category || "tutorial",
          };
        });
        list.sort((a, b) => a.position - b.position);
        setTutorials(list);
      } catch (err) {
        console.error("Error loading tutorials section:", err);
      } finally {
        setLoading(false);
      }
    }
    loadTutorials();
  }, []);

  if (!loading && tutorials.length === 0) return null;

  return (
    <section className="py-12 md:py-16 bg-[#fbf6f1]/60 border-y border-[#ece3dc]" aria-label="Website Tutorials">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#cd5c3d14] text-[#cd5c3d] mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>LEARN & EXPLORE</span>
            </div>
            <h2
              className="text-[#001e2d] font-normal leading-tight"
              style={{
                fontFamily: '"PP Fragment Glare Regular", Georgia, serif',
                fontSize: "clamp(32px, 5vw, 44px)",
              }}
            >
              Website <span style={{ color: "#cd5c3d", fontStyle: "italic" }}>Tutorials</span>
            </h2>
            <p className="text-sm md:text-base text-[#666] mt-2 max-w-xl">
              Quick video guides to help you explore texts, use parallel views, sign in, and make the most of The Agamas platform.
            </p>
          </div>

          <Link
            to="/tutorials"
            className="inline-flex items-center gap-2 self-start md:self-auto text-sm font-semibold text-[#cd5c3d] hover:text-[#b8503a] border border-[#cd5c3d50] hover:border-[#cd5c3d] px-4 py-2.5 rounded-xl transition duration-150 bg-white shadow-xs group"
          >
            <span>View All Tutorials</span>
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Tutorials Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading
            ? [1, 2, 3, 4].map((i) => (
                <div key={i} className="h-64 bg-[#ebdcd3] rounded-2xl animate-pulse" />
              ))
            : tutorials.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setActiveModalVideo(t)}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#e8dfd8] bg-white shadow-xs hover:border-[#cd5c3d70] hover:shadow-lg transition-all duration-200 cursor-pointer text-left"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video w-full overflow-hidden bg-[#1e1410]">
                    <img
                      src={t.thumbnailURL}
                      alt={t.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Badge */}
                    <div className="absolute top-2.5 left-2.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-black/65 backdrop-blur-md text-white border border-white/20">
                        Guide {t.position}
                      </span>
                    </div>

                    {/* Play Button */}
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <div className="rounded-full bg-white/90 p-3 shadow-lg text-[#cd5c3d] group-hover:bg-[#cd5c3d] group-hover:text-white group-hover:scale-110 transition-all duration-200">
                        <Play className="h-5 w-5 fill-current" />
                      </div>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
                    <div>
                      <h3 className="font-semibold text-sm sm:text-[15px] text-[#1e1e1e] line-clamp-2 leading-snug group-hover:text-[#cd5c3d] transition-colors">
                        {t.title}
                      </h3>
                      <p className="mt-2 text-xs text-[#666] line-clamp-2 leading-relaxed">
                        {t.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#f2eae4] flex items-center justify-between text-xs font-semibold text-[#cd5c3d]">
                      <span>Watch Video</span>
                      <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              ))}
        </div>
      </div>

      {/* ── Video Modal Player ────────────────────────────────────── */}
      {activeModalVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 sm:p-6"
          onClick={() => setActiveModalVideo(null)}
        >
          <div
            className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-white/20 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-[#fdf8f4]">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#cd5c3d]">
                  Tutorial 0{activeModalVideo.position}
                </span>
                <h3 className="text-base sm:text-lg font-semibold text-[#1e1e1e] truncate max-w-md sm:max-w-xl">
                  {activeModalVideo.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalVideo(null)}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-200 hover:text-black transition cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player */}
            <div className="relative aspect-video bg-black">
              <video
                controls
                autoPlay
                playsInline
                poster={activeModalVideo.thumbnailURL}
                src={activeModalVideo.videoURL}
                className="w-full h-full object-contain"
              >
                Your browser does not support HTML5 video.
              </video>
            </div>

            {/* Modal Footer / Description */}
            <div className="p-5 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-xs sm:text-sm text-[#666] leading-relaxed max-w-2xl">
                {activeModalVideo.description}
              </p>
              <Link
                to={`/tutorials?id=${activeModalVideo.position || activeModalVideo.id}`}
                onClick={() => setActiveModalVideo(null)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#cd5c3d] hover:underline whitespace-nowrap self-end sm:self-center"
              >
                <span>Open in Tutorials Hub</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

