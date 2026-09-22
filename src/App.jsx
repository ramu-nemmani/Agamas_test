import { Route, Routes, useLocation } from "react-router-dom";
// import AdminHomePage from "./Components/Admin/AdminHomePage";
import { useEffect } from "react";
import "./App.css";
import AdminHomePage from "./Components/Admin/AdminHomePage";
import HomePage from "./Components/HomePage";
import { LanguagesProvider } from "./context/LanguageContext";
import { LoadingProvider } from "./context/LoadingContext";
import VersionHistory from "./Components/VersionHistory";

import { ToastContainer } from "react-toastify";

const App = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return (
    <div className="">
      <LoadingProvider>
        <LanguagesProvider>
          <Routes>
            <Route path="/version-history" element={<VersionHistory />} />
            <Route path="/*" element={<HomePage />} />
            <Route path="/Admin/*" element={<AdminHomePage />} />
          </Routes>
        </LanguagesProvider>
      </LoadingProvider>
      <ToastContainer />
    </div>
  );
};

export default App;
