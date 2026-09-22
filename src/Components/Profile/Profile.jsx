import { useState, useRef } from "react";
import { Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { auth, storage } from "../../firebase";
import { updateProfile } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import ProfileDownloadsTab from "./tabs/ProfileDownloadsTab";
import MyBooksTab from "./tabs/MyBooksTab";
import ProfileSecurityTab from "./tabs/ProfileSecurityTab";
import ProfileDeleteTab from "./tabs/ProfileDeleteTab";
import ProfileDetailsTab from "./tabs/ProfileDetailsTab";

export default function Profile() {
  const { user: contextUser, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [refreshKey, setRefreshKey] = useState(0);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  const tabs = [
    { id: "profile", label: "Profile" },
    { id: "books", label: "My Books" },
    { id: "downloads", label: "Downloads" },
    { id: "security", label: "Security" },
    { id: "delete", label: "Delete Account" },
  ];

  if (!contextUser) {
    return (
      <div className="min-h-screen bg-[#fffdf8] flex flex-col items-center justify-center p-6 font-sans">
        <div className="text-center">
          <h2 className="text-2xl font-bold font-serif-display text-[#001e2d] mb-2">Not Signed In</h2>
          <p className="text-[#001e2d]/70 mb-6">Please sign in to view your profile.</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2.5 bg-amber-600 text-white rounded-xl font-semibold hover:bg-amber-700 transition-all"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // Prioritize contextUser for reactive updates, then fallback to auth.currentUser
  const activeUser = contextUser || auth.currentUser;
  const displayName = contextUser?.name || activeUser?.displayName || "Reader";
  const initial = displayName.charAt(0).toUpperCase();

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !activeUser) return;

    setIsUploadingImage(true);
    try {
      const imageRef = ref(storage, `users/${activeUser.uid}/profile.jpg`);
      await uploadBytes(imageRef, file);
      const url = await getDownloadURL(imageRef);

      // Update both Firebase Auth profile and Firestore user document
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { photoURL: url });
      }
      await updateUserProfile({ photoURL: url });

      setRefreshKey(prev => prev + 1); // trigger a re-render
    } catch (error) {
      console.error("Failed to upload image:", error);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!activeUser) return;
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { photoURL: "" });
      }
      await updateUserProfile({ photoURL: "" });
      setRefreshKey(prev => prev + 1); // trigger a re-render
    } catch (error) {
      console.error("Failed to remove image:", error);
    }
  };

  return (
    <div className="flex-grow">
      <div className="bg-[#fffdf8] min-h-screen py-10 text-[#001e2d] font-sans">
        <div className="mx-auto max-w-[1000px] px-4 sm:px-6 lg:px-8">

          {/* Top Section: DP & Details */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 mb-10 mt-4 w-full">
            <div className="flex flex-col items-center gap-3">
              <div
                className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-amber-100 text-[#cd5c3d] flex items-center justify-center text-6xl sm:text-7xl font-medium shrink-0 group cursor-pointer overflow-hidden shadow-sm"
                onClick={() => fileInputRef.current?.click()}
              >
                {activeUser?.photoURL || contextUser?.photoURL ? (
                  <img src={activeUser.photoURL || contextUser.photoURL} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <span>{initial}</span>
                )}

                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-8 h-8 text-white mb-1" />
                  <span className="text-white text-xs font-medium">
                    {isUploadingImage ? "Uploading..." : "Change DP"}
                  </span>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              {(activeUser?.photoURL || contextUser?.photoURL) && (
                <button
                  onClick={handleRemoveImage}
                  className="text-xs font-medium text-red-500 hover:text-red-600 transition-colors"
                >
                  Remove Photo
                </button>
              )}
            </div>

            <div className="flex flex-col items-center sm:items-start text-center sm:text-left pt-2 sm:pt-4">
              <h1 className="text-[36px] leading-[40px] font-bold font-display mb-2 text-[#001e2d]">{displayName}</h1>
              <p className="text-[#001e2d]/60 text-sm sm:text-base font-medium mb-4">
                {contextUser?.email || activeUser?.email}
              </p>
            </div>
          </div>

          {/* Horizontal Tabs */}
          <div className="border-b border-[#001e2d]/10 mb-8 overflow-x-auto no-scrollbar">
            <nav className="flex gap-8 whitespace-nowrap min-w-max px-2">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`pb-4 text-sm font-medium transition-colors relative
                      ${isActive
                        ? "text-[#001e2d]"
                        : "text-[#001e2d]/50 hover:text-[#001e2d]/80"
                      }
                    `}
                  >
                    {tab.label}
                    {isActive && (
                      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#001e2d] rounded-t-full" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content Area */}
          <main className="w-full" key={refreshKey}>
            {activeTab === "profile" && <ProfileDetailsTab onProfileUpdate={() => setRefreshKey(prev => prev + 1)} />}
            {activeTab === "books" && <MyBooksTab />}
            {activeTab === "downloads" && <ProfileDownloadsTab />}
            {activeTab === "security" && <ProfileSecurityTab />}
            {activeTab === "delete" && <ProfileDeleteTab />}
          </main>

        </div>
      </div>
    </div>
  );
}