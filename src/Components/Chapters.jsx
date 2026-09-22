import { collection, doc, getDocs, query, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase";

function Chapters() {
  const [chapters, setChapters] = useState([]);

  const fetchChapters = async () => {
    const q = query(collection(db, "chapters"));
    const snapshot = await getDocs(q);
    const chaptersData = snapshot.docs.map((doc) => {
      return {
        id: doc.id,
        ...doc.data(),
      };
    });
    const sortedData = chaptersData.sort(
      (a, b) => Number(a.term_id) - Number(b.term_id)
    );

    setChapters(sortedData);
  };

  useEffect(() => {
    fetchChapters();
  }, []);

  const [editedData, setEditedData] = useState({});

  const handleEditClick = (chapter) => {
    setEditedData({ ...chapter });
  };

  const handleChange = (e) => {
    setEditedData({ ...editedData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const ref = doc(db, "chapters", editedData.id);
      await updateDoc(ref, editedData);
      setEditedData({});
    } catch (error) {
      console.log("🚀 ~ handleSave ~ error:", error);
    }
  };

  // State for search filter
  const [searchTerm, setSearchTerm] = useState("");

  // Filter chapters based on search term (case-insensitive)
  const filteredChapters = chapters.filter((chapter) =>
    chapter.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen px-52 bg-gray-50">
      <div className="w-auto mx-auto p-24">
        <h2 className="text-xl font-bold mb-4">Chapter List</h2>
        <div className="mb-4 flex items-center gap-2">
          <label htmlFor="chapter-search" className="font-medium">
            Search:
          </label>
          <input
            className="border px-2 py-1 rounded w-1/2"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <table className="w-full bg-white border rounded shadow ">
          <thead>
            <tr className="bg-gray-200 text-left text-sm">
              <th className="text-center">S.No</th>
              <th className="py-2 px-4">Name</th>
              <th className="py-2 px-4">term_id</th>
              <th className="py-2 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredChapters.map((chapter, index) => (
              <tr key={chapter.id} className="border-t hover:bg-gray-50">
                <td className="text-center">{index + 1}</td>
                <td className="py-2 px-4">
                  {editedData?.id === chapter.id ? (
                    <input
                      type="text"
                      name="name"
                      value={editedData.name}
                      onChange={handleChange}
                      className="border px-2 py-1 rounded w-full"
                    />
                  ) : (
                    chapter.name
                  )}
                </td>
                <td className="text-center">{chapter.term_id}</td>
                <td className="py-2 px-4">
                  {editedData?.id === chapter.id ? (
                    <button
                      onClick={handleSave}
                      className="text-green-600 hover:bg-green-600 hover:text-white border px-3 rounded-2xl cursor-pointer "
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEditClick(chapter)}
                      className="text-blue-600 hover:bg-blue-600 hover:text-white border px-3 rounded-2xl cursor-pointer "
                    >
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Chapters;
