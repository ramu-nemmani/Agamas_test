import { useNavigate } from "react-router-dom";
import { useReadingProgress } from "../../../hooks/useReadingProgress";
import { Feather } from "lucide-react";
import BookCover from "../../common/BookCover";

// Inline Skeleton (since SutraCardSkeleton is missing)
function SutraCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 animate-pulse">
      <div className="aspect-[2/3] w-full rounded-2xl bg-black/10" />
      <div className="h-4 w-3/4 rounded bg-black/10" />
      <div className="h-3 w-1/2 rounded bg-black/5" />
    </div>
  );
}

export default function MyBooksTab() {
  const navigate = useNavigate();
  const { progress, loading } = useReadingProgress();

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-serif text-[#001e2d] mb-2">My Books</h2>
        <p className="text-[#001e2d]/70 text-sm">Continue where you left off and explore your recently read sutras.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <SutraCardSkeleton key={n} />
          ))}
        </div>
      ) : progress.length === 0 ? (
        <div className="py-16 text-center bg-[#eee5da]/30 rounded-3xl border border-[#001e2d]/5">
          <Feather className="h-8 w-8 text-[#001e2d]/30 mx-auto mb-4" />
          <p className="text-[#001e2d]/60 text-sm mb-6">You haven't opened any books recently.</p>
          <button
            onClick={() => navigate("/agama-sutras")}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[rgb(216,117,25)] text-white text-sm font-semibold hover:opacity-90 transition"
          >
            Explore Reading Room
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {progress.map((item) => (
            <article
              key={item.bookId}
              onClick={() => navigate(item.lastUrl)}
              className="group flex flex-col bg-transparent text-sm cursor-pointer"
            >
              {/* Book Cover Container (2:3 aspect ratio) */}
              <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl bg-[#16171d] transition-all duration-500 ease-out group-hover:-translate-y-2">
                {/* Spine shading overlay */}
                <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/60 via-black/25 to-transparent z-10" />
                {/* Crease line */}
                <div className="absolute inset-y-0 left-3 w-[1px] bg-white/10 z-10" />

                {/* Resume Badge */}
                <div className="absolute right-3 top-3 z-20 rounded bg-[#050608]/90 px-2 py-0.5 text-[9px] font-bold text-[#eee5da] backdrop-blur border border-white/10 uppercase tracking-widest font-sans">
                  Resume
                </div>

                <BookCover
                  imageUrl={item.coverUrl || item.imageUrl}
                  title={item.bookTitle}
                  author=""
                  innerClassName="transition duration-500 group-hover:scale-105"
                  className="opacity-85 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none" />
              </div>

              {/* Metadata */}
              <div className="mt-4 flex flex-col gap-1 px-1">
                <h4
                  style={{ fontFamily: "'PP Fragment Glare Regular', Georgia, serif" }}
                  className="text-[16px] font-normal text-[#001e2d] group-hover:text-[rgb(216,117,25)] transition-colors"
                >
                  {item.bookTitle}
                </h4>
                {item.timestamp && (
                  <p className="text-[11px] font-normal text-[rgb(216,117,25)] font-sans">
                    Last read: {new Date(item.timestamp?.toDate()).toLocaleDateString()}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
