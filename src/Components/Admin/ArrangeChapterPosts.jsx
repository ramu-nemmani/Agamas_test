import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../firebase";

const ArrangeChapterPosts = () => {
  const [search, setSearch] = useState("#");
  const [chapters, setChapters] = useState([]);
  const [posts, setPosts] = useState([]);

  async function handleSavePost() {
    try {
      console.log("===>post", posts);
      for (const post of posts) {
        await updateDoc(doc(db, "posts", post.id), {
          position: post.position,
        });
      }

      alert("successfully updated the Posts");
    } catch (error) {
      console.log("🚀 ~ handleSavePost ~ error:", error);
    }
  }
  async function handleSaveChapter() {
    console.log("->submiteded");

    try {
      const postsOrders = {};
      const selectedChapter = chapters.find((c) => c.id == search);
      posts.forEach((post) => {
        const posKey = post.position;
        if (!postsOrders[posKey]) {
          postsOrders[posKey] = {};
        }
        postsOrders[posKey][post.language] = post.id;
      });
      await updateDoc(doc(db, "chapters", search), {
        postsOrders,
        position: selectedChapter.position,
      });
      console.log(postsOrders, search);
      alert("successfully updated the chapters");
    } catch (error) {
      console.log("🚀 ~ handleSavePost ~ error:", error);
    }
  }

  const fetchChapters = async () => {
    try {
      const q = query(collection(db, "chapters"), orderBy("term_id"));
      const snapshot = await getDocs(q);
      const chaptersData = await Promise.all(
        snapshot.docs.map(async (doc, index) => {
          const data = doc.data();
          // await fetchPosts(doc.id, data.name);
          return {
            id: doc.id,
            name: data.name,
            position: index + 1,
            postsOrders: {},
          };
        })
      );
      setChapters(chaptersData);
    } catch (error) {
      console.log("🚀 ~ fetchChapters ~ error:", error);
    }
  };

  const fetchPosts = async (chapterId, chapterName) => {
    try {
      const postQuery = query(
        collection(db, "posts"),
        where("chapterId", "==", chapterId),
        orderBy("ID")
      );
      const positions = {
        eng: 1,
        cn: 1,
        cnEn: 1,
      };
      const snapshot = await getDocs(postQuery);
      const postsList = snapshot.docs.map((doc) => {
        const data = doc.data();
        let position = 1;

        if (data.language == "english") {
          position = positions.eng;
          positions.eng++;
        } else if (data.language == "chinese") {
          position = positions.cn;
          positions.cn++;
        } else {
          position = positions.cnEn;
          positions.cnEn++;
        }
        return {
          id: doc.id,
          chapterId,
          chapterName,
          postTitle: data.post_title,
          language: data.language,
          position: data?.position || position,
        };
      });
      console.log("🚀 ~ postsList ~ postsList:", postsList);
      setPosts(postsList);
    } catch (error) {
      console.log("🚀 ~ fetchPosts ~ error:", error);
    }
  };

  useEffect(() => {
    fetchChapters();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Chapter-wise Posts Table</h1>

      <div className="mb-4 flex justify-between items-center">
        <div className=" flex gap-4 items-center">
          <label>Filter By Chapters: </label>
          <select
            className="border px-3 py-2 rounded"
            value={search}
            onChange={async (e) => {
              setSearch(e.target.value);
              const selectedChapter = chapters.find(
                (c) => c.id == e.target.value
              );
              await fetchPosts(selectedChapter.id, selectedChapter.name);
            }}
          >
            <option value={""}>select chapter</option>
            {chapters.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-4">
          <button
            className="px-3 py-2 rounded-lg bg-blue-600 text-white"
            onClick={handleSaveChapter}
          >
            save chapter
          </button>
          <button
            className="px-3 py-2 rounded-lg bg-green-600 text-white"
            onClick={handleSavePost}
          >
            save post
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2">S.No</th>
              <th className="border px-4 py-2">categories</th>
              <th className="border px-4 py-2">Post</th>
              <th className="border px-4 py-2">language</th>
              <th className="border px-4 py-2">orderNo</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((item, index) => (
              <tr key={item.id} className="hover:bg-yellow-300">
                <td className="border px-4 py-2 w-10 ">{index}</td>
                <td className="border px-4 py-2 w-[800px]">
                  <>{item.chapterName}</>
                </td>

                <td className="border px-4 py-2 ">{item.postTitle}</td>
                <td className="border px-4 py-2 ">{item.language}</td>
                <td className="border text-center ">
                  <input
                    type="text"
                    className=" border w-18 px-4 py-1 text-center"
                    value={item?.position}
                    onChange={(e) => {
                      const { value } = e.target;
                      setPosts((pre) =>
                        pre.map((p) => {
                          if (p.id == item.id) {
                            p.position = +value;
                          }
                          return p;
                        })
                      );
                    }}
                  />
                </td>
              </tr>
            ))}

            {posts.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  className="text-center py-4 text-gray-500 border"
                >
                  No posts found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ArrangeChapterPosts;
