import { useState } from "react";
import { Outlet, Route, Routes } from "react-router-dom";
import Categories from "./Categories";

import Footer from "./Footer";
import LandingPage from "./LandingPage";
import Navbar from "./Navbar";
import VideoListPage from "./VideosList";
import ViewPost from "./ViewPost";
import ContactPage from "./ContactPage";
import AboutUsPage from "./AboutUsPage";
import WhatsAppButton from "./WhatsAppButton";
import AgamaSutrasPage from "./AgamaSutrasPage";
import EnglishTeachingsPage from "./EnglishTeachingsPage";
import PageReader from "./PageReader";
import ChineseTeachingsPage from "./ChineseTeachingsPage";
import MindfulnessTeachingsPage from "./MindfulnessTeachingsPage";
import FivePreceptsPage from "./FivePreceptsPage";
import ThreeJewelsPage from "./ThreeJewelsPage";
import GoodFriendsPage from "./GoodFriendsPage";
import FAQPage from "./FAQPage";
import Profile from "./Profile/Profile";
import FeaturesPage from "./FeaturesPage";
import ReadingModeSelectionPage from "./ReadingModeSelectionPage";
import ChapterViewPage from "./ChapterView";
const HomePage = () => {
  const [isFullScreen, setIsFullScreen] = useState(false);

  return (
    <div className="">
      {!isFullScreen && <Navbar />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about-us" element={<AboutUsPage />} />
        <Route path="/agama-sutras" element={<AgamaSutrasPage />} />
        <Route path="/english-teachings" element={<EnglishTeachingsPage />} />
        <Route path="/chinese-teachings" element={<ChineseTeachingsPage />} />
        <Route path="/mindfulness-teachings" element={<MindfulnessTeachingsPage />} />
        <Route path="/five-precepts" element={<FivePreceptsPage />} />
        <Route path="/three-jewels" element={<ThreeJewelsPage />} />
        <Route path="/good-friends" element={<GoodFriendsPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/contact-us" element={<ContactPage />} />
        <Route path="/chapters/:id" element={<Categories />} />
        <Route path="/select-mode/:id" element={<ReadingModeSelectionPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/video" element={<VideoListPage />} />
        {/* <Route path="/video" element={<CategoriesVideos />} /> */}
        {/* <Route path="/video/:id" element={<VideoPlayer />} /> */}
        <Route path="/book/:lessonId/read" element={<PageReader setIsFullScreen={setIsFullScreen} />} />
        <Route
          path="/chapters/:lessonId/:cn"
          element={
            <ViewPost
              setIsFullScreen={setIsFullScreen}
              isFullScreen={isFullScreen}
            />
          }
        />
        <Route path="/chapter-view/:lessonId/:chapterId" element={<ChapterViewPage setIsFullScreen={setIsFullScreen} />} />
      </Routes>
      <Outlet />
      {!isFullScreen && <WhatsAppButton />}
      {!isFullScreen && <Footer />}
    </div>
  );
};

export default HomePage;
