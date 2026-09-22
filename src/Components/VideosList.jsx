import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { dbVideos } from "../firebase";

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
    <h3 className="text-lg font-semibold text-[#1e1e1e]">No videos yet</h3>
    <p className="mt-1 max-w-sm text-sm text-[#888]">
      Episodes will appear here as soon as they're published.
    </p>
  </div>
);

/* ── Episode Badge ─────────────────────────────────────────────────── */
const Badge = ({ children }) => (
  <span className="inline-flex items-center rounded-full bg-[#cd5c3d12] border border-[#cd5c3d30] px-2.5 py-0.5 text-xs font-semibold text-[#cd5c3d]">
    {children}
  </span>
);

/* ── Video Card ────────────────────────────────────────────────────── */
const VideoCard = ({ video, onClick, active }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex w-full flex-col overflow-hidden rounded-2xl border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#cd5c3d] focus-visible:ring-offset-2 text-left ${active
        ? "border-[#cd5c3d] shadow-[0_8px_30px_rgba(205,92,61,0.2)]"
        : "border-[#e8e0d8] bg-white hover:border-[#cd5c3d60]"
        }`}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden bg-[#1e1410]">
        <img
          src={video.thumbnailImg}
          alt="Play"
          className="aspect-video w-full"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Play overlay */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <div className="rounded-full bg-white/90 p-3 shadow-lg">
            <Play className="h-5 w-5 text-[#cd5c3d] fill-[#cd5c3d]" />
          </div>
        </div>

        {/* Active ring */}
        {active && (
          <div className="pointer-events-none absolute inset-0 ring-2 ring-inset ring-[#cd5c3d]" />
        )}
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
          <p className="line-clamp-2 text-xs text-[#777] leading-relaxed">
            {video.description}
          </p>
        )}
      </div>
    </button>
  );
};

/* ── Episodes Grid ─────────────────────────────────────────────────── */
const VideoRow = ({ videos, setSelectedVideo, selectedVideo }) => {
  const scroller = useRef(null);
  const handleSelectVideo = (video) => {
    setSelectedVideo(video);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const handler = (e) => {
      if (!["ArrowLeft", "ArrowRight"].includes(e.key)) return;
      const idx = videos.findIndex((v) => v.id === selectedVideo?.id);
      if (idx === -1) return;
      if (e.key === "ArrowRight" && idx < videos.length - 1)
        setSelectedVideo(videos[idx + 1]);
      if (e.key === "ArrowLeft" && idx > 0) setSelectedVideo(videos[idx - 1]);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [videos, selectedVideo, setSelectedVideo]);

  return (
    <div
      ref={scroller}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4"
    >
      {videos.map((video) => (
        <VideoCard
          key={video.id}
          video={video}
          active={selectedVideo?.id === video.id}
          onClick={() => handleSelectVideo(video)}
        />
      ))}
    </div>
  );
};

/* ── Main Page ─────────────────────────────────────────────────────── */
export default function VideosListPage() {
  const [loading, setLoading] = useState(false);
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(undefined);
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedId = searchParams.get("id");
  const currentQueryId = searchParams.get("id");

  useEffect(() => {
    async function fetchVideos() {
      setLoading(true);
      setError("");
      try {
        const snapshot = await getDocs(
          query(
            collection(dbVideos, "videos"),
            where("seasonId", "==", "KqFUsBbdmHCcXuLIdiid"),
            orderBy("position", "asc"),
          ),
        );
        const vids = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setVideos(vids);
        const initialVideo =
          vids.find((v) => String(v.position) === String(requestedId)) ||
          vids.find((v) => String(v.id) === String(requestedId)) ||
          vids[0];
        setSelectedVideo(initialVideo);
      } catch (e) {
        setError("Failed to load videos. Please try again.");
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchVideos();
  }, []);

  const getVideoLanguage = (video) => {
    if (!video?.language) return "Unknown";
    const lang = video.language.toLowerCase();
    return lang.charAt(0).toUpperCase() + lang.slice(1);
  };

  const languageOptions = Array.from(
    new Set(videos.map((video) => getVideoLanguage(video)).filter(Boolean)),
  );

  const filteredVideos =
    selectedLanguage === "all"
      ? videos
      : videos.filter((video) => getVideoLanguage(video) === selectedLanguage);

  useEffect(() => {
    if (!filteredVideos.length) {
      setSelectedVideo(undefined);
      return;
    }
    if (
      selectedVideo &&
      filteredVideos.some((video) => video.id === selectedVideo.id)
    ) {
      return;
    }
    const nextSelected =
      filteredVideos.find((v) => String(v.position) === String(requestedId)) ||
      filteredVideos.find((v) => String(v.id) === String(requestedId)) ||
      filteredVideos[0];
    setSelectedVideo(nextSelected);
  }, [filteredVideos, selectedVideo, requestedId]);

  useEffect(() => {
    if (!selectedVideo) return;
    const selectedId = String(selectedVideo.position ?? selectedVideo.id);
    if (currentQueryId === selectedId) return;
    setSearchParams({ id: selectedId }, { replace: true });
  }, [selectedVideo, currentQueryId, setSearchParams]);

  const hasVideos = filteredVideos && filteredVideos.length > 0;

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
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left h-4 w-4" aria-hidden="true">
                <path d="m12 19-7-7 7-7"></path>
                <path d="M19 12H5"></path>
              </svg>
              Back to Home
            </Link>
          </div>

          {/* Header */}
          <div className="text-center max-w-[800px] mx-auto space-y-4">
            <span className="text-[16px] font-bold tracking-[3px] text-[#001e2d]/60 uppercase font-sans block mb-4 text-center">
              MEDIA LIBRARY
            </span>
            <h2 className="text-[#001e2d] text-center" style={{ fontFamily: '"PP Fragment Glare Regular", Georgia, serif', fontSize: 'clamp(40px, 6vw, 52px)', lineHeight: 1, fontWeight: 400 }}>
              Video <span style={{ fontStyle: 'italic', color: '#cd5c3d', fontSize: 'clamp(52px, 6vw, 62px)', fontWeight: 400 }}>Episodes</span>
            </h2>
            <p className="text-[#001e2d]/85 text-[24px] max-w-[620px] mx-auto font-sans leading-relaxed text-center mt-4">
              Curated teachings — watch and explore episodes.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-screen-xl mx-auto px-6 md:px-10 py-10">
        {/* ── Player + Meta ───────────────────────────────────────── */}
        <section className="items-start gap-6  mb-10">
          {/* Player */}
          <div className="">
            <div className="relative overflow-hidden rounded-2xl border border-[#e8e0d8] bg-[#1e1410] shadow-md ">
              {loading && (
                <Skeleton className="aspect-video w-full rounded-none bg-[#2a1a10]" />
              )}
              {!loading && hasVideos && (
                <video
                  key={selectedVideo?.id}
                  className="aspect-video h-full w-full object-cover"
                  src={selectedVideo?.videoURL}
                  controls
                  muted
                  loop
                  playsInline
                />
              )}
              {!loading && !hasVideos && (
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
              ) : hasVideos ? (
                <>
                  <h2 className="text-2xl font-semibold text-[#1e1e1e]">
                    {selectedVideo?.title}
                  </h2>
                  {selectedVideo?.description && (
                    <p className="mt-2 text-base leading-relaxed text-[#555]">
                      {selectedVideo.description}
                    </p>
                  )}
                </>
              ) : null}
            </div>
          </div>
        </section>

        {/* ── Episodes ────────────────────────────────────────────── */}
        <section>
          <div className="mb-6 md:flex items-center justify-between ">
            <div>
              <h3 className="text-xl font-semibold text-[#1e1e1e]">
                All Episodes
              </h3>
              {hasVideos && (
                <p className="text-sm text-[#888] mt-0.5">
                  {filteredVideos.length} episode
                  {filteredVideos.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <label
                  htmlFor="video-language-filter"
                  className="text-xs font-semibold uppercase tracking-wider text-[#888]"
                >
                  Language
                </label>
              </div>
              <div className="relative">
                <select
                  id="video-language-filter"
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="appearance-none rounded-xl border border-[#e8e0d8] bg-white px-3 py-2 pr-8 text-sm text-[#444] outline-none transition focus:border-[#cd5c3d]"
                >
                  <option value="all">All Languages</option>
                  {languageOptions.map((language) => (
                    <option key={language} value={language}>
                      {language}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#999] text-xs">
                  ▼
                </span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 ">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-2xl border border-[#e8e0d8] bg-white"
                >
                  <Skeleton className="aspect-video w-full rounded-none" />
                  <div className="space-y-2 p-4">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-5/6" />
                  </div>
                </div>
              ))}
            </div>
          ) : hasVideos ? (
            <VideoRow
              videos={filteredVideos}
              setSelectedVideo={setSelectedVideo}
              selectedVideo={selectedVideo}
            />
          ) : (
            <EmptyState />
          )}
        </section>
      </div>

      {/* Error toast */}
      {error && (
        <div className="fixed bottom-6 left-1/2 z-50 w-[92%] max-w-md -translate-x-1/2 rounded-xl border border-[#cd5c3d30] bg-[#fdf3ec] px-4 py-3 text-[#cd5c3d] shadow-lg text-sm font-medium">
          {error}
        </div>
      )}
    </div>
  );
}
