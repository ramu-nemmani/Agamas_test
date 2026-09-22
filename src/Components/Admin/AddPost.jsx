import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ExpandLessRoundedIcon from "@mui/icons-material/ExpandLessRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import JoditEditor from "jodit-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useLanguages } from "../../context/LanguageContext";
import { useLoading } from "../../context/LoadingContext";
import { db } from "../../firebase";
import { formatDateTime } from "../../utils/dateFormatter";
import EditorConfig from "../../utils/EditorConfig";
import ToastMSG from "../UI/ToastMSG";

export default function AddPost({
  chapters,
  lesson,
  setPostCount,
  setChapters,
}) {
  const defaultData = {
    language: "",
    post_author: "Translation Team",
    post_content: "",
    post_date: Timestamp.now(),
    post_name: "",
    post_title: "",
    status: "Draft",
  };
  const { editId, pos } = useParams();
  const [searchParams] = useSearchParams();
  const chapterId = searchParams.get("chapter");
  const navigate = useNavigate();
  const [commonFormData, setCommonFormData] = useState({});
  const { setLoading } = useLoading();
  const { languages } = useLanguages();
  const [selectedChapterPostsPositions, setSelectedChapterPostsPositions] =
    useState([]);
  const [selectedLangs, setSelectedLangs] = useState([]);
  const [formData, setFormData] = useState([]);

  const handleChange = (index, name, value) => {
    setFormData((pre) =>
      pre.map((f, i) => {
        if (i === index) {
          f[name] = value;
        }
        return f;
      })
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!editId) {
        if (
          selectedChapterPostsPositions.includes(
            String(commonFormData?.position)
          )
        ) {
          ToastMSG("error", "Position already exists in this chapter");
          return;
        }
      }
      let chapterPayload = {};
      if (editId) {
        const selectedChapter = chapters.find((c) => c.id === editId);
        if (!selectedChapter) {
          ToastMSG("error", "Chapter not found");
          return;
        }
        chapterPayload = selectedChapter.postsOrders[pos];
      }
      let postCount = 0;
      for (const item of formData) {
        if (!item.post_title) {
          continue;
        }
        let currentPostId = item?.id || null;
        if (editId) {
          delete item.id;
        }

        const payload = {
          ...item,
          chapterId: commonFormData.category,
          position: +commonFormData.position,
        };

        if (currentPostId) {
          payload.post_modified = formatDateTime();
          await updateDoc(doc(db, "posts", currentPostId), payload);
        } else {
          payload.post_date = formatDateTime();
          payload.post_modified = formatDateTime();
          payload.status = "Draft";
          const postRef = await addDoc(collection(db, "posts"), payload);
          currentPostId = postRef.id;
          postCount++;
        }
        chapterPayload[item.language] = currentPostId;
      }
      const key = "postsOrders." + commonFormData.position;
      await updateDoc(doc(db, "chapters", commonFormData.category), {
        [key]: chapterPayload,
      });
      ToastMSG("success", "Successfully uploaded posts ");
      if (!editId) {
        setSelectedChapterPostsPositions((pre) => [
          ...pre,
          +commonFormData.position,
        ]);
        setCommonFormData({
          position: +commonFormData.position + 1,
          category: commonFormData.category,
        });
      }
      setChapters((prev) =>
        prev.map((c) => {
          if (c.id === commonFormData.category) {
            return {
              ...c,
              postsOrders: {
                ...c.postsOrders,
                [commonFormData.position]: chapterPayload,
              },
            };
          }
          return c;
        })
      );
      setPostCount((pre) => +pre + postCount);
      setSelectedLangs([]);
      setFormData([]);
      if (editId) {
        navigate("/admin/chapters?lesson=" + lesson.id);
      }
    } catch (error) {
      ToastMSG("error", "Failed to add post. Please try again.");
      console.log("🚀 ~ handleSubmit ~ error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (chapterId) {
      const selectedChapter = chapters.find((c) => c.id === chapterId);
      const positionList = [];
      Object.keys(selectedChapter?.postsOrders).forEach((p) => {
        if (Object.keys(selectedChapter?.postsOrders[p]) != 0) {
          positionList.push(p);
        }
      });

      setSelectedChapterPostsPositions(positionList);
      setCommonFormData({
        position: (positionList?.length || 0) + 1,
        category: chapterId,
      });
    }
  }, [chapterId, chapters]);

  function onLangToggle(key, checked) {
    let next = [];
    let selectedFormData = formData;
    if (checked) {
      next = [...selectedLangs, key];
      selectedFormData.push({ ...defaultData, language: key });
    } else {
      next = selectedLangs.filter((k) => k !== key);
      selectedFormData.filter((f) => {
        if (f.language === key) {
          selectedFormData = selectedFormData.filter(
            (item) => item.language !== key
          );
        }
      });
    }
    setFormData(selectedFormData);
    setSelectedLangs(next);
  }

  async function chapterPosts() {
    try {
      setLoading(true);
      const selectedChapter = chapters.find((c) => c.id === editId);
      if (!selectedChapter) {
        ToastMSG("error", "Chapter not found");
        return;
      }
      const postsLanguages =
        Object.keys(selectedChapter.postsOrders[pos]) || [];
      const langCodes = languages.map((l) => l.id);

      for (const lang of postsLanguages) {
        const postId = selectedChapter.postsOrders[pos][lang];
        if (!postId || !langCodes.includes(lang)) continue;
        const postDoc = doc(db, "posts", postId);
        const postSnapshot = await getDoc(postDoc);
        if (postSnapshot.exists()) {
          const postData = postSnapshot.data();
          setFormData((prev) => [...prev, { ...postData, id: postId }]);
          setSelectedLangs((prev) => [...prev, lang]);
        }
      }
    } catch (error) {
      console.log("🚀 ~ chapterPosts ~ error:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!editId || !pos) {
      return;
    }
    chapterPosts();
    setCommonFormData({
      position: pos,
      category: editId,
    });
  }, [editId, pos]);

  return (
    <Box className="min-h-screen bg-gray-100">
      <Box className="bg-white shadow-sm">
        <Box className="flex items-center gap-4 px-6 py-4 border-b border-gray-200">
          <Button
            variant="text"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/admin/chapters?lesson=" + lesson.id)}
            className="text-gray-500 hover:text-red-500"
          >
            Back
          </Button>
          <Typography variant="h6" className="font-semibold text-gray-800">
            {editId ? "Update" : "Add New"} Post
          </Typography>
        </Box>
      </Box>
      <form onSubmit={handleSubmit}>
        <Box className="p-6 min-h-[100vh] space-y-3 ">
          <Box className="flex gap-4 ">
            <FormControl fullWidth className="flex-1">
              <InputLabel id="category-label">Chapter</InputLabel>
              <Select
                labelId="category-label"
                id="category"
                value={commonFormData?.category || ""}
                label="Category"
                onChange={(e) => {
                  const selectedChapter = chapters.find(
                    (c) => c.id === e.target.value
                  );
                  const positionList = [];
                  Object.keys(selectedChapter?.postsOrders).forEach((p) => {
                    if (Object.keys(selectedChapter?.postsOrders[p]) != 0) {
                      positionList.push(p);
                    }
                  });

                  setSelectedChapterPostsPositions(positionList);
                  setCommonFormData({
                    position: (positionList?.length || 0) + 1,
                    category: e.target.value,
                  });
                }}
                required
                className="bg-white"
                readOnly={editId}
                disabled={editId}
              >
                <MenuItem value="">Select Category</MenuItem>
                {chapters.map((c) => (
                  <MenuItem value={c.id} key={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box className="w-1/4">
              <TextField
                fullWidth
                type="number"
                label="Position"
                value={commonFormData?.position || ""}
                onChange={(e) => {
                  setCommonFormData((pre) => ({
                    ...pre,
                    position: +e.target.value,
                  }));
                }}
                required
                error={selectedChapterPostsPositions.includes(
                  String(commonFormData?.position)
                )}
                helperText={
                  selectedChapterPostsPositions.includes(
                    String(commonFormData?.position)
                  ) && !editId
                    ? "Position already exists"
                    : ""
                }
                readOnly={editId}
                disabled={editId}
                className="bg-white"
              />
            </Box>
          </Box>
          <Paper variant="outlined" sx={{ borderRadius: 3, p: 2 }}>
            <Typography variant="subtitle2" fontWeight="medium" gutterBottom>
              Languages
            </Typography>
            {languages.map((l) => (
              <FormControlLabel
                key={l.id}
                control={
                  <Checkbox
                    checked={selectedLangs.includes(l.id)}
                    onChange={(e) => onLangToggle(l.id, e.target.checked)}
                  />
                }
                label={l.name}
              />
            ))}
          </Paper>
          {formData.length === 0 ? (
            <Typography variant="body2" className="text-gray-500 mt-4">
              No languages selected. Please select at least one language to add
              posts.
            </Typography>
          ) : (
            formData.map((data, index) => {
              return (
                <PostFormData
                  key={index}
                  formData={data}
                  handleChange={handleChange}
                  index={index}
                  languages={languages}
                />
              );
            })
          )}
        </Box>
        <Box className="flex justify-end gap-3 border-t border-gray-200 px-6 py-3 bg-white sticky bottom-0 shadow-sm">
          <Button
            variant="outlined"
            onClick={() => navigate("/admin/chapters?lesson=" + lesson.id)}
            className="border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            className="bg-[#cd5c3d] hover:bg-[#b8503a]"
          >
            Submit
          </Button>
        </Box>
      </form>
    </Box>
  );
}

function PostFormData({
  customClass = "",
  formData,
  handleChange,
  index,
  languages,
}) {
  const [isExpended, setIsExpended] = useState(true);
  const buttons = [
    "bold",
    "underline",
    "italic",
    "|",
    "align",
    "|",
    "ul",
    "ol",
    "outdent",
    "indent",
    "|",
    "fontsize",
    "|",
    "lineHeight",
    "find",
  ];
  const editorConfig = {
    readonly: false,
    toolbar: true,
    spellcheck: true,
    language: "en",
    toolbarButtonSize: "medium",
    toolbarAdaptive: false,
    showCharsCounter: false,
    showWordsCounter: false,
    showXPathInStatusbar: false,
    askBeforePasteHTML: false,
    askBeforePasteFromWord: false,
    buttons: buttons,
    uploader: {
      insertImageAsBase64URI: false,
    },
  };

  const lang = languages.find((l) => l.id === formData.language);
  return (
    <Box className={` bg-white rounded-lg shadow-sm ${customClass}`}>
      <div
        className={
          "flex items-center justify-between px-6 py-4 cursor-pointer " +
          (isExpended ? " border-b border-gray-200 " : "")
        }
        onClick={() => setIsExpended(!isExpended)}
      >
        <Typography variant="h6" className={" font-semibold uppercase   "}>
          {lang?.name || "Unknown Language"}
        </Typography>
        {isExpended ? (
          <ExpandLessRoundedIcon
            fontSize={"large"}
            className=" text-gray-500"
          />
        ) : (
          <ExpandMoreRoundedIcon
            fontSize={"large"}
            className=" text-gray-500"
          />
        )}
      </div>
      {isExpended && (
        <div className="p-6">
          <Box className="mb-4">
            <TextField
              fullWidth
              label="Post Title"
              value={formData.post_title}
              onChange={(e) =>
                handleChange(index, "post_title", e.target.value)
              }
              required
              placeholder="Enter the title of the text"
              className="bg-white"
            />
          </Box>
          <Box className="mb-4">
            <Typography variant="body2" className="font-medium mb-1">
              Content ({lang?.name})
            </Typography>
            <JoditEditor
              value={formData.post_content}
              config={EditorConfig}
              onBlur={(data) => handleChange(index, "post_content", data)}
            />
          </Box>
          <FormControl fullWidth>
            <InputLabel id="translator-label">Translator</InputLabel>
            <Select
              labelId="translator-label"
              id="translator"
              value={formData.post_author}
              label="Translator"
              onChange={(e) =>
                handleChange(index, "post_author", e.target.value)
              }
              className="bg-white"
            >
              <MenuItem value="Translation Team">Translation Team</MenuItem>
              <MenuItem value="Dr. Rajesh Savera">Dr. Rajesh Savera</MenuItem>
              <MenuItem value="Dr. Lim Siow Jin">Dr. Lim Siow Jin</MenuItem>
            </Select>
          </FormControl>
        </div>
      )}
    </Box>
  );
}
