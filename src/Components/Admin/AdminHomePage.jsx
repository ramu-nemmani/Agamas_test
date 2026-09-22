import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import {
  Route,
  Routes,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import AuthGuard from "../../auth/AuthGuard";
import { AuthProvider } from "../../context/AuthContext";
import { useLoading } from "../../context/LoadingContext";
import { db } from "../../firebase";
import AddPost from "./AddPost";
import AdminChapters from "./AdminChapters";
import AdminLessons from "./AdminLessons";
import ForgotPassword from "./Auth/ForgotPassword";
import LoginPage from "./Auth/Login";
import Register from "./Auth/Register";
import ChapterWisePosts from "./ChapterWisePosts";
import GenerateAITranslationPost from "./GenerateAITranslationPost";
import Navbar from "./Navbar";
import Profile from "./Profile";
import VideoUpload from "./VideoUpload";
import VideoListPage from "./VideosList";

const AdminHomePage = () => {
  const [searchParams] = useSearchParams();
  const lessonId = searchParams.get("lesson");
  const [chapters, setChapters] = useState([]);
  const [isAuth, setIsAuth] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const postsHasMap = useRef({});
  const [postCount, setPostCount] = useState(0);
  const { setLoading } = useLoading();
  const [lessons, setLessons] = useState([]);

  const fetchChapters = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "chapters"),
        where("lessonId", "==", lessonId),
        orderBy("position")
      );
      const snapshot = await getDocs(q);

      let totalPosts = 0;
      const chaptersData = snapshot.docs.map((doc) => {
        const data = doc.data();

        // Initialize counts dynamically
        const counts = {};

        Object.values(data.postsOrders || {}).forEach((entry) => {
          Object.keys(entry).forEach((langKey) => {
            if (entry[langKey]) {
              counts[langKey] = (counts[langKey] || 0) + 1;
              totalPosts++;
            }
          });
        });

        return { id: doc.id, ...data, postsData: {}, counts };
      });

      setPostCount(totalPosts);
      setChapters(chaptersData);
    } catch (error) {
      console.error("Error fetching chapters:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLessons = async () => {
    const q = query(collection(db, "lessons"), orderBy("position"));
    const snapshot = await getDocs(q);
    const lessonsData = snapshot.docs.map((doc) => {
      return {
        id: doc.id,
        ...doc.data(),
      };
    });
    setLessons(lessonsData);
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.email && user?.fromType === "theAgamas" && user.isAdmin) {
      setIsAuth(true);
    } else {
      setIsAuth(false);
      if (
        location.pathname.startsWith("/admin") &&
        location.pathname != "/admin/register" &&
        location.pathname != "/admin/forgotPassword"
      ) {
        navigate("/admin/login");
      }
    }
  }, [location.pathname]);

  useEffect(() => {
    if (isAuth && lessonId) {
      fetchChapters();
    }
  }, [lessonId, isAuth]);

  useEffect(() => {
    if (isAuth) {
      fetchLessons();
    }
  }, [isAuth]);

  return (
    <AuthProvider>
      {isAuth && <Navbar />}
      {/* {showNavbar && isAuth && <NavigationBar />} */}
      <Routes>
        {!isAuth && (
          <>
            <Route
              path="/login"
              element={<LoginPage setIsAuth={setIsAuth} />}
            />
            <Route path="/forgotPassword" element={<ForgotPassword />} />
            <Route path="/register" element={<Register />} />
          </>
        )}
        <Route element={<AuthGuard />}>
          <Route
            path="/"
            element={<AdminLessons lessons={lessons} setLessons={setLessons} />}
          />
          <Route
            path="/videos"
            element={
              <VideoListPage lesson={lessons.find((l) => l.id == lessonId)} />
            }
          />
          <Route
            path="/videos/create"
            element={
              <VideoUpload lesson={lessons.find((l) => l.id == lessonId)} />
            }
          />
          <Route
            path="/post"
            element={
              <ChapterWisePosts
                chapters={chapters}
                postsHasMap={postsHasMap.current}
                setHasMapData={(key, value) => {
                  postsHasMap.current[key] = value;
                }}
                postCount={postCount}
                lesson={lessons.find((l) => l.id == lessonId)}
              />
            }
          />
          <Route
            path="/chapters"
            element={
              <AdminChapters
                chapters={chapters}
                setChapters={setChapters}
                postCount={postCount}
                lesson={lessons.find((l) => l.id == lessonId)}
              />
            }
          />
          <Route
            path="/addPost"
            element={
              <AddPost
                chapters={chapters}
                lesson={lessons.find((l) => l.id == lessonId)}
                setPostCount={setPostCount}
                setChapters={setChapters}
              />
            }
          />
          <Route
            path="/editPost/:editId/:pos"
            element={
              <AddPost
                chapters={chapters}
                lesson={lessons.find((l) => l.id == lessonId)}
                setPostCount={setPostCount}
                setChapters={setChapters}
              />
            }
          />
          <Route
            path="/ai"
            element={
              <GenerateAITranslationPost
                chapters={chapters}
                lesson={lessons.find((l) => l.id == lessonId)}
                setPostCount={setPostCount}
                setChapters={setChapters}
              />
            }
          />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
      <ToastContainer />
    </AuthProvider>
  );
};

export default AdminHomePage;
