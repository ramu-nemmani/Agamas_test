import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { pdf } from "@react-pdf/renderer";
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
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguages } from "../../context/LanguageContext";
import { useLoading } from "../../context/LoadingContext";
import { db, storage } from "../../firebase";
import ChaptersPdf from "../pdf/ChaptersPdf";
import ToastMSG from "../UI/ToastMSG";
export default function AdminChapters({
  chapters,
  setChapters,
  postCount,
  lesson,
}) {
  const { languages } = useLanguages();
  const [searchTerm, setSearchTerm] = useState("");
  const [editedData, setEditedData] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [newChapterName, setNewChapterName] = useState("");
  const navigate = useNavigate();
  const filteredChapters = chapters.filter((chapter) =>
    chapter.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const [lang, setLang] = useState("english");
  const [expanded, setExpanded] = useState(null);
  const { setLoading } = useLoading();
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const handleAccordionChange = (id) => async (event, isExpanded) => {
    setExpanded(isExpanded ? id : false);
    if (isExpanded) {
      const res = await fetchPosts(id);
      setChapters((pre) =>
        pre.map((c) => {
          if (c.id == id) {
            c.postsData[lang] = res;
          }
          return c;
        })
      );
    }
  };

  const handleEditClick = (chapter) => {
    setEditedData({ ...chapter });
  };

  const handleChange = (e) => {
    e.stopPropagation();
    setEditedData({ ...editedData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.stopPropagation();
    try {
      const ref = doc(db, "chapters", editedData.id);
      await updateDoc(ref, editedData);
      const updatedData = chapters.map((c) => {
        if (c.id === editedData.id) {
          return editedData;
        }
        return c;
      });
      setChapters(updatedData);
      setEditedData({});
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  const handleDeleteChapter = async (id) => {
    if (!window.confirm("Are you sure you want to delete this chapter?"))
      return;
    try {
      await deleteDoc(doc(db, "chapters", id));
      let removedChapter = {};
      const filterData = chapters.filter((c) => {
        if (c.id === id) {
          removedChapter = c;
          return false;
        }
        return true;
      });
      await addDoc(collection(db, "recycleBin"), {
        ...removedChapter,
        type: "chapter",
        deletedAt: Timestamp.now(),
      });
      setChapters(filterData);
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete chapter. Please try again.");
    }
  };

  const handleAddChapter = async () => {
    if (!newChapterName.trim()) return;
    try {
      const Payload = {
        name: newChapterName.trim(),
        createdAt: Timestamp.now(),
        position: chapters.length + 1,
        postsOrders: [],
        lessonId: lesson.id,
      };
      const ref = await addDoc(collection(db, "chapters"), Payload);
      setChapters([
        ...chapters,
        {
          id: ref.id,
          ...Payload,
        },
      ]);
      setNewChapterName("");
      setShowModal(false);
    } catch (error) {
      console.error("Add failed:", error);
    }
  };

  const fetchPosts = async (chapterId) => {
    try {
      const postQuery = query(
        collection(db, "posts"),
        where("chapterId", "==", chapterId),
        where("language", "==", lang),
        orderBy("position")
      );
      const snapshot = await getDocs(postQuery);
      const postsList = snapshot.docs.map((doc) => {
        const { post_title, position, language, ...rest } = doc.data();
        return {
          ...rest,
          post_title,
          id: doc.id,
          language,
          postTitle: post_title,
          position,
        };
      });
      return postsList;
    } catch (error) {
      console.log("🚀 ~ fetchPosts ~ error:", error);
    }
  };

  const handleDeletePost = async (post) => {
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
      setChapters((pre) =>
        pre.map((c) => {
          if (c.id == post.chapterId) {
            c.postsData[lang] = c.postsData[lang].filter(
              (p) => p.id !== post.id
            );
          }
          return c;
        })
      );
      ToastMSG("success", "Successfully deleted the post");
    } catch (err) {
      ToastMSG("error", "Failed to delete post. Please try again.");
      console.error("Failed to delete post:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAndUpload = async (chapter) => {
    if (uploadingPdf) {
      return;
    }
    try {
      setUploadingPdf(true);

      const res = await fetchPosts(chapter.id);
      if (res.length == 0) {
        setUploadingPdf(false);
        return "";
      }
      const payload = [
        {
          chapterId: chapter.id,
          chapterName: chapter.name,
          lang,
          items: res,
        },
      ];
      const blob = await pdf(
        <ChaptersPdf topHeaderText={lesson?.name} chapters={payload} />
      ).toBlob();
      const fileName = `${chapter.name}_${lang}.pdf`;
      const storageRef = ref(storage, `${lesson?.name}/${fileName}`);
      await uploadBytes(storageRef, blob, {
        contentType: "application/pdf",
        contentDisposition: `attachment; filename="${fileName}"`,
      });
      const downloadURL = await getDownloadURL(storageRef);
      const chapterRef = doc(db, "chapters", chapter.id);
      await updateDoc(chapterRef, {
        pdfLink: {
          ...chapter.pdfLink,
          [lang]: downloadURL,
        },
      });
      alert("PDF uploaded successfully!");
    } catch (error) {
      console.log("🚀 ~ handleGenerateAndUpload ~ error:", error);
    } finally {
      setUploadingPdf(false);
    }
  };
  // const handleGenerateAndUploadPdfChapterWise = async (chapter) => {
  //   try {
  //     console.log("PDF started ");
  //     const map = {};
  //     for (let langData of languages) {
  //       map[langData.id] = await handleGenerateAndUpload(chapter, langData.id);
  //     }
  //     console.log("🚀 ~ handleGenerateAndUploadPdfChapterWise ~ map:", map);
  //     const chapterRef = doc(db, "chapters", chapter.id);
  //     await updateDoc(chapterRef, {
  //       pdfLink: map,
  //     });
  //     alert("All PDF uploaded successfully! ");
  //   } catch (error) {
  //     console.error("PDF upload failed:", error);
  //   }
  // };

  useEffect(() => {
    if (!lesson?.id) {
      navigate("/admin");
    }
  }, [lesson]);

  useEffect(() => {
    async function fetchData() {
      if (expanded) {
        const res = await fetchPosts(expanded);
        setChapters((pre) =>
          pre.map((c) => {
            if (c.id == expanded) {
              c.postsData[lang] = res;
            }
            return c;
          })
        );
      }
    }
    fetchData();
  }, [lang]);
  function Spinner() {
    return (
      <div className=" fixed bg-black/10 w-full h-full z-[999]  overflow-hidden  ">
        <div className="  flex justify-center items-center h-full overflow-hidden  ">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }
  return (
    <div className="  ">
      {uploadingPdf && <Spinner />}
      <div className="min-h-screen bg-gray-100  p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
          <Typography variant="h6" className="mb-6 font-bold text-gray-800">
            Chapters List
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

          <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
            <TextField
              label="Search Chapter"
              placeholder="Search chapter..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="sm:w-2/3"
            />
            <FormControl className="w-96">
              <InputLabel id="language-select-label">Language</InputLabel>
              <Select
                label="Search Chapter"
                labelId="language-select-label"
                id="language-select"
                value={lang || ""}
                onChange={(e) => setLang(e.target.value)}
              >
                {languages.map((language) => (
                  <MenuItem key={language.id} value={language.id}>
                    {language.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setShowModal(true)}
              className="w-52 h-13  rounded-2xl"
            >
              Add Chapter
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate(`/admin/addPost?lesson=${lesson.id}`)}
              className="w-40 h-13  rounded-2xl"
            >
              Add Post
            </Button>
          </div>

          <div className="space-y-4">
            {filteredChapters.map((chapter, index) => (
              <Accordion
                key={chapter.id}
                expanded={expanded === chapter.id}
                onChange={handleAccordionChange(chapter.id)}
                className=" rounded-xl"
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={`panel-${index}-content`}
                  id={`panel-${index}-header`}
                  className="cursor-pointer"
                >
                  <div className=" w-full">
                    <div className="w-full flex justify-between items-center gap-2">
                      <Typography
                        variant="body3"
                        className="text-xl flex w-full"
                      >
                        {index + 1}.{" "}
                        {editedData.id === chapter.id ? (
                          <TextField
                            name="name"
                            value={editedData.name}
                            onChange={handleChange}
                            fullWidth
                            variant="outlined"
                            size="small"
                          />
                        ) : (
                          chapter.name
                        )}
                      </Typography>

                      {/* Edit & Delete Buttons in AccordionSummary */}
                      <div className="flex gap-2">
                        {editedData.id === chapter.id ? (
                          <div className="flex  gap-2">
                            <div
                              onClick={handleSave}
                              className="border px-2 py-1 border-green-400 text-green-400 hover:bg-green-400 hover:text-white cursor-pointer rounded-xl  text-base "
                            >
                              Save
                            </div>
                            <div
                              color="secondary"
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditedData({});
                              }}
                              className="border px-2 py-1 border-gray-400 text-gray-400 hover:bg-gray-400 hover:text-white cursor-pointer rounded-xl  text-base"
                            >
                              Cancel
                            </div>
                          </div>
                        ) : (
                          <div className="flex  gap-2">
                            <div
                              color="primary"
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditClick(chapter);
                              }}
                              className="rounded-2xl text-base"
                            >
                              <EditNoteRoundedIcon />
                            </div>
                            <div
                              color="primary"
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleGenerateAndUpload(chapter);
                              }}
                              className="rounded-2xl text-base flex border px-2"
                              title="Upload Pdf"
                            >
                              <UploadFileIcon />
                              <span>PDF</span>
                            </div>
                            <div
                              color="error"
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteChapter(chapter.id);
                              }}
                              className="rounded-2xl text-base"
                            >
                              <DeleteOutlineRoundedIcon />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-sm text-gray-500">
                      {languages.map(({ id, shortForm }, idx) => (
                        <span key={id} className="">
                          {shortForm} : {chapter?.counts?.[id] || 0}
                          {idx < languages.length - 1 && " / "}
                        </span>
                      ))}
                    </div>
                  </div>
                </AccordionSummary>
                <AccordionDetails>
                  <div className="bg-gray-50">
                    <div className="grid grid-cols-1 gap-2 p-6">
                      {chapter?.postsData?.[lang]?.length == 0 ? (
                        <>NO POST FOUND</>
                      ) : (
                        chapter?.postsData[lang]?.map((sub, index) => (
                          <div
                            key={sub.id}
                            onClick={() => {
                              navigate(
                                `/chapters/${lesson.id}/${chapter.name}?id=${chapter.id}&postNo=${sub.position}&lang=CN`
                              );
                            }}
                            className="grid grid-cols-5 w-full rounded-lg p-1 px-6   hover:bg-[#f1ebeb81] transition cursor-pointer  font-medium text-gray-800 "
                          >
                            <div className="col-span-3  flex w-fit">
                              {index + 1}. {sub.postTitle}
                            </div>
                            <div className="   flex w-fit">
                              {languages.find((l) => l.id == sub.language).name}
                            </div>
                            <div className="flex justify-end gap-2 ">
                              <div
                                color="primary"
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(
                                    `/admin/editPost/${chapter.id}/${chapter.position}?lesson=${lesson.id}`
                                  );
                                }}
                                className="rounded-2xl text-base"
                              >
                                <EditNoteRoundedIcon />
                              </div>
                              <div
                                color="error"
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeletePost(sub.id);
                                }}
                                className="rounded-2xl text-base"
                              >
                                <DeleteOutlineRoundedIcon />
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </AccordionDetails>
              </Accordion>
            ))}
            {filteredChapters.length === 0 && (
              <div className="py-4 text-center">
                <Typography color="textSecondary" variant="h6">
                  No chapters found.
                </Typography>
              </div>
            )}
          </div>

          <Modal
            open={showModal}
            onClose={() => {
              setShowModal(false);
              setNewChapterName("");
            }}
            className="flex items-center justify-center"
          >
            <Box className="bg-white rounded-lg shadow-lg p-6 w-full max-w-5xl">
              <Typography variant="h6" className="mb-4 font-semibold">
                Add Chapter
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Chapter name"
                value={newChapterName}
                onChange={(e) => setNewChapterName(e.target.value)}
                className="mb-4"
                InputProps={{
                  className: "text-lg",
                }}
              />
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAddChapter}
                  className="rounded-2xl text-base"
                >
                  Add
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => {
                    setShowModal(false);
                    setNewChapterName("");
                  }}
                  className="rounded-2xl text-base"
                >
                  Cancel
                </Button>
              </div>
            </Box>
          </Modal>
        </div>
      </div>
    </div>
  );
}
