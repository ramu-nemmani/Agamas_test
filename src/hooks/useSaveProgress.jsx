import { useEffect } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

export function useSaveProgress({
  bookId,
  bookTitle,
  coverUrl,
  lastUrl,
  dependencies = []
}) {
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !bookId || !lastUrl) return;

    const saveProgress = async () => {
      try {
        const docRef = doc(db, "readingProgress", `${user.uid}_${bookId}`);
        await setDoc(docRef, {
          userId: user.uid,
          bookId,
          bookTitle: bookTitle || "Unknown Book",
          coverUrl: coverUrl || null,
          lastUrl,
          timestamp: serverTimestamp()
        }, { merge: true });
      } catch (error) {
        console.error("Error saving reading progress:", error);
      }
    };

    const timeoutId = setTimeout(() => {
      saveProgress();
    }, 1000); // 1 second debounce

    return () => clearTimeout(timeoutId);
  }, [user, bookId, bookTitle, coverUrl, lastUrl, ...dependencies]);
}
