import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import SEO from "./SEO";

function CategoriesVideos() {
  const [lessons, setLessons] = useState([]);
  const navigate = useNavigate();

  const fetchLessons = async () => {
    const q = query(collection(db, "lessons"), orderBy("position"));
    const snapshot = await getDocs(q);
    const lessonsData = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setLessons(lessonsData);
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  const colClass =
    lessons.length === 1
      ? "md:grid-cols-1 max-w-md mx-auto"
      : lessons.length === 2
      ? "md:grid-cols-2"
      : "md:grid-cols-2 lg:grid-cols-3";

  return (
    <div className="bg-[#fdf8f4] min-h-screen">
      <SEO
        title="Talks & Videos - The Agamas"
        description="Explore talks and videos on the ancient Agama texts."
        name="The Agamas"
        type="website"
      />

      {/* ── Page Header ──────────────────────────────────────────────── */}
      <div className="bg-white border-b border-[#e8e0d8]">
        <div className="max-w-screen-xl mx-auto px-6 md:px-10 pt-8 pb-7">
          <div className="flex flex-col items-start">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-1.5 text-sm text-[#888] hover:text-[#cd5c3d] transition-colors mb-5 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Home
          </button>

          <p className="section-eyebrow">
            Media Library
          </p>
          <h1
            className="text-3xl md:text-4xl font-light text-[#1e1e1e] tracking-tight font-serif-display mt-4"
            style={{ fontFamily: "'Lora', Georgia, serif" }}
          >
            Talks &{" "}
            <span className="text-[#cd5c3d] font-semibold">Videos</span>
          </h1>
          <p className="max-w-2xl text-sm md:text-base text-[#888] mt-4">
            Browse video collections by lesson category.
          </p>
          </div>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────── */}
      <div className="max-w-screen-xl mx-auto px-6 md:px-10 py-12">
        {lessons.length === 0 ? (
          <div className="text-center bg-white border border-[#e8e0d8] rounded-2xl py-16">
            <p className="text-base font-medium text-[#555]">No video collections yet.</p>
            <p className="text-sm text-[#aaa] mt-1">Check back soon.</p>
          </div>
        ) : (
          <div className={`grid gap-8 ${colClass}`}>
            {lessons.map(({ id, name, description }, i) => (
              <div
                key={i}
                className="group relative bg-white rounded-2xl p-8 text-center border border-[#e8e0d8] shadow-sm hover:border-[#cd5c3d] transition-colors duration-200 overflow-hidden"
              >
                {/* Hover top accent */}
                <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#cd5c3d] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Number badge */}
                <div className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#cd5c3d12] text-[#cd5c3d] text-sm font-bold mb-5">
                  {i + 1}
                </div>

                <h2 className="text-xl font-semibold text-[#1e1e1e] mb-3 leading-snug">
                  {name}
                </h2>
                <p className="text-sm text-[#777] mb-7 leading-relaxed">
                  {description}
                </p>
                <Link
                  to={"/video/" + id}
                  className="inline-flex items-center gap-2 bg-[#cd5c3d] hover:bg-[#b8503a] text-white px-6 py-2.5 rounded-lg font-medium text-sm shadow-md hover:shadow-lg transition-all duration-150"
                >
                  Go To Videos
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CategoriesVideos;
