// context/LanguagesContext.js
import { createContext, useContext, useEffect, useState } from "react";
import { FetchLanguages } from "../Api/FetchLanguages";

const LanguagesContext = createContext();

export const useLanguages = () => useContext(LanguagesContext);

export const LanguagesProvider = ({ children }) => {
  const [languages, setLanguages] = useState([]);

  useEffect(() => {
    const languageFetch = async () => {
      try {
        if (languages.length > 0) return;
        const response = await FetchLanguages();
        setLanguages(response);
      } catch (error) {
        console.log("🚀 ~ languageFetch ~ error:", error);
      }
    };
    languageFetch();
  }, []);

  return (
    <LanguagesContext.Provider value={{ languages, setLanguages }}>
      {children}
    </LanguagesContext.Provider>
  );
};
