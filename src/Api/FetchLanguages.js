import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";

export const FetchLanguages = async () => {
  const q = query(collection(db, "languages"), orderBy("position"));
  const snapshot = await getDocs(q);
  const languages = snapshot.docs.map((doc) => {
    return {
      id: doc.id,
      ...doc.data(),
    };
  });

  return languages;
};
