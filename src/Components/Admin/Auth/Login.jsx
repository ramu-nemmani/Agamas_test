import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { Box, Button, Container, TextField, Typography } from "@mui/material";
import axios from "axios";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLoading } from "../../../context/LoadingContext";
import { auth, db } from "../../../firebase";
import Agamas from "../../../assets/logo.webp";
import ToastMSG from "../../UI/ToastMSG";
import AdminModal from "../AdminModel";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isModelOpen, setIsModelOpen] = useState(false);
  const navigate = useNavigate();
  const { setLoading } = useLoading();

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      const userDetails = (await getDoc(doc(db, "users", user.uid))).data();
      if (!userDetails.isAdmin) {
        try {
          await axios.post("https://sendactivityemail-p76bkcj24q-uc.a.run.app", {
            email: email,
            uid: user.uid,
          });
        } catch (err) {
          console.error("Failed to send activity email:", err);
        }
        setIsModelOpen(true);
        return;
      }
      localStorage.setItem(
        "user",
        JSON.stringify({
          accessToken: user.accessToken,
          ...userDetails,
          fromType: "theAgamas",
        })
      );
      ToastMSG("success", "Logged in successfully");
      navigate("/admin/post");
    } catch (error) {
      ToastMSG("error", "Failed to log in. Please check your credentials.");
      console.error("Error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      maxWidth="sm"
      className="flex items-center justify-center min-h-screen"
    >
      <Box className="bg-white p-8 rounded-lg shadow-lg w-full">
        <div className="text-center mb-6">
          <div className="flex justify-center py-2">
            <img src={Agamas} alt="The Agamas" width={200} />
          </div>

          <LockOutlinedIcon className="text-blue-500 text-6xl" />
          <Typography variant="h5" className="mt-2">
            Sign In
          </Typography>
        </div>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            variant="outlined"
            margin="normal"
            value={email}
            autoComplete="email"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            variant="outlined"
            margin="normal"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className="mt-4"
          >
            Sign In
          </Button>
        </form>

        <div className="mt-4 flex justify-between items-center">
          <div>
            Don't have an account?{" "}
            <Link to="/admin/register" className="text-blue-500">
              Register here
            </Link>
          </div>
          <div>
            <Link to="/admin/forgotPassword" className="text-blue-500">
              Forgot Password?
            </Link>
          </div>
        </div>
      </Box>
      {isModelOpen && <AdminModal />}
    </Container>
  );
};

export default LoginPage;
