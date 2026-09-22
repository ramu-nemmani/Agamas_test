import HomeIcon from "@mui/icons-material/Home";
import { IconButton, Tab, Tabs } from "@mui/material";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

const NavigationBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const lessonId = searchParams.get("lesson");

  const [activeTab, setActiveTab] = useState("chapters");

  // derive active tab from pathname
  useEffect(() => {
    const path = location.pathname || "";
    if (path.includes("/admin/chapters")) setActiveTab("chapters");
    else if (path.includes("/admin/ai")) setActiveTab("ai");
    else if (path.includes("/admin/videos")) setActiveTab("videos");
    else setActiveTab("posts");
  }, [location.pathname]);

  const buildPath = (tab) => {
    // map tab -> route segment
    const seg = tab === "posts" ? "post" : tab; // posts -> /post, chapters -> /chapters, ai -> /ai
    const base = `/admin/${seg}`;
    return lessonId ? `${base}?lesson=${lessonId}` : base;
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    navigate(buildPath(newValue));
  };

  return (
    <div className="w-full flex">
      <IconButton
        aria-label="home"
        onClick={() => navigate("/admin")}
        className="text-[#4a3728] hover:bg-[#4a3728]/10 "
      >
        <HomeIcon />
      </IconButton>

      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        aria-label="navigation tabs"
        sx={{
          "& .MuiTabs-indicator": {
            backgroundColor: "#3385ff",
            height: "3px",
          },
        }}
      >
        {/* <Tab
          label="Posts"
          value="posts"
          className="font-serif text-[#3385ff] text-base sm:text-lg px-8 py-4 transition-colors duration-300"
          sx={{
            textTransform: "none",
            fontWeight: 400,
            "&.Mui-selected": { color: "#3385ff", fontWeight: 500 },
            "&:hover": { color: "#7a5c3e" },
          }}
        /> */}

        <Tab
          label="Chapters"
          value="chapters"
          className="font-serif text-[#3385ff] text-base sm:text-lg px-8 py-4 transition-colors duration-300"
          sx={{
            textTransform: "none",
            fontWeight: 400,
            "&.Mui-selected": { color: "#3385ff", fontWeight: 500 },
            "&:hover": { color: "#7a5c3e" },
          }}
        />
        <Tab
          label="Ai"
          value="ai"
          className="font-serif text-[#3385ff] text-base sm:text-lg px-8 py-4 transition-colors duration-300"
          sx={{
            textTransform: "none",
            fontWeight: 400,
            "&.Mui-selected": { color: "#3385ff", fontWeight: 500 },
            "&:hover": { color: "#7a5c3e" },
          }}
        />
        <Tab
          label="Videos"
          value="videos"
          className="font-serif text-[#3385ff] text-base sm:text-lg px-8 py-4 transition-colors duration-300"
          sx={{
            textTransform: "none",
            fontWeight: 400,
            "&.Mui-selected": { color: "#3385ff", fontWeight: 500 },
            "&:hover": { color: "#7a5c3e" },
          }}
        />
      </Tabs>
    </div>
  );
};

export default NavigationBar;
