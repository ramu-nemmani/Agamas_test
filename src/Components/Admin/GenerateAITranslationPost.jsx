import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import {
  Box,
  Button,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import JoditEditor from "jodit-react";
import { useState } from "react";
import { useLanguages } from "../../context/LanguageContext";
import { useLoading } from "../../context/LoadingContext";
import { db } from "../../firebase";
import { formatDateTime } from "../../utils/dateFormatter";
import EditorConfig from "../../utils/EditorConfig";
import { GenerateTranslations } from "../../utils/GenerateTranslations";
import ToastMSG from "../UI/ToastMSG";

/* ---------------- Small helpers ---------------- */
const SectionCard = ({ title, subtitle, right, children }) => (
  <Box className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
    <Box className="flex items-center justify-between gap-3 px-5 py-4">
      <div>
        <Typography variant="subtitle1" className="font-semibold">
          {title}
        </Typography>
        {subtitle ? (
          <Typography variant="body2" className="text-zinc-600">
            {subtitle}
          </Typography>
        ) : null}
      </div>
      {right}
    </Box>
    <Divider />
    <Box className="p-5">{children}</Box>
  </Box>
);

export default function GenerateAITranslationPost({
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

  const [commonFormData, setCommonFormData] = useState({});
  const [postsData, setPostsData] = useState([]);
  const [isGenerate, setIsGenerate] = useState({ show: false, status: false });

  const { setLoading } = useLoading();
  const { languages } = useLanguages();

  const [formData, setFormData] = useState([
    { ...defaultData },
    { ...defaultData },
  ]);

  const handleChange = (index, name, value) => {
    let isFound = false;
    if (name === "language") {
      const post = postsData.find(
        (p) => p.language == value && p.position === formData[0].position
      );
      if (post) {
        setFormData([formData[0], post]);
        isFound = true;
        setIsGenerate((pre) => ({ ...pre, show: false }));
      } else {
        setFormData((pre) =>
          pre.map((f, i) =>
            i === index
              ? {
                  ...f,
                  [name]: value,
                  post_author: "",
                  post_content: "",
                  post_date: Timestamp.now(),
                  post_name: "",
                  post_title: "",
                }
              : f
          )
        );
        if (commonFormData.post) {
          setIsGenerate((pre) => ({ ...pre, show: true }));
        }
      }
    }

    if (!isFound) {
      setFormData((pre) =>
        pre.map((f, i) => (i === index ? { ...f, [name]: value } : f))
      );
    }
  };

  const handleSubmit = async (isPublish) => {
    if (!formData[0]?.language || !formData[1]?.language) {
      ToastMSG("error", "Please select both source and target languages.");
      return;
    }
    setLoading(true);
    try {
      let chapterPayload = {};
      const selectedChapter = chapters.find(
        (c) => c.id === commonFormData.category
      );
      if (!selectedChapter) {
        ToastMSG("error", "Chapter not found");
        return;
      }
      const item = formData[1];
      chapterPayload = selectedChapter.postsOrders[commonFormData.position];
      if (!item.post_title) {
        return;
      }
      let currentPostId = item?.id || null;
      const payload = {
        ...item,
        chapterId: commonFormData.category,
        position: +commonFormData.position,
        status: isPublish ? "Publish" : "Draft",
      };
      payload.post_date = formatDateTime();
      payload.post_modified = formatDateTime();
      const postRef = await addDoc(collection(db, "posts"), payload);
      currentPostId = postRef.id;
      chapterPayload[item.language] = currentPostId;
      const key = "postsOrders." + commonFormData.position;
      await updateDoc(doc(db, "chapters", commonFormData.category), {
        [key]: chapterPayload,
      });
      ToastMSG("success", "Successfully uploaded posts ");
    } catch (error) {
      ToastMSG("error", "Generation failed. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  function htmlToText(htmlContent) {
    const text = Array.from(
      new DOMParser()
        .parseFromString(htmlContent, "text/html")
        .querySelectorAll("p")
    )
      .map((p) => p.textContent)
      .join("\n");
    return text;
  }

  const generatePost = async (e) => {
    e.preventDefault();
    if (!commonFormData.category || !commonFormData.post) {
      ToastMSG("error", "Please select Chapter and Post.");
      return;
    }
    if (!formData[0]?.language || !formData[1]?.language) {
      ToastMSG("error", "Please select both source and target languages.");
      return;
    }
    setLoading(true);
    try {
      const targetLang = formData[1].language;
      //   lang1 -> lang1tolang2 ->  lang1, lang2
      let payload = {};
      let contentType = "new";
      if (targetLang.includes("To")) {
        const lang2 = targetLang.split("To")[1];
        const lang2Post = postsData.find(
          (p) => p.language.toLowerCase() == lang2.toLowerCase()
        );
        console.log("🚀 ~ generatePost ~ lang2Post:", lang2, lang2Post);
        if (lang2Post) {
          payload[formData[0].language] = {
            language: formData[0].language,
            post_content: htmlToText(formData[0].post_content),
            post_title: formData[0].post_title,
          };
          payload[lang2] = {
            language: lang2,
            post_content: htmlToText(lang2Post.post_content),
            post_title: lang2Post.post_title,
          };
          contentType = "combine";
        }
      } else {
        //    lang3 | lang1tolang2->lang2 ->  lang1tolang2

        const sourceLang = formData[0].language;
        if (sourceLang.includes("To")) {
          contentType = "separate";
          payload = {
            language: formData[0].language,
            post_content: htmlToText(formData[0].post_content),
            post_title: formData[0].post_title,
          };
        } else {
          const lang2Post = postsData.find((p) =>
            p.language.toLowerCase().includes("to" + targetLang.toLowerCase())
          );
          if (lang2Post) {
            contentType == "separate";
            payload = {
              language: lang2Post.language,
              post_content: htmlToText(lang2Post.post_content),
              post_title: lang2Post.post_title,
            };
          }
        }
      }

      if (contentType == "new") {
        payload = {
          language: formData[0].language,
          post_content: htmlToText(formData[0].post_content),
          post_title: formData[0].post_title,
        };
      }

      console.log("🚀 ~ generatePost ~ payload:", payload, contentType);

      const res = await GenerateTranslations(
        payload,
        formData[0].language,
        formData[1].language,
        contentType
      );
      console.log("🚀 ~ generatePost ~ res:", res);

      setFormData([
        formData[0],
        {
          ...formData[1],
          post_title: res?.Post_Title || "",
          post_content: res?.Content || "",
        },
      ]);

      setIsGenerate((pre) => ({ ...pre, status: true }));
    } catch (error) {
      ToastMSG("error", "Generation failed. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  async function chapterPosts(chapterId) {
    try {
      setLoading(true);
      const langCodes = languages.map((l) => l.id);
      const qy = query(
        collection(db, "posts"),
        where("chapterId", "==", chapterId),
        where("language", "in", langCodes),
        orderBy("position", "asc"),
        orderBy("post_title", "asc")
      );
      const postDocs = await getDocs(qy);
      const res = postDocs.docs.map((d) => {
        const data = d.data();
        return { id: d.id, ...data };
      });
      setPostsData(res);
    } catch (error) {
      console.error("chapterPosts error:", error);
    } finally {
      setLoading(false);
    }
  }

  const sourceLang =
    languages.find((l) => l.id === formData[0].language)?.name || "—";
  const targetLang =
    languages.find((l) => l.id === formData[1].language)?.name || "—";

  return (
    <Box className="bg-gradient-to-b from-zinc-50 to-white ">
      <h1 className="text-2xl font-bold p-6">
        <Typography variant="h6" className="mb-6 font-bold text-gray-800">
          AI Translation
        </Typography>
        <Typography variant="h4" className="mb-6 font-bold text-gray-800">
          {lesson?.name}
        </Typography>
      </h1>
      <form>
        <Box className=" p-6 grid grid-cols-5 gap-4">
          {/* Editors */}
          <EditorCard
            title={`Original (${sourceLang})`}
            formData={formData[0]}
            index={0}
            languages={languages}
            handleChange={handleChange}
            readOnlyTitle={true}
            readOnlyEditor={true}
            hint="This is the source post content."
          />
          <EditorCard
            title={`Translated (${targetLang})`}
            formData={formData[1]}
            index={1}
            languages={languages}
            handleChange={handleChange}
            readOnlyTitle={false}
            readOnlyEditor={false}
            hint="This will be auto-filled by AI. You can edit afterwards."
            tinted
          />
          <div className="sticky top-30  h-fit ">
            <SectionCard
              title="Selection"
              subtitle="Choose chapter, source post and languages"
            >
              <div className="space-y-4">
                {/* Chapter */}
                <div className="">
                  <FormControl fullWidth className="">
                    <InputLabel id="chapter-label">Chapter</InputLabel>
                    <Select
                      labelId="chapter-label"
                      value={commonFormData?.category || ""}
                      label="Chapter"
                      onChange={(e) => {
                        setCommonFormData({
                          category: e.target.value,
                          position: "",
                          post: "",
                        });
                        setFormData([{ ...defaultData }, { ...defaultData }]);
                        chapterPosts(e.target.value);
                      }}
                      required
                      className="bg-white"
                    >
                      <MenuItem value="">Select Chapter</MenuItem>
                      {chapters.map((c) => (
                        <MenuItem value={c.id} key={c.id}>
                          {c.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
                <div className="">
                  {/* Post */}
                  <FormControl fullWidth className="">
                    <InputLabel id="post-label">Source Post</InputLabel>
                    <Select
                      labelId="post-label"
                      value={commonFormData?.post || ""}
                      label="Source Post"
                      onChange={(e) => {
                        const post = postsData.find(
                          (p) => p.id === e.target.value
                        );
                        setCommonFormData((pre) => ({
                          ...pre,
                          post: e.target.value,
                          position: post?.position || "",
                        }));
                        // left editor becomes the picked source post
                        setFormData([post || { ...defaultData }, formData[1]]);
                      }}
                      required
                      className="bg-white"
                    >
                      <MenuItem value="">Select Post</MenuItem>
                      {postsData.map((p) => (
                        <MenuItem value={p.id} key={p.id}>
                          {p.post_title}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
                <div className="">
                  {/* Position */}
                  <Box className="md:col-span-2">
                    <TextField
                      fullWidth
                      type="number"
                      label="Position"
                      value={commonFormData?.position || ""}
                      inputProps={{ readOnly: true }}
                      disabled
                      className="bg-white"
                    />
                  </Box>
                </div>
                <div className="flex gap-4">
                  {/* Languages */}
                  <FormControl fullWidth className="">
                    <InputLabel id="lang-src">Source Language</InputLabel>
                    <Select
                      labelId="lang-src"
                      value={formData[0]?.language || ""}
                      label="Source Language"
                      onChange={(e) =>
                        handleChange(0, "language", e.target.value)
                      }
                      required
                      className="bg-white"
                      // keep disabled: source language should be from the picked post
                      disabled
                    >
                      <MenuItem value="">Select Language</MenuItem>
                      {languages.map((l) => (
                        <MenuItem value={l.id} key={l.id}>
                          {l.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth className="">
                    <InputLabel id="lang-tgt">Target Language</InputLabel>
                    <Select
                      labelId="lang-tgt"
                      value={formData[1]?.language || ""}
                      label="Target Language"
                      onChange={(e) =>
                        handleChange(1, "language", e.target.value)
                      }
                      required
                      className="bg-white"
                    >
                      <MenuItem value="">Select Language</MenuItem>
                      {languages.map((l) => (
                        <MenuItem value={l.id} key={l.id}>
                          {l.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
              </div>
              <Box className=" flex items-center justify-between  py-6">
                {!isGenerate.status ? (
                  <Button
                    type="button"
                    onClick={generatePost}
                    variant="contained"
                    startIcon={<AutoAwesomeIcon />}
                    className="bg-zinc-900 hover:bg-zinc-800 normal-case"
                    disabled={!isGenerate.show}
                  >
                    Generate
                  </Button>
                ) : (
                  <>
                    <Button
                      type="submit"
                      variant="contained"
                      className="bg-[#cd5c3d] hover:bg-[#b8503a] normal-case"
                      onClick={(e) => {
                        e.preventDefault();
                        handleSubmit(false);
                      }}
                    >
                      Save & Draft
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        handleSubmit(true);
                      }}
                      type="submit"
                      variant="contained"
                      className="bg-[#cd5c3d] hover:bg-[#b8503a] normal-case"
                    >
                      Submit
                    </Button>
                  </>
                )}
              </Box>
            </SectionCard>
          </div>
        </Box>
      </form>
    </Box>
  );
}

function EditorCard({
  title,
  formData,
  handleChange,
  index,
  readOnlyTitle = false,
  readOnlyEditor = false,
  hint,
  tinted = false,
}) {
  return (
    <Box
      className={`rounded-2xl border col-span-2  ${
        tinted ? "border-blue-200 bg-blue-50/40" : "border-zinc-200 bg-white"
      } shadow-sm`}
    >
      <Box className="flex items-center justify-between gap-3 px-5 py-4">
        <div>
          <Typography variant="subtitle1" className="font-semibold">
            {title}
          </Typography>
          {hint ? (
            <Typography variant="body2" className="text-zinc-600">
              {hint}
            </Typography>
          ) : null}
        </div>
      </Box>
      <Divider />
      <Box className="p-5 space-y-6">
        <TextField
          fullWidth
          label="Post Title"
          value={formData.post_title}
          onChange={(e) => handleChange(index, "post_title", e.target.value)}
          placeholder="Enter the title"
          className="bg-white"
          InputProps={{ readOnly: readOnlyTitle }}
        />

        <div className="pt-2">
          <Typography variant="body2" className="py-2 font-medium">
            Content
          </Typography>
          <div className="overflow-hidden rounded-xl border border-zinc-200">
            <JoditEditor
              value={formData.post_content}
              config={{ ...EditorConfig, readonly: readOnlyEditor }}
              onBlur={(data) => handleChange(index, "post_content", data)}
            />
          </div>
        </div>
        {/* 
        <FormControl fullWidth>
          <InputLabel id={`translator-${index}`}>Translator</InputLabel>
          <Select
            labelId={`translator-${index}`}
            value={formData.post_author}
            label="Translator"
            onChange={(e) => handleChange(index, "post_author", e.target.value)}
            className="bg-white"
          >
            <MenuItem value="">Select Translator</MenuItem>
            <MenuItem value="Translation Team">Translation Team</MenuItem>
            <MenuItem value="Dr. Rajesh Savera">Dr. Rajesh Savera</MenuItem>
            <MenuItem value="Dr. Lim Siow Jin">Dr. Lim Siow Jin</MenuItem>
          </Select>
        </FormControl> */}
      </Box>
    </Box>
  );
}
