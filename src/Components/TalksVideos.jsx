import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { dbVideos } from "../firebase";

function TalksVideos({ hideSectionHeader = false }) {
  const [talks, setTalks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchVideos() {
      try {
        setLoading(true);
        const snapshot = await getDocs(
          query(
            collection(dbVideos, "videos"),
            where("seasonId", "==", "KqFUsBbdmHCcXuLIdiid"),
            orderBy("position", "desc"),
            limit(3),
          ),
        );
        const vids = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTalks(vids);
      } catch (error) {
        console.log("🚀 ~ fetchVideos ~ error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchVideos();
  }, []);

  return (
    <section
      className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16 md:pb-24"
      aria-label="Talks & Videos"
    >
      {/* Section header — shown only when not overridden by parent */}
      {!hideSectionHeader && (
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-[14px] font-bold tracking-[3px] text-[#888888] uppercase font-sans block mb-2">
                MEDIA LIBRARY
            </span>
            <h3 className="text-[#001e2d] font-normal leading-tight" style={{ fontFamily: '"PP Fragment Glare Regular", Georgia, serif', fontSize: 'clamp(40px, 6vw, 52px)' }}>
              Talks & Videos
            </h3>
            <p className="text-sm md:text-base text-[#666] mt-1">
              Discourses, interviews, and study sessions by teachers and speakers.
            </p>
          </div>
          <Link
            to="/video"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#cd5c3d] hover:text-[#b8503a] border border-[#cd5c3d40] hover:border-[#cd5c3d] px-4 py-2 rounded-lg transition-all duration-150"
          >
            View All
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>
      )}

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 border border-[#e8e0d8] shadow-sm animate-pulse"
            >
              <div className="aspect-video w-full bg-[#f0e3dc] rounded-lg mb-4" />
              <div className="h-5 w-2/3 bg-[#f6ece7] rounded mb-2" />
              <div className="h-4 w-5/6 bg-[#f6ece7] rounded mb-4" />
              <div className="h-8 w-28 bg-[#ead0c7] rounded" />
            </div>
          ))}
        </div>
      ) : talks.length === 0 ? (
        <div className="text-center text-[#888] bg-white/60 border border-[#e8e0d8] rounded-2xl py-16">
          <p className="text-base font-medium">
            Talks & videos will appear here soon.
          </p>
          <p className="text-sm mt-1 text-[#aaa]">
            Check back later for new content.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-8 md:gap-12 lg:gap-16 md:grid-cols-2 lg:grid-cols-3">
            {talks.map(
              ({ id, title, description, thumbnailImg, position }, idx) => {
                const key = id ?? String(idx);
                return (
                  <Link
                    to={`/video?id=${position}`}
                    key={key}
                    className="bg-white rounded-2xl overflow-hidden border border-[#e8e0d8] flex flex-col h-full"
                  >
                    <div className="relative shrink-0">
                      <img
                        src={thumbnailImg}
                        alt="Play"
                        className="aspect-video w-full object-cover"
                      />
                    </div>

                    <div className="p-6 flex flex-col flex-1">
                      <h4 
                        className="text-[#001E2D]" 
                        style={{ fontFamily: '"PP Fragment Glare Regular", Georgia, serif', fontSize: '20px', fontWeight: 700 }}
                      >
                        {title}
                      </h4>
                      {description ? (
                        <p className="mt-3 line-clamp-3 text-[#555555] text-[18px] font-sans font-normal leading-relaxed">
                          {description}
                        </p>
                      ) : null}
                    </div>
                  </Link>
                );
              },
            )}
          </div>

          {/* View All CTA */}
          <div className="mt-20 flex justify-center">
            <Link
              to="/video"
              className="inline-flex items-center justify-center py-4 px-10 text-center font-bold text-[#001e2d] group"
              style={{
                fontFamily: '"Open Sans", Helvetica, Arial, Lucida, sans-serif',
                fontSize: "18px",
                lineHeight: "18px",
                fontWeight: 700,
                textTransform: "none",
                textDecoration: "none"
              }}
            >
              View More<ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </>
      )}
    </section>
  );
}

export default TalksVideos;
