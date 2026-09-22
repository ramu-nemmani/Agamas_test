import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import {
  Box,
  Button,
  Card,
  CardContent,
  Modal,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguages } from "../../context/LanguageContext";
import { db } from "../../firebase";

export default function AdminCategories({
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

  const handleDelete = async (id) => {
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

  const shortCodes = languages.map((lang) => lang.shortForm || lang.shortForm);
  useEffect(() => {
    if (!lesson?.id) {
      navigate("/admin");
    }
  }, [lesson]);

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
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
            fullWidth
            // variant="outlined"
            label="Search Chapter"
            placeholder="Search chapter..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="sm:w-2/3"
          />

          <Button
            variant="contained"
            color="primary"
            onClick={() => setShowModal(true)}
            className="w-40 h-13  rounded-2xl"
          >
            Add Chapter
          </Button>
        </div>

        <TableContainer component={Paper} className="shadow-lg rounded-xl">
          <Table>
            <TableHead>
              <TableRow className="bg-gray-200">
                <TableCell align="center" className="font-bold text-lg">
                  S.No
                </TableCell>
                <TableCell className="font-bold text-lg">Name</TableCell>
                <TableCell align="center" className="font-bold text-lg w-52">
                  Posts
                  <Typography
                    variant="caption"
                    display="block"
                    className="text-base"
                  >
                    {shortCodes.join(" / ")}
                  </Typography>
                </TableCell>
                <TableCell align="center" className="font-bold text-lg">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredChapters.map((chapter, index) => (
                <TableRow
                  key={chapter.id}
                  className="hover:bg-orange-50 transition cursor-pointer"
                  onClick={() => {
                    if (editedData.id === chapter.id) {
                      return;
                    }
                    navigate(
                      "/admin/addPost?lesson=" +
                        lesson.id +
                        "&chapter=" +
                        chapter.id
                    );
                  }}
                >
                  <TableCell align="center" className="text-lg">
                    {index + 1}
                  </TableCell>
                  <TableCell className="text-lg">
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
                  </TableCell>
                  <TableCell align="center" className="text-lg">
                    {languages.map(({ id }, idx) => (
                      <span key={id}>
                        {chapter?.counts?.[id] || 0}
                        {idx < languages.length - 1 && " / "}
                      </span>
                    ))}
                  </TableCell>
                  <TableCell align="center">
                    {editedData.id === chapter.id ? (
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="outlined"
                          color="success"
                          size="small"
                          onClick={handleSave}
                          className="rounded-2xl text-base"
                        >
                          Save
                        </Button>
                        <Button
                          variant="outlined"
                          color="secondary"
                          size="small"
                          onClick={() => setEditedData({})}
                          className="rounded-2xl text-base"
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(chapter);
                          }}
                          className="rounded-2xl text-base"
                        >
                          <EditNoteRoundedIcon />
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(chapter.id);
                          }}
                          className="rounded-2xl text-base"
                        >
                          <DeleteOutlineRoundedIcon />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filteredChapters.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    align="center"
                    className="py-4 text-lg"
                  >
                    <Typography color="textSecondary">
                      No chapters found.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

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
  );
}
