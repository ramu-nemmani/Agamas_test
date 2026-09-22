import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

export function useReadingProgress() {
  const { user } = useAuth();
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProgress([]);
      setLoading(false);
      return;
    }

    const fetchProgress = async () => {
      try {
        const q = query(
          collection(db, "readingProgress"),
          where("userId", "==", user.uid)
        );
        const snapshot = await getDocs(q);

        // Fetch lessons to map imageUrl correctly
        const lessonsSnap = await getDocs(query(collection(db, "lessons")));
        const lessonsMap = {};
        lessonsSnap.docs.forEach(doc => {
          lessonsMap[doc.id] = doc.data().imageUrl || null;
        });

        const data = snapshot.docs.map(doc => {
          const bookId = doc.id.replace(`${user.uid}_`, "");
          const docData = doc.data();
          return {
            bookId,
            ...docData,
            imageUrl: lessonsMap[bookId] || docData.coverUrl || docData.imageUrl || null
          };
        }).sort((a, b) => {
          // Sort locally descending by timestamp
          const timeA = a.timestamp?.toMillis() || 0;
          const timeB = b.timestamp?.toMillis() || 0;
          return timeB - timeA;
        });
        setProgress(data);
      } catch (error) {
        console.error("Error fetching reading progress:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [user]);

  return { progress, loading };
}
