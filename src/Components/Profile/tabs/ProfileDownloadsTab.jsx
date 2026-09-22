import { useState, useEffect } from "react";
import { Download, FileText, Trash2 } from "lucide-react";
import { db } from "../../../firebase";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { useAuth } from "../../../context/AuthContext";
import { useLanguages } from "../../../context/LanguageContext";

export default function ProfileDownloadsTab() {
  const { user } = useAuth();
  const { languages } = useLanguages();
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openingId, setOpeningId] = useState(null);

  useEffect(() => {
    if (!user) return;
    const fetchDownloads = async () => {
      try {
        const q = query(
          collection(db, "downloads"),
          where("userId", "==", user.uid)
        );
        const snap = await getDocs(q);
        const fetched = snap.docs.map(d => ({ docId: d.id, ...d.data() }));
        // Sort by timestamp descending
        fetched.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setDownloads(fetched);
      } catch (err) {
        console.error("Error fetching downloads:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDownloads();
  }, [user]);

  const handleDelete = async (docId) => {
    try {
      await deleteDoc(doc(db, "downloads", docId));
      setDownloads(prev => prev.filter(d => d.docId !== docId));
    } catch (err) {
      console.error("Error deleting download:", err);
    }
  };

  const handleOpenPdf = async (item) => {
    if (!item.pdfLink) return;
    
    // To prevent redownloading due to server headers, we can fetch it as a blob and open it.
    // However, if CORS is an issue, we fallback to Google Docs viewer or window.open
    setOpeningId(item.docId);
    try {
      const response = await fetch(item.pdfLink);
      if (!response.ok) throw new Error("Network response was not ok");
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      window.open(objectUrl, "_blank");
    } catch (error) {
      console.error("Blob fetch failed, falling back to direct open:", error);
      // Fallback: use google docs viewer to force inline viewing
      window.open(`https://docs.google.com/viewer?url=${encodeURIComponent(item.pdfLink)}`, "_blank");
    } finally {
      setOpeningId(null);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return "";
    const d = new Date(isoString);
    return d.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "numeric", hour12: true });
  };

  const getLanguageName = (short) => {
    if (!languages) return short;
    const langObj = languages.find(l => l.shortForm === short);
    return langObj ? langObj.name : short;
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <h2 className="text-2xl font-serif font-normal text-[#001e2d] mb-1">Downloads</h2>
        <p className="text-sm text-[#001e2d]/70">Manage your downloaded sutras for offline reading.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#cd5c3d] border-t-transparent" />
        </div>
      ) : downloads.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#001e2d]/10 p-8 text-center">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Download className="w-8 h-8 text-amber-600" />
          </div>
          <h3 className="text-[#001e2d] font-semibold mb-2">Download history</h3>
          <p className="text-sm text-[#001e2d]/70">Chapters you download will be listed here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {downloads.map((item) => (
            <div 
              key={item.docId} 
              className={`flex items-center justify-between bg-white rounded-2xl border border-[#001e2d]/5 p-4 transition cursor-pointer ${openingId === item.docId ? 'opacity-70 pointer-events-none' : ''}`}
              onClick={() => handleOpenPdf(item)}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#f3edd7]/50 rounded-xl flex items-center justify-center text-[#cd5c3d] shrink-0">
                  {openingId === item.docId ? (
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-[#cd5c3d] border-t-transparent" />
                  ) : (
                    <FileText className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h4 className="text-[#001e2d] font-semibold text-sm">{item.lessonName}</h4>
                  <p className="text-[#001e2d]/50 text-xs flex flex-wrap items-center gap-1.5 mt-0.5">
                    <span>{item.chapterName}</span>
                    {item.language && (
                      <span className="bg-[#cd5c3d]/10 text-[#cd5c3d] px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider">
                        {getLanguageName(item.language)}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[10px] sm:text-xs text-[#001e2d]/40 font-medium">
                  {formatDate(item.timestamp)}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item.docId);
                  }}
                  className="p-2 text-[#001e2d]/30 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
