import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import {
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguages } from "../../context/LanguageContext";
import { useLoading } from "../../context/LoadingContext";
import { db } from "../../firebase";
import ToastMSG from "../UI/ToastMSG";
const ChapterWisePosts = ({
  chapters,
  postsHasMap,
  setHasMapData,
  postCount,
  lesson,
}) => {
  const [posts, setPosts] = useState([]);
  // const [editPostData, setEditPostData] = useState(null);
  const [bulkDeleteData, setBulkDeleteData] = useState([]);
  const navigate = useNavigate();
  const { setLoading } = useLoading();
  const { languages } = useLanguages();

  const fetchPosts = async (chapterId = null) => {
    const key = chapterId ? chapterId : "empty";
    if (postsHasMap?.[key]) {
      setPosts(postsHasMap[key]);
      return;
    }
    const langCodes = languages.map((l) => l.id);
    let postQuery = query(
      collection(db, "posts"),
      where("chapterId", "==", chapterId),
      where("language", "in", langCodes)
    );
    if (chapterId) {
      postQuery = query(postQuery, orderBy("position"));
    }
    const snapshot = await getDocs(postQuery);
    const postsList = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      const chapterName = chapters.find((c) => c.id === chapterId)?.name || "";

      postsList.push({
        ...data,
        id: doc.id,
        chapterName: chapterName,
        lang: data.language
          ? data.language.charAt(0).toUpperCase() + data.language.slice(1)
          : "",
      });
    });
    setPosts(postsList);
    setHasMapData(key, postsList);
  };

  useEffect(() => {
    if (!lesson) {
      navigate("/admin");
    }
  }, [lesson]);

  useEffect(() => {
    fetchPosts(chapters[0]?.id || null);
  }, [chapters]);

  const handleDelete = async (post) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this post?"
    );
    if (!confirmed) return;
    setLoading(true);

    try {
      await deleteDoc(doc(db, "posts", post.id));
      if (post?.chapterId) {
        const updateChapterPOs = chapters.find(
          (c) => c.id === post.chapterId
        )?.postsOrders;

        delete updateChapterPOs[post.position][post.language];

        await updateDoc(doc(db, "chapters", post.chapterId), {
          postsOrders: updateChapterPOs,
        });
      }
      await addDoc(collection(db, "recycleBin"), {
        ...post,
        type: "post",
        deletedAt: Timestamp.now(),
      });
      setPosts((pre) => pre.filter((p) => p.id !== post.id));
      ToastMSG("success", "Successfully deleted the post");
    } catch (err) {
      ToastMSG("error", "Failed to delete post. Please try again.");
      console.error("Failed to delete post:", err);
    } finally {
      setLoading(false);
    }
  };

  async function bulkDeletePost() {
    const confirmed = window.confirm(
      "Are you sure you want to delete all selected posts?"
    );
    if (!confirmed) return;
    setLoading(true);
    try {
      for (const postId of bulkDeleteData) {
        const removedPost = posts.find((p) => p.id === postId);
        if (removedPost?.chapterId) {
          const updateChapterPOs = chapters.find(
            (c) => c.id === removedPost.chapterId
          )?.postsOrders;
          updateChapterPOs[removedPost.position][removedPost.language] = "";
          await updateDoc(doc(db, "chapters", removedPost.chapterId), {
            postsOrders: updateChapterPOs,
          });
        }
        await deleteDoc(doc(db, "posts", postId));
        await addDoc(collection(db, "recycleBin"), {
          ...removedPost,
          type: "post",
          deletedAt: Timestamp.now(),
        });
      }
      setPosts((pre) => pre.filter((p) => !bulkDeleteData.includes(p.id)));
      setBulkDeleteData([]);
      ToastMSG("success", "Successfully deleted all the posts");
    } catch (err) {
      ToastMSG("error", "Failed to delete posts. Please try again.");
      console.error("Failed to delete posts:", err);
    } finally {
      setBulkDeleteData([]);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <Typography variant="h6" className="mb-6 font-bold text-gray-800">
          Chapter Wise Posts
        </Typography>
        <Typography variant="h4" className="mb-6 font-bold text-gray-800">
          {lesson?.name}
        </Typography>
        <div className="flex flex-col sm:flex-row gap-4 py-6">
          <Card className="flex-1">
            <CardContent>
              <Typography variant="h6" color="textSecondary">
                Total Chapters
              </Typography>
              <Typography variant="h4">{chapters.length}</Typography>
            </CardContent>
          </Card>
          <Card className="flex-1">
            <CardContent>
              <Typography variant="h6" color="textSecondary">
                Total Posts
              </Typography>
              <Typography variant="h4">{postCount}</Typography>
            </CardContent>
          </Card>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center my-6 gap-4">
          <FormControl className="w-3/4 ">
            <InputLabel>Filter By Chapters</InputLabel>
            <Select
              defaultValue={chapters[0]?.id || ""}
              onChange={async (e) => {
                await fetchPosts(e.target.value);
              }}
              label="Filter By Chapters"
              className="rounded-lg"
            >
              {chapters.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <div className="flex gap-3">
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate("/admin/addPost?lesson=" + lesson.id)}
              className="rounded-2xl h-14"
            >
              Upload Post
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={bulkDeletePost}
              className="rounded-2xl"
              disabled={bulkDeleteData.length === 0}
            >
              Bulk Delete
            </Button>
          </div>
        </div>
        <TableContainer component={Paper} className="shadow-lg rounded-xl">
          <Table>
            <TableHead>
              <TableRow className="bg-gray-200">
                <TableCell align="center" className="font-bold text-lg">
                  <div className="flex justify-between items-center">
                    S.No
                    <Checkbox
                      onChange={(e) => {
                        if (e.target.checked) {
                          setBulkDeleteData(posts.map((p) => p.id));
                        } else {
                          setBulkDeleteData([]);
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </TableCell>
                <TableCell className="font-bold text-lg">Chapters</TableCell>
                <TableCell className="font-bold text-lg">Post</TableCell>
                <TableCell className="font-bold text-lg">Language</TableCell>
                <TableCell align="center" className="font-bold text-lg">
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {posts.map((item, index) => (
                <TableRow
                  key={item.id}
                  className="hover:bg-orange-50 transition cursor-pointer"
                  onClick={() => {
                    const langMap = {
                      ChineseToEnglish: "CN-EN",
                      Chinese: "CN",
                      English: "EN",
                    };
                    window.open(
                      `/admin/post/${item.chapterName}?lang=${
                        langMap[item.language]
                      }&id=${item.chapterId}&postNo=${item.position}`,
                      "_blank"
                    );
                  }}
                >
                  <TableCell
                    align="center"
                    className="text-lg"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-between items-center">
                      {index + 1}
                      <Checkbox
                        checked={bulkDeleteData.includes(item.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setBulkDeleteData([...bulkDeleteData, item.id]);
                          } else {
                            setBulkDeleteData(
                              bulkDeleteData.filter((b) => b !== item.id)
                            );
                          }
                        }}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-lg">{item.chapterName}</TableCell>
                  <TableCell className="text-lg">{item.post_title}</TableCell>
                  <TableCell className="text-lg">{item.lang}</TableCell>
                  <TableCell
                    align="center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        onClick={() => {
                          navigate(
                            `/admin/editPost/${item.chapterId}/${item.position}?lesson=${lesson.id}`
                          );
                          // setEditPostData(item)
                        }}
                        className="rounded-2xl text-base"
                      >
                        <EditNoteRoundedIcon />
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleDelete(item)}
                        className="rounded-2xl text-base"
                      >
                        <DeleteOutlineRoundedIcon />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {posts.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    align="center"
                    className="py-4 text-lg"
                  >
                    <Typography color="textSecondary">
                      No posts found.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {/* {editPostData?.id && (
          <EditPost
            chapters={chapters}
            postData={editPostData}
            setClose={() => setEditPostData(null)}
            updatePost={(data) => {
              setPosts((pre) =>
                pre.map((p) => {
                  if (p.id === data.id) {
                    return data;
                  }
                  return p;
                })
              );
            }}
          />
        )} */}
      </div>
    </div>
  );
};

export default ChapterWisePosts;
