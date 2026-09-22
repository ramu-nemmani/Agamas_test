import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import {
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase";
function AdminLessons({ lessons, setLessons }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "" });

  const navigate = useNavigate();
  const handleSave = async () => {
    if (!formData.name.trim()) return;
    try {
      if (editId) {
        const docRef = doc(db, "lessons", editId);
        await updateDoc(docRef, formData);
        setLessons((prev) =>
          prev.map((l) => (l.id === editId ? { ...l, ...formData } : l))
        );
        setEditId(null);
      } else {
        const payload = {
          name: formData.name.trim(),
          description: formData.description.trim(),
          createdAt: Timestamp.now(),
          position: lessons.length + 1,
        };
        const ref = await addDoc(collection(db, "lessons"), payload);
        setLessons([...lessons, { id: ref.id, ...payload }]);
      }
      setFormData({ name: "", description: "" });
      setOpen(false);
    } catch (error) {
      console.error("Save failed:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this lesson?")) return;
    try {
      await deleteDoc(doc(db, "lessons", id));
      let removedLesson = {};
      const filterData = lessons.filter((lesson) => {
        if (lesson.id !== id) {
          removedLesson = lesson;
          return true;
        }
        return false;
      });
      setLessons(filterData);
      await addDoc(collection(db, "recycleBin"), {
        ...removedLesson,
        type: "lesson",
        deletedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}{" "}
        <Typography variant="h4" className="mb-6 font-bold text-gray-800">
          Categories
        </Typography>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 my-6">
          <TextField
            fullWidth
            variant="outlined"
            label="Search Lessons"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-1/2 bg-white rounded-lg"
          />
          <Button
            variant="contained"
            onClick={() => {
              setEditId(null);
              setFormData({ name: "", description: "" });
              setOpen(true);
            }}
            className="w-52 h-13  rounded-full shadow-md"
          >
            + Add Category
          </Button>
        </div>
        {/* Lessons Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {lessons
            .filter((lesson) =>
              lesson.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map(({ id, name, description }) => (
              <Card
                key={id}
                className="rounded-2xl   hover:border-gray-200 transition-all duration-300 cursor-pointer border border-gray-100 "
                onClick={() => {
                  navigate(`chapters?lesson=${id}`);
                }}
              >
                <CardContent className="flex flex-col justify-between h-full space-y-2  ">
                  <div>
                    <Typography
                      variant="h6"
                      className="font-semibold text-gray-900 line-clamp-1"
                    >
                      {name}
                    </Typography>
                    <Typography
                      variant="body2"
                      className="text-gray-600 leading-relaxed line-clamp-3"
                    >
                      {description}
                    </Typography>
                  </div>

                  <div className="flex justify-end border-t  border-gray-100 space-x-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditId(id);
                        setFormData({ name, description });
                        setOpen(true);
                      }}
                    >
                      <EditNoteRoundedIcon className="text-gray-600 hover:text-blue-500 " />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(id);
                      }}
                    >
                      <DeleteOutlineRoundedIcon className="text-gray-600 hover:text-red-500" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
        {/* Modal Dialog */}
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          fullWidth
          maxWidth="lg"
        >
          <DialogTitle className="font-semibold">
            {editId ? "Update Lesson" : "Add Lesson"}
          </DialogTitle>
          <DialogContent className="space-y-4  ">
            <div className=""></div>
            <TextField
              fullWidth
              label="Lesson Name"
              variant="outlined"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
            />
            <div className=""></div>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Description"
              variant="outlined"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />
          </DialogContent>

          <DialogActions>
            <Button
              onClick={() => {
                setEditId(null);
                setOpen(false);
                setFormData({ name: "", description: "" });
              }}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              className="rounded-full"
            >
              {editId ? "Save Changes" : "Add Lesson"}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
}

export default AdminLessons;
