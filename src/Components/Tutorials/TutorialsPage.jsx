import { collection, getDocs } from "firebase/firestore";
import { Play, ArrowLeft } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { db } from "../../firebase";

/* ── Skeleton ──────────────────────────────────────────────────────── */
const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse rounded-xl bg-[#f0e3dc] ${className}`} />
);

/* ── Empty State ───────────────────────────────────────────────────── */
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-[#e8e0d8]">
    <div className="mb-4 h-14 w-14 rounded-full bg-[#cd5c3d12] flex items-center justify-center">
      <Play className="w-6 h-6 text-[#cd5c3d]" />
    </div>
    <h3 className="text-lg font-semibold text-[#1e1e1e]">No tutorials yet</h3>
    <p className="mt-1 max-w-sm text-sm text-[#888]">
      Tutorials will appear here as soon as they're published.
    </p>
  </div>
);

/* ── Badge ─────────────────────────────────────────────────────────── */
const Badge = ({ children }) => (
  <span className="inline-flex items-center rounded-full bg-[#cd5c3d12] border border-[#cd5c3d30] px-2.5 py-0.5 text-xs font-semibold text-[#cd5c3d] whitespace-nowrap shrink-0">
    {children}
  </span>
);

/* ── Video Card ────────────────────────────────────────────────────── */
const VideoCard = ({ video, onClick, active }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex w-full flex-col overflow-hidden rounded-2xl border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#cd5c3d] focus-visible:ring-offset-2 text-left cursor-pointer ${
        active
          ? "border-[#cd5c3d] shadow-sm"
          : "border-[#e8e0d8] bg-white hover:border-gray-300 hover:shadow-sm"
      }`}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden bg-[#1e1410]">
        <img
          src={video.thumbnailURL}
          alt={video.title}
          className="aspect-video w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Play overlay */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <div className="rounded-full bg-white/90 p-3 shadow-lg">
            <Play className="h-5 w-5 text-[#cd5c3d] fill-[#cd5c3d]" />
          </div>
        </div>


      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-2 bg-white p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-sm font-semibold text-[#1e1e1e] leading-snug">
            {video.title}
          </h3>
          {video?.label && <Badge>{video.label}</Badge>}
        </div>
        {video?.description && (
          <p className="line-clamp-2 text-xs text-[#666] leading-relaxed">
            {video.description}
          </p>
        )}
      </div>
    </button>
  );
};

/* ── Main Page ─────────────────────────────────────────────────────── */
export default function TutorialsPage() {
  const [loading, setLoading] = useState(false);
  const [tutorials, setTutorials] = useState([]);
  const [selectedTutorial, setSelectedTutorial] = useState(undefined);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);
  const [error, setError] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedId = searchParams.get("id");
  const currentQueryId = searchParams.get("id");

  useEffect(() => {
    async function fetchTutorials() {
      setLoading(true);
      setError("");
      try {
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
            label: `Part ${d.position ?? d.Position ?? ""}`,
          };
        });

        // Sort by position ascending
        list.sort((a, b) => a.position - b.position);
        setTutorials(list);

        const initialTutorial =
          list.find((v) => String(v.position) === String(requestedId)) ||
          list.find((v) => String(v.id) === String(requestedId)) ||
          list[0];

        setSelectedTutorial(initialTutorial);
      } catch (e) {
        setError("Failed to load tutorials. Please try again.");
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchTutorials();
  }, []);

  useEffect(() => {
    if (!selectedTutorial) return;
    setIsPlaying(false);
    const selectedId = String(selectedTutorial.position ?? selectedTutorial.id);
    if (currentQueryId === selectedId) return;
    setSearchParams({ id: selectedId }, { replace: true });
  }, [selectedTutorial, currentQueryId, setSearchParams]);

  // Arrow key navigation
  useEffect(() => {
    const handler = (e) => {
      if (!["ArrowLeft", "ArrowRight"].includes(e.key)) return;
      const idx = tutorials.findIndex((v) => v.id === selectedTutorial?.id);
      if (idx === -1) return;
      if (e.key === "ArrowRight" && idx < tutorials.length - 1) {
        setSelectedTutorial(tutorials[idx + 1]);
      }
      if (e.key === "ArrowLeft" && idx > 0) {
        setSelectedTutorial(tutorials[idx - 1]);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [tutorials, selectedTutorial]);

  const handleSelectTutorial = (tutorial) => {
    setSelectedTutorial(tutorial);
    setIsPlaying(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePlayVideo = () => {
    setIsPlaying(true);
    if (videoRef.current) {
      videoRef.current.play().catch((err) => {
        console.log("Play interrupted:", err);
      });
    }
  };

  const hasTutorials = tutorials && tutorials.length > 0;

  return (
    <div className="min-h-screen bg-[#fdf8f4]">
      {/* Decorative background blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 -top-32 h-96 w-[700px] -translate-x-1/2 rounded-full bg-[#cd5c3d0a] blur-3xl" />
        <div className="absolute right-[-100px] bottom-[-100px] h-64 w-[460px] rounded-full bg-[#cd5c3d06] blur-3xl" />
      </div>

      {/* ── Page Header ────────────────────────────────────────────── */}
      <section className="pt-12 pb-8">
        <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
          {/* Back Link */}
          <div className="mb-8 -ml-1">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#cd5c3d] hover:opacity-80 transition font-sans"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </div>

          {/* Header */}
          <div className="text-center max-w-[800px] mx-auto space-y-4">
            <span className="text-[14px] font-bold tracking-[3px] text-[#888888] uppercase font-sans block mb-4 text-center">
              TUTORIALS
            </span>
            <h2
              className="text-[#001e2d] text-center"
              style={{
                fontFamily: '"PP Fragment Glare Regular", Georgia, serif',
                fontSize: "clamp(40px, 6vw, 52px)",
                lineHeight: 1,
                fontWeight: 400,
              }}
            >
              Step-by-Step{" "}
              <span style={{ fontStyle: "italic", color: "#cd5c3d", fontWeight: 400 }}>
                Video Guides
              </span>
            </h2>
            <p className="section-description text-center max-w-2xl mx-auto">
              Learn how to explore The Agamas, use reading features, and navigate translations.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-screen-xl mx-auto px-6 md:px-10 py-10">
        {/* ── Player + Meta ───────────────────────────────────────── */}
        <section className="items-start gap-6 mb-10">
          <div className="">
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-[#e8e0d8] bg-[#1e1410] shadow-md group">
              {loading && (
                <Skeleton className="aspect-video w-full rounded-none bg-[#2a1a10]" />
              )}
              {!loading && hasTutorials && (
                <>
                  <video
                    ref={videoRef}
                    key={selectedTutorial?.id}
                    className="aspect-video h-full w-full object-cover"
                    src={selectedTutorial?.videoURL}
                    poster={selectedTutorial?.thumbnailURL}
                    controls
                    preload="metadata"
                    playsInline
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                  />
                  {!isPlaying && selectedTutorial?.thumbnailURL && (
                    <div
                      onClick={handlePlayVideo}
                      className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors"
                    >
                      <img
                        src={selectedTutorial.thumbnailURL}
                        alt={selectedTutorial.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      <div className="relative z-10 rounded-full bg-white/90 p-4 shadow-xl text-[#cd5c3d] group-hover:scale-110 group-hover:bg-[#cd5c3d] group-hover:text-white transition-all duration-200">
                        <Play className="h-8 w-8 fill-current ml-0.5" />
                      </div>
                    </div>
                  )}
                </>
              )}
              {!loading && !hasTutorials && (
                <div className="aspect-video flex items-center justify-center">
                  <Play className="w-12 h-12 text-[#cd5c3d40]" />
                </div>
              )}
            </div>

            {/* Title & Description */}
            <div className="pt-5">
              {loading ? (
                <>
                  <Skeleton className="mb-2 h-7 w-2/3" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="mt-2 h-4 w-4/6" />
                </>
              ) : hasTutorials ? (
                <>
                  <h2
                    className="font-semibold text-[#1e1e1e]"
                    style={{ fontSize: "20px" }}
                  >
                    {selectedTutorial?.title}
                  </h2>
                  {selectedTutorial?.description && (
                    <p
                      className="mt-2 text-[#555555] font-normal leading-[1.625] font-sans"
                      style={{ fontSize: "18px" }}
                    >
                      {selectedTutorial.description}
                    </p>
                  )}
                </>
              ) : null}
            </div>
          </div>
        </section>

        {/* ── Episodes / Tutorials Grid ────────────────────────────── */}
        <section>
          <div className="mb-6 md:flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-[#1e1e1e]">
                All Video Guides
              </h3>
              {hasTutorials && (
                <p className="text-sm text-[#888] mt-0.5">
                  {tutorials.length} guide{tutorials.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="aspect-video h-64 w-full" />
              ))}
            </div>
          ) : !hasTutorials ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
              {tutorials.map((tutorial) => (
                <VideoCard
                  key={tutorial.id}
                  video={tutorial}
                  active={selectedTutorial?.id === tutorial.id}
                  onClick={() => handleSelectTutorial(tutorial)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
