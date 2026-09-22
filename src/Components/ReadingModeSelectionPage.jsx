import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import SEO from "./SEO";
import { useReadingProgress } from "../hooks/useReadingProgress";
import BookCover from "./common/BookCover";

export default function ReadingModeSelectionPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const { progress } = useReadingProgress();
  const currentProgress = progress.find((p) => p.bookId === id);

  const bgClass = "bg-[#fffdf8]";
  const textClass = "text-[#001e2d]";
  const labelTextClass = "text-[#001e2d]/70";

  useEffect(() => {
    async function fetchLesson() {
      try {
        const snapshot = await getDoc(doc(db, "lessons", id));
        if (snapshot.exists()) {
          setLesson({ id: snapshot.id, ...snapshot.data() });
        } else {
          setError(true);
        }
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchLesson();
  }, [id]);

  const handleViewVerses = () => {
    navigate(`/chapters/${id}`);
  };

  const handleViewPages = () => {
    navigate(`/book/${id}/read`);
  };

  if (loading) {
    return (
      <div className={`w-full min-h-[calc(100vh-200px)] ${bgClass} flex items-center justify-center transition-colors duration-300`}>
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#cd5c3d] border-t-transparent" />
          <p className={`text-xs ${labelTextClass}`}>Loading book details...</p>
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className={`w-full min-h-[calc(100vh-200px)] ${bgClass} flex items-center justify-center transition-colors duration-300`}>
        <div className="text-center px-4">
          <p className={`${textClass} mb-4 text-base font-semibold`}>Book not found</p>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#cd5c3d] text-white text-xs font-semibold hover:bg-[#b35235] transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-[calc(100vh-76px)] flex flex-col ${bgClass}`}>
      <SEO
        title={`Read ${lesson.name} - The Agamas`}
        description={`Choose your reading mode for ${lesson.name}. View page by page or verse by verse.`}
      />

      <div className="flex-1 w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center py-12">
        <div className="w-full">
          <button
          onClick={() => navigate("/#chapters")}
          className="inline-flex items-center gap-2 text-[#cd5c3d] hover:text-[#b35235] transition-colors tracking-widest uppercase mb-12"
          style={{
            fontFamily: 'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
            fontSize: '12px',
            fontStyle: 'normal',
            fontVariantCaps: 'normal',
            fontVariantEastAsian: 'normal',
            fontVariantLigatures: 'normal',
            fontVariantNumeric: 'normal',
            fontWeight: 700
          }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Reading Room
        </button>

        <main className="flex flex-col lg:flex-row gap-12 lg:gap-24 items-start lg:items-center">
          {/* Left Column: Cover Image / Fallback */}
          <aside className="w-full lg:w-[350px] shrink-0 flex justify-center lg:justify-start">
            <BookCover
              variant="large"
              imageUrl={lesson.imageUrl}
              title={lesson.name}
              author={lesson.name}
            />
          </aside>

          {/* Right Column: Information and Buttons */}
          <section className="flex-1 w-full pt-4">
            <h1
              style={{ fontFamily: "'PP Fragment Glare Regular', Georgia, serif", fontSize: "clamp(40px, 6vw, 52px)", lineHeight: "1", fontWeight: "400" }}
              className={`${textClass} mb-6`}
            >
              {lesson.name}
            </h1>

            <div className="mb-8">
              <ul className="flex flex-col gap-4 font-sans text-[16px] text-[#001e2d]/80 py-2">
                <li className="flex gap-4 items-center">
                  <span className="font-bold text-[#001e2d] w-[100px]">Author</span> 
                  <span>Datuk Dr Lim Siow Jin</span>
                </li>
                <li className="flex gap-4 items-center">
                  <span className="font-bold text-[#001e2d] w-[100px]">Language</span> 
                  <span>English</span>
                </li>
              </ul>
            </div>

            <hr className="border-t border-[#001e2d]/10 mb-8 w-full" />

            <div className="mb-10">
              <h3
                style={{ fontFamily: "'PP Fragment Glare Regular', Georgia, serif", fontSize: "24px", fontWeight: "bold" }}
                className={`${textClass} mb-3`}
              >
                About this text
              </h3>
              <p className="text-[#001e2d]/85 text-[18px] font-sans leading-relaxed">
                {lesson.name} is a classical scripture on wisdom, non-attachment, and inner clarity. It guides readers beyond illusion and fixed ideas toward freedom. Explore the profound teachings of this scripture, translated directly to preserve its original essence.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-stretch sm:items-center mt-6">
              {currentProgress && (
                <button
                  onClick={() => navigate(currentProgress.lastUrl)}
                  className="rounded-full bg-slate-900 text-white px-8 py-4 font-sans text-[16px] font-semibold hover:bg-slate-800 transition shadow-lg w-full sm:w-auto text-center"
                >
                  Resume Reading
                </button>
              )}
              <button 
                onClick={handleViewVerses} 
                className="rounded-full bg-[#cd5c3d] text-white px-8 py-4 font-sans text-[16px] font-semibold hover:opacity-90 transition w-full sm:w-auto text-center"
              >
                Continue Reader
              </button>
              <button 
                onClick={handleViewPages} 
                className="rounded-full border-2 border-[#cd5c3d] text-[#cd5c3d] px-8 py-4 font-sans text-[16px] font-semibold hover:bg-[#fff9f1] transition w-full sm:w-auto text-center"
              >
                Page Reader
              </button>
            </div>
          </section>
        </main>
        </div>
      </div>
    </div>
  );
}
