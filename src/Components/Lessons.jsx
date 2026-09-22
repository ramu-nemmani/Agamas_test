import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db } from "../firebase";
import BookCover from "./common/BookCover";

function Lessons() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

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
        <p className="text-[12px] md:text-[14px] font-bold tracking-[3px] text-[#8a7a6c] uppercase font-sans mb-4">
          SCRIPTURE READING ROOM
        </p>
        <h2 className="text-[#001e2d] text-4xl md:text-5xl font-normal tracking-tight mb-6" style={{ fontFamily: '"PP Fragment Glare Regular", Georgia, serif' }}>
          All Sacred <span style={{ fontStyle: 'italic', color: '#cd5c3d' }}>Sutras</span>
        </h2>
        <p 
          className="text-[#555] leading-relaxed"
          style={{
            fontFamily: '"Open Sans", Helvetica, Arial, Lucida, sans-serif',
            fontSize: '20px',
            fontStyle: 'normal',
            fontVariantCaps: 'normal',
            fontVariantEastAsian: 'normal',
            fontVariantLigatures: 'normal',
            fontVariantNumeric: 'normal',
            fontWeight: 400
          }}
        >
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
              <div key={id || i} className="flex flex-col sm:flex-row items-center sm:items-center gap-6 sm:gap-8">
                {/* Book Cover Container - Responsive size & non-clickable */}
                <div className="relative aspect-[2/3] w-full max-w-[220px] sm:w-[180px] md:w-[210px] lg:w-[240px] shrink-0 rounded-xl overflow-hidden border border-[#e8e0d8] shadow-sm pointer-events-none select-none">
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

                  <p className="text-[#555] text-sm leading-relaxed mb-4">
                    {description || "Authentic ancient scriptures translated with care and devotion."}
                  </p>

                  <div className="flex justify-center sm:justify-start">
                    <Link
                      to={"/chapters/" + id}
                      className="relative inline-flex items-center justify-center py-3 px-6 text-center font-bold text-[#001e2d] hover:opacity-80 transition-opacity group"
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
                      <svg
                        className="absolute inset-0 w-full h-full pointer-events-none transition-transform duration-300 group-hover:scale-105"
                        preserveAspectRatio="none"
                        viewBox="0 0 245 62"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          className="draw-path"
                          d="M221.454 1.05992C209.233 1.05992 196.967 0.844056 184.758 1.23176C152.169 2.26666 119.695 6.1216 87.9185 11.0694C62.8697 14.9696 32.0837 18.8916 11.2304 30.315C6.18539 33.0786 1.43096 36.7352 1.03015 41.4414C0.265972 50.4143 14.1888 53.7299 24.416 55.5319C61.6914 62.0998 101.664 61.6475 139.728 59.8278C160.389 58.8402 181.344 57.1035 201.302 53.1262C212.268 50.9411 223.078 48.2177 232.898 44.1478C236.243 42.7616 243.25 40.0257 243.783 36.7159C243.94 35.74 244.181 34.1569 243.783 33.1933C243.336 32.1125 238.317 30.4143 237.128 30.0143C229.872 27.5744 221.408 25.6031 213.617 24.2578"
                          stroke="#002031"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </Link>
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
