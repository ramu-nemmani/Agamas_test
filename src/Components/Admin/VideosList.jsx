import CancelIcon from "@mui/icons-material/Cancel";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Grid,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import ToastMSG from "../UI/ToastMSG";

export default function VideoListPage({ lesson }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [openVideo, setOpenVideo] = useState(null); // video to play in modal
  const navigate = useNavigate();
  // Fetch all videos from Firestore
  useEffect(() => {
    async function fetchVideos() {
      try {
        setLoading(true);
        const snapshot = await getDocs(
          query(
            collection(db, "videos"),
            where("lessonId", "==", lesson.id),
            orderBy("position", "asc")
          )
        );
        const vids = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setVideos(vids);
      } catch (error) {
        console.log("🚀 ~ fetchVideos ~ error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchVideos();
  }, [lesson.id]);

  const handleChange = (id, key, value) => {
    setVideos((prev) =>
      prev.map((v) => (v.id === id ? { ...v, [key]: value } : v))
    );
  };

  const handleSave = async (video) => {
    try {
      const videoRef = doc(db, "videos", video.id);
      await updateDoc(videoRef, {
        title: video.title,
        position: Number(video.position),
        description: video.description,
      });
      setEditingId(null);
      ToastMSG("success", "✅ Video updated successfully!");
    } catch (error) {
      console.log("🚀 ~ handleSave ~ error:", error);
      ToastMSG("error", " Failed to update Video !");
    }
  };

  const handleCancel = (id, originalVideo) => {
    setVideos((prev) =>
      prev.map((v) => (v.id === id ? { ...originalVideo } : v))
    );
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure to delete this video?")) return;
    await deleteDoc(doc(db, "videos", id));
    setVideos((prev) => prev.filter((v) => v.id !== id));
  };

  const filterVideos = videos.filter((v) => {
    if (!searchTerm) {
      return true;
    }
    const title = v.title.toLowerCase().includes(searchTerm.toLowerCase());
    const desc = v.description.toLowerCase().includes(searchTerm.toLowerCase());
    return title || desc;
  });

  return (
    <Box className="max-w-7xl mx-auto py-6">
      <Typography variant="h4" fontWeight={700} mb={4} textAlign="center">
        Videos for Lesson: {lesson?.name}
      </Typography>

      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
        <TextField
          label="Search Video"
          placeholder="Search Video..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />

        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate(`/admin/videos/create?lesson=${lesson.id}`)}
          className="w-52 h-13  rounded-2xl"
        >
          Upload Videos
        </Button>
      </div>

      {loading ? (
        <Typography>Loading videos...</Typography>
      ) : videos.length === 0 ? (
        <Typography>No videos uploaded yet.</Typography>
      ) : (
        <div className="grid grid-cols-3 gap-4 ">
          {filterVideos.map((vid) => {
            const isEditing = editingId === vid.id;
            const originalVideo = { ...vid };

            return (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                key={vid.id}
                className="border rounded-md border-zinc-200 cursor-pointer overflow-hidden"
              >
                <div className="">
                  {/* Video Thumbnail */}
                  <Box
                    sx={{
                      position: "relative",
                      backgroundColor: "#000",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    onClick={() => setOpenVideo(vid.videoURL)}
                  >
                    <video src={vid.videoURL} className="aspect-video " />
                  </Box>
                  <div className="p-2">
                    {/* Edit Mode */}
                    {isEditing ? (
                      <>
                        <TextField
                          label="Title"
                          value={vid.title}
                          onChange={(e) =>
                            handleChange(vid.id, "title", e.target.value)
                          }
                          fullWidth
                          size="small"
                          sx={{ my: 1 }}
                        />
                        <TextField
                          label="Position"
                          type="number"
                          value={vid.position}
                          onChange={(e) =>
                            handleChange(vid.id, "position", e.target.value)
                          }
                          fullWidth
                          size="small"
                          sx={{ my: 1 }}
                        />
                        <TextField
                          label="Description"
                          value={vid.description || ""}
                          onChange={(e) =>
                            handleChange(vid.id, "description", e.target.value)
                          }
                          fullWidth
                          multiline
                          rows={3}
                          sx={{ my: 1 }}
                        />
                      </>
                    ) : (
                      <>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {vid.title}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Position: {vid.position}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {vid.description || "-"}
                        </Typography>
                      </>
                    )}

                    {/* Action Buttons */}
                    <Box mt={1} display="flex" justifyContent="space-between">
                      {isEditing ? (
                        <>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<SaveIcon />}
                            onClick={() => handleSave(vid)}
                          >
                            Save
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<CancelIcon />}
                            onClick={() => handleCancel(vid.id, originalVideo)}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<EditIcon />}
                            onClick={() => setEditingId(vid.id)}
                          >
                            Edit
                          </Button>
                          <IconButton onClick={() => handleDelete(vid.id)}>
                            <DeleteIcon color="error" />
                          </IconButton>
                        </>
                      )}
                    </Box>
                  </div>
                </div>
              </Grid>
            );
          })}
        </div>
      )}

      {/* Video Modal */}
      <Dialog
        open={!!openVideo}
        onClose={() => setOpenVideo(null)}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent sx={{ p: 0, backgroundColor: "#000" }}>
          <video
            src={openVideo}
            controls
            autoPlay
            style={{ width: "100%", height: "100%" }}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
}
