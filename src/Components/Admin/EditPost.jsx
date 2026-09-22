import { doc, updateDoc } from "firebase/firestore";
import JoditEditor from "jodit-react";
import { useState } from "react";
import { useLoading } from "../../context/LoadingContext";
import { db } from "../../firebase";
import EditorConfig from "../../utils/EditorConfig";
import ToastMSG from "../UI/ToastMSG";

export default function EditPost({ chapters, postData, setClose, updatePost }) {
  const { setLoading } = useLoading();
  const [formData, setFormData] = useState({
    chapterId: postData.chapterId,
    position: +postData.position,
    language: postData.language,
    post_author: postData.post_author,
    post_content: postData.post_content,
    post_date: postData.post_date,
    post_name: postData.post_name,
    post_title: postData.post_title,
  });

  const handleChange = (name, value) => {
    setFormData((pre) => ({ ...pre, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const isExist = chapters.find((c) => c.id == formData.chapterId)
        ?.postsOrders?.[formData.position]?.[formData.language];
      if (
        isExist &&
        (postData.position != formData.position ||
          postData.chapterId != formData.chapterId)
      ) {
        ToastMSG("error", "Post already exists in this position");
        return;
      }
      await updateDoc(doc(db, "posts", postData.id), formData);
      if (
        postData.position != formData.position ||
        postData.chapterId != formData.chapterId
      ) {
        if (postData?.chapterId) {
          const updateChapterPOs = chapters.find(
            (c) => c.id == postData.chapterId
          )?.postsOrders;

          updateChapterPOs[postData.position][postData.language] = "";
          await updateDoc(doc(db, "chapters", postData.chapterId), {
            postsOrders: updateChapterPOs,
          });
        }
        const updateChapterPOs = chapters.find(
          (c) => c.id == formData.chapterId
        )?.postsOrders;
        if (!updateChapterPOs?.[formData.position]) {
          updateChapterPOs[formData.position] = {
            [formData.language]: postData.id,
          };
        } else {
          updateChapterPOs[formData.position][formData.language] = postData.id;
        }
        await updateDoc(doc(db, "chapters", formData.chapterId), {
          postsOrders: updateChapterPOs,
        });
      }
      ToastMSG("success", "Successfully updated post");
      updatePost({ ...postData, ...formData });
      setClose();
    } catch (error) {
      ToastMSG("error", "Failed to updated post");
      console.log("🚀 ~ handleSubmit ~ error:", error);
    } finally {
      setLoading(false);
    }
  };
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
    //defaultActionOnPaste: "insert_clear_html",
    buttons: buttons,
    uploader: {
      insertImageAsBase64URI: false,
    },
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center  bg-opacity-30 z-9 ">
      <div className="bg-white w-3/4   border border-gray-200 rounded-lg h-[88vh] mt-10  overflow-y-auto">
        <div className="flex  items-center justify-between  px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Edit Post</h2>
          <button
            onClick={() => setClose(false)}
            className="text-gray-500 hover:text-red-500 text-3xl cursor-pointer"
          >
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className=" p-4 flex  justify-between  ">
            <div className="w-full px-4">
              <label htmlFor="content" className="block font-medium mb-1">
                Content
              </label>
              <JoditEditor
                value={formData.post_content}
                config={EditorConfig}
                onBlur={(data) => {
                  handleChange("post_content", data);
                }}
              />
            </div>
            <div className="w-[40%] sticky top-0 bg-white px-4 py-6 border-r border-gray-200 h-full">
              <div className="w-full">
                <label htmlFor="category" className="block font-medium mb-1">
                  Category
                </label>
                <select
                  name="category"
                  id="category"
                  value={formData?.chapterId}
                  onChange={(e) => {
                    const selectedChapter = chapters.find(
                      (c) => c.id == e.target.value
                    );
                    setFormData((pre) => ({
                      ...pre,
                      position:
                        (Object.keys(selectedChapter?.postsOrders)?.length ||
                          0) + 1,
                      chapterId: e.target.value,
                    }));
                  }}
                  required
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#3d6bcd] outline-none"
                >
                  <option value="">Select Category</option>
                  {chapters.map((c) => (
                    <option value={c.id} key={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="">
                <label htmlFor="category" className="block font-medium mb-1">
                  Position{" "}
                </label>
                <div className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg ">
                  {formData?.position}
                </div>
                {/* <input
                  type="number"
                  required
                  placeholder="Enter the Position..."
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#3d6bcd] outline-none"
                  value={formData?.position}
                  onChange={(e) => {
                    setFormData((pre) => ({
                      ...pre,
                      position: +e.target.value,
                    }));
                  }}
                /> */}
              </div>
              {/* <div className="mb-4">
                <label htmlFor="post_name" className="block font-medium mb-1">
                  Post Name
                </label>
                <input
                  type="text"
                  name="post_name"
                  id="post_name"
                  value={formData.post_name}
                  onChange={(e) => handleChange("post_name", e.target.value)}
                  required
                  placeholder="Enter the post name of the text"
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#3d6bcd] outline-none"
                />
              </div> */}
              <div className="mb-4">
                <label htmlFor="post_title" className="block font-medium mb-1">
                  Post Title
                </label>
                <input
                  type="text"
                  name="post_title"
                  id="post_title"
                  value={formData.post_title}
                  onChange={(e) => handleChange("post_title", e.target.value)}
                  required
                  placeholder="Enter the title of the text"
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#3d6bcd] outline-none"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="language" className="block font-medium mb-1">
                  Language
                </label>
                <select
                  name="language"
                  id="language"
                  value={formData.language}
                  required
                  onChange={(e) => handleChange("language", e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#3d6bcd] outline-none"
                >
                  <option value="chineseToEnglish">Chinese to English</option>
                  <option value="chinese">Chinese</option>
                  <option value="english">English</option>
                </select>
              </div>
              <div>
                <label htmlFor="translator" className="block font-medium mb-1">
                  Translator
                </label>
                <select
                  name="post_author"
                  id="translator"
                  value={formData.post_author}
                  onChange={(e) => handleChange("post_author", e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#3d6bcd] outline-none"
                >
                  <option value="">Select Translator</option>
                  <option value="Translation Team">Translation Team</option>
                  <option value="Dr. Rajesh Savera">Dr. Rajesh Savera</option>
                  <option value="Dr. Lim Siow Jin">Dr. Lim Siow Jin</option>
                </select>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 border-t border-gray-200 px-6  bg-white py-2 sticky bottom-0">
            <button
              type="button"
              onClick={() => setClose(false)}
              className="px-5 py-2 bg-gray-200 rounded hover:bg-gray-300 text-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#cd5c3d] text-white rounded hover:bg-[#b8503a]"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
