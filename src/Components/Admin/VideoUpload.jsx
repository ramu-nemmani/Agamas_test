import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Box,
  Button,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, storage } from "../../firebase";

const Input = styled("input")({
  display: "none",
});

export default function VideoUploadBulk({ lesson }) {
  const [videos, setVideos] = useState([]);
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const positionStartFrom = useRef(0);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const videoList = selectedFiles.map((file) => {
      const position = ++positionStartFrom.current;
      return {
        file,
        title: file.name.replace(/\.[^/.]+$/, ""),
        position,
        progress: 0,
        preview: URL.createObjectURL(file),
        uploaded: false,
      };
    });
    setVideos(videoList);
  };

  const handleChange = (index, key, value) => {
    setVideos((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [key]: value } : v))
    );
  };

  const handleUploadAll = async () => {
    if (!videos.length) return alert("Please select at least one video.");
    setUploading(true);
    try {
      for (let i = 0; i < videos.length; i++) {
        const vid = videos[i];
        const storageRef = ref(
          storage,
          `videos/${lesson.name}/${Date.now()}_${vid.file.name}`
        );
        const uploadTask = uploadBytesResumable(storageRef, vid.file);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            handleChange(i, "progress", progress);
          },
          (error) => console.error("Upload error:", error),
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            await addDoc(collection(db, "videos"), {
              title: vid.title,
              description,
              position: Number(vid.position),
              videoURL: downloadURL,
              createdAt: serverTimestamp(),
              lessonId: lesson.id,
            });
            handleChange(i, "uploaded", true);
          }
        );
      }
    } catch (error) {
      console.log("🚀 ~ handleUploadAll ~ error:", error);
    } finally {
      // setUploading(false);
    }
  };

  const handleRemove = (index) => {
    setVideos((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    async function fetchPositionVideoCount() {
      try {
        const snapshot = await getDocs(
          query(
            collection(db, "videos"),
            where("lessonId", "==", lesson.id),
            orderBy("position", "desc"),
            limit(1)
          )
        );
        positionStartFrom.current = snapshot.docs[0].data().position;
      } catch (error) {
        console.log("🚀 ~ fetchPositionVideoCount ~ error:", error);
      }
    }
    fetchPositionVideoCount();
  }, []);

  return (
    <div className="">
      <Box className="bg-white shadow-sm">
        <Box className="flex items-center gap-4 px-6 py-4 border-b border-gray-200">
          <Button
            variant="text"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/admin/videos?lesson=" + lesson.id)}
            className="text-gray-500 hover:text-red-500"
          >
            Back
          </Button>
          <Typography variant="h6" className="font-semibold text-gray-800">
            Bulk Video Upload
          </Typography>
        </Box>
      </Box>
      <div className="max-w-5xl mx-auto py-6">
        <Typography variant="h4" className="mb-6 font-bold text-gray-800">
          {lesson?.name}
        </Typography>

        <Divider sx={{ mb: 4 }} />

        <Box display="flex" flexDirection="column" gap={3}>
          {/* File selector */}
          <label htmlFor="video-upload">
            <Input
              accept="video/*"
              id="video-upload"
              type="file"
              multiple
              onChange={handleFileChange}
            />
            <Button
              variant="outlined"
              component="span"
              fullWidth
              sx={{
                py: 1.5,
                fontWeight: 600,
                borderRadius: 3,
                textTransform: "none",
                backgroundColor: "#fafafa",
                "&:hover": { backgroundColor: "#f0f0f0" },
              }}
            >
              {videos.length
                ? `${videos.length} videos selected`
                : "Select Videos"}
            </Button>
          </label>

          {/* Video cards */}
          {videos.length > 0 && (
            <Grid container spacing={4} sx={{ mt: 2 }}>
              {videos.map((vid, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Paper
                    elevation={3}
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      background: "#fff",
                      position: "relative",
                      transition: "transform 0.3s, box-shadow 0.3s",
                      "&:hover": {
                        transform: "translateY(-5px)",
                        boxShadow: "0 15px 35px rgba(0,0,0,0.1)",
                      },
                    }}
                  >
                    <video
                      src={vid.preview}
                      width="100%"
                      height="auto"
                      controls
                      style={{
                        borderRadius: "12px",
                        border: "1px solid #ddd",
                        marginBottom: "12px",
                        background: "#000",
                      }}
                    />

                    <TextField
                      label="Title"
                      value={vid.title}
                      onChange={(e) =>
                        handleChange(index, "title", e.target.value)
                      }
                      fullWidth
                      size="small"
                      sx={{ my: 2 }}
                    />

                    <TextField
                      label="Position"
                      type="text"
                      value={vid.position}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^\d*$/.test(value)) {
                          handleChange(index, "position", +value);
                        }
                      }}
                      fullWidth
                      size="small"
                      sx={{ mb: 2 }}
                    />

                    <TextField
                      label="Description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      fullWidth
                      multiline
                      rows={3}
                      sx={{ mb: 2 }}
                    />

                    <LinearProgress
                      variant="determinate"
                      value={vid.progress}
                      sx={{ height: 10, borderRadius: 3, mb: 1 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {vid.uploaded
                        ? "✅ Uploaded"
                        : `Progress: ${vid.progress.toFixed(1)}%`}
                    </Typography>
                    <div className="text-center">
                      <IconButton
                        onClick={() => handleRemove(index)}
                        sx={{
                          color: "#e53935",
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </div>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Upload all button */}
          {videos.length > 0 && !uploading && (
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleUploadAll}
              disabled={uploading}
              sx={{
                mt: 3,
                py: 1.5,
                fontWeight: 700,
                borderRadius: 3,
                textTransform: "none",
              }}
            >
              {uploading ? "Uploading..." : "Upload All Videos"}
            </Button>
          )}
        </Box>
      </div>
    </div>
  );
}
