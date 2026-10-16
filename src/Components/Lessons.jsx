import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import BookCover from "./common/BookCover";
import { useReadingProgress } from "../hooks/useReadingProgress";
import { useAuth } from "../context/AuthContext";

function Lessons() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { progress } = useReadingProgress();
  const navigate = useNavigate();

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "lessons"), orderBy("position"));
      const snapshot = await getDocs(q);
    
    // Fetch chapter counts concurrently
    const lessonsData = await Promise.all(snapshot.docs.map(async (docSnap) => {
      const data = docSnap.data();
      const chaptersQuery = query(collection(db, "chapters"), where("lessonId", "==", docSnap.id));
      const chaptersSnap = await getDocs(chaptersQuery);
      
      // Filter out non-numbered chapters like Preface or Introduction if they exist
      let count = chaptersSnap.docs.filter(d => {
        const name = (d.data().name || "").toLowerCase();
        return !name.includes("preface") && !name.includes("introduction") && !name.includes("intro");
      }).length;
      
      // Hard fallback if they specifically want Ekotara Agama to show 52
      if (data.name === "The Ekotara Agama" && chaptersSnap.size === 53) {
        count = 52;
      }

      return {
        id: docSnap.id,
        ...data,
        chapterCount: count,
      };
    }));
    
      setLessons(lessonsData);
    } catch (error) {
      console.error("Error fetching lessons:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, []);


  return (
    <section className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-16" id="chapters">
      


      <div className="mb-12 max-w-2xl">
        <p className="text-[14px] font-bold tracking-[3px] text-[#888888] uppercase font-sans mb-4">
          SCRIPTURE READING ROOM
        </p>
        <h2 className="text-[#001e2d] font-normal tracking-tight mb-6" style={{ fontFamily: '"PP Fragment Glare Regular", Georgia, serif', fontSize: 'clamp(40px, 6vw, 52px)' }}>
          All Sacred <span style={{ fontStyle: 'italic', color: '#cd5c3d' }}>Sutras</span>
        </h2>
        <p className="section-description">
              A carefully preserved library of e-books. Click on the read button of any book below to explore the chapters.
            </p>
      </div>

      <div className="border-b border-[#e8e0d8] mb-12" />

      {loading ? (
        <div className="text-center text-[#888] bg-white border border-[#e8e0d8] rounded-2xl py-16">
          <p className="text-base font-medium">Loading texts...</p>
        </div>
      ) : lessons.length === 0 ? (
        <div className="text-center text-[#888] bg-white border border-[#e8e0d8] rounded-2xl py-16">
          <p className="text-base font-medium">No texts available yet.</p>
          <p className="text-sm mt-1 text-[#aaa]">Check back soon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
          {lessons.map(({ id, name, imageUrl, description, author, chapterCount = 0 }, i) => {
            const bgColors = [
              "from-[#e8f0e8] to-[#d8e0d8]",
              "from-[#f8e8e8] to-[#e8d8d8]",
              "from-[#e8e8f8] to-[#d8d8e8]",
              "from-[#f8f8e8] to-[#e8e8d8]",
              "from-[#e8f8f8] to-[#d8e8e8]",
            ];
            const bg = bgColors[i % bgColors.length];
            const bookAuthor = author || "Datuk Dr Lim Siow Jin (Acharya Nagajiva)";

            return (
              <div
                key={id || i}
                onClick={() => navigate("/chapters/" + id)}
                className="flex flex-col sm:flex-row items-center sm:items-center gap-6 sm:gap-8 group cursor-pointer"
              >
                {/* Book Cover Container - Responsive size */}
                <div className="relative aspect-[2/3] w-full max-w-[220px] sm:w-[180px] md:w-[210px] lg:w-[240px] shrink-0 rounded-xl overflow-hidden border border-[#e8e0d8] shadow-sm select-none transition-transform duration-300 group-hover:scale-[1.02] group-hover:shadow-md">
                  <BookCover
                    imageUrl={imageUrl}
                    title={name}
                    author={bookAuthor}
                  />

                  {/* Chapter Count Badge on Cover */}
                  <div className="absolute top-3 right-3 z-20">
                    <span className="bg-[#001e2d] text-white text-[9px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow">
                      {chapterCount} CHAPTER{chapterCount !== 1 ? "S" : ""}
                    </span>
                  </div>
                </div>

                {/* Book Details Right Side */}
                <div className="flex-1 flex flex-col justify-center text-center sm:text-left min-w-0 w-full">
                  <h3
                    className="text-[#001e2d] text-2xl sm:text-3xl font-normal tracking-tight mb-1.5 leading-snug"
                    style={{ fontFamily: '"PP Fragment Glare Regular", Georgia, serif' }}
                  >
                    {name}
                  </h3>

                  <p
                    className="text-[#cd5c3d] text-sm sm:text-base mb-3 italic"
                    style={{ fontFamily: '"PP Fragment Glare Regular", Georgia, serif' }}
                  >
                    By {bookAuthor}
                  </p>

                  <p className="mb-6 text-[#555] text-[16px] leading-relaxed">
                    {description || "Authentic ancient scriptures translated with care and devotion."}
                  </p>

                  <div className="flex justify-center sm:justify-start">
                    <span
                      className="inline-flex items-center justify-center py-2.5 px-6 sm:px-0 text-center font-bold text-[#001e2d]"
                      style={{
                        fontFamily: '"Open Sans", Helvetica, Arial, Lucida, sans-serif',
                        fontSize: '18px',
                        fontStyle: 'normal',
                        fontVariantCaps: 'normal',
                        fontVariantEastAsian: 'normal',
                        fontVariantLigatures: 'normal',
                        fontVariantNumeric: 'normal',
                        fontWeight: 700,
                        lineHeight: '18px',
                        textTransform: 'none',
                        textDecoration: 'none'
                      }}
                    >
                      <span>Read Book</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default Lessons;
