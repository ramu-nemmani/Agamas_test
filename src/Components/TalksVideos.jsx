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
      className="max-w-screen-xl mx-auto px-6 md:px-10 pt-6 pb-16 md:pb-24"
      aria-label="Talks & Videos"
    >
      {/* Section header — shown only when not overridden by parent */}
      {!hideSectionHeader && (
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <h3 className="text-2xl md:text-3xl font-semibold text-[#2c2c2c]">
              Talks & Videos
            </h3>
            <p className="text-sm md:text-base text-[#666] mt-1">
              Discourses, interviews, and study sessions by teachers and
              practitioners.
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
          <div className="grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {talks.map(
              ({ id, title, description, thumbnailImg, position }, idx) => {
                const key = id ?? String(idx);
                return (
                  <Link
                    to={`/video?id=${position}`}
                    key={key}
                    className="group bg-white rounded-2xl overflow-hidden border border-[#e8e0d8] shadow-sm hover:border-[#cd5c3d] transition-colors duration-200"
                  >
                    <div className="relative">
                      <img
                        src={thumbnailImg}
                        alt="Play"
                        className="aspect-video w-full"
                      />
                    </div>

                    <div className="p-6">
                      <h4 className="text-base md:text-lg font-semibold text-[#2c2c2c]">
                        {title}
                      </h4>
                      {description ? (
                        <p className="text-sm text-[#666] leading-relaxed mt-3 line-clamp-3">
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
              className="relative inline-flex items-center justify-center py-4 px-10 text-center font-bold text-[#001e2d] hover:opacity-80 transition-opacity group"
              style={{
                fontFamily: '"Open Sans", Helvetica, Arial, Lucida, sans-serif',
                fontSize: "18px",
                lineHeight: "18px",
                fontWeight: 700,
                textTransform: "none",
                textDecoration: "none"
              }}
            >
              View More
              <svg className="absolute inset-0 w-full h-full pointer-events-none transition-transform duration-300 group-hover:scale-105" preserveAspectRatio="none" viewBox="0 0 245 62" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path className="draw-path" d="M221.454 1.05992C209.233 1.05992 196.967 0.844056 184.758 1.23176C152.169 2.26666 119.695 6.1216 87.9185 11.0694C62.8697 14.9696 32.0837 18.8916 11.2304 30.315C6.18539 33.0786 1.43096 36.7352 1.03015 41.4414C0.265972 50.4143 14.1888 53.7299 24.416 55.5319C61.6914 62.0998 101.664 61.6475 139.728 59.8278C160.389 58.8402 181.344 57.1035 201.302 53.1262C212.268 50.9411 223.078 48.2177 232.898 44.1478C236.243 42.7616 243.25 40.0257 243.783 36.7159C243.94 35.74 244.181 34.1569 243.783 33.1933C243.336 32.1125 238.317 30.4143 237.128 30.0143C229.872 27.5744 221.408 25.6031 213.617 24.2578" stroke="#002031" strokeWidth={1.5} strokeLinecap="round" />
              </svg>
            </Link>
          </div>
        </>
      )}
    </section>
  );
}

export default TalksVideos;
