import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { Box, Button, Container, TextField, Typography } from "@mui/material";
import axios from "axios";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useState } from "react";
import { Link } from "react-router-dom";
import Agamas from "../../../assets/logo2.webp";
import { useLoading } from "../../../context/LoadingContext";
import { auth, db, functions } from "../../../firebase";
import { httpsCallable } from "firebase/functions";
import ToastMSG from "../../UI/ToastMSG";
import AdminModel from "../AdminModel";

const Register = () => {
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    password: "",
  });
  const { setLoading } = useLoading();
  const [isModelOpen, setIsModelOpen] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    try {
      const isVerified = await verifyOtp();
      if (!isVerified) {
        return;
      }
      if (formData.password.length < 6) {
        alert("password must be at least 6 characters long!");
        return;
      }
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      const payload = {
        email: formData.email,
        displayName: formData.displayName,
        uid: user.uid,
        isAdmin: false,
      };
      const docRef = doc(db, "users", user.uid);
      await setDoc(docRef, payload);

      // Send activity email request to admin
      try {
        await axios.post("https://sendactivityemail-p76bkcj24q-uc.a.run.app", {
          email: formData.email,
          uid: user.uid,
        });
      } catch (err) {
        console.error("Failed to send activity email:", err);
      }

      // Send the verification email using the deployed cloud function
      try {
        const sendVerificationEmail = httpsCallable(functions, "sendVerificationEmailFn");
        const result = await sendVerificationEmail();
        if (result.data && result.data.error) {
          console.error("Cloud function returned an error:", result.data.error);
          console.error("Stack trace:", result.data.stack);
        }

        // Fallback to client-side Firebase Auth email when SES is not configured
        if (result.data && result.data.method === 'none' && !result.data.alreadyVerified) {
          console.warn("SES not configured or failed, falling back to Firebase client SDK");
          await sendEmailVerification(user);
        }
      } catch (emailError) {
        console.error("Failed to call verification email function:", emailError);
      }
      
      const { signOut } = await import("firebase/auth");
      await signOut(auth);

      setIsModelOpen(true);
      ToastMSG(
        "success",
        "Registration successful. Check your email to verify your account."
      );
    } catch (error) {
      ToastMSG("error", "Failed to Register. Please check your credentials.");
      console.error("Error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  async function sendOtp(e) {
    setLoading(true);
    e.preventDefault();
    try {
      if (!formData.email) {
        ToastMSG("error", "Please enter all required details.");
        return;
      }
      const response = await axios.post(
        "https://sendotp-p76bkcj24q-uc.a.run.app",
        { email: formData.email }
      );

      if (response.data.success) {
        ToastMSG("success", "OTP sent to your email.");
        setIsVerified(true);
      }
    } catch (error) {
      ToastMSG("error", "Failed to send OTP. Please try again.");
      console.log("🚀 ~ sendOtp ~ error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp() {
    try {
      if (!formData.otp) {
        ToastMSG("error", "Please enter OTP.");
        return;
      }
      const response = await axios.post(
        "https://verifyotp-p76bkcj24q-uc.a.run.app",
        { email: formData.email, otp: +formData.otp }
      );

      if (response.data.success) {
        ToastMSG("success", "OTP verified successfully");
        return true;
      }
      return false;
    } catch (error) {
      ToastMSG("error", "Failed to verify OTP.");
      console.log("🚀 ~ sendOtp ~ error:", error);
    }
  }

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
            Sign Up
          </Typography>
        </div>
        <form onSubmit={isVerified ? handleSubmit : sendOtp}>
          <TextField
            fullWidth
            label="UserName"
            variant="outlined"
            margin="normal"
            value={formData.displayName}
            autoComplete="username"
            onChange={(e) => {
              if (isVerified) {
                return;
              }
              setFormData((pre) => ({ ...pre, displayName: e.target.value }));
            }}
            required
          />
          <TextField
            fullWidth
            label="Email"
            variant="outlined"
            margin="normal"
            value={formData.email}
            autoComplete="email"
            onChange={(e) => {
              if (isVerified) {
                return;
              }
              setFormData((pre) => ({ ...pre, email: e.target.value }));
            }}
            required
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            variant="outlined"
            margin="normal"
            autoComplete="current-password"
            value={formData.password}
            onChange={(e) => {
              if (isVerified) {
                return;
              }
              setFormData((pre) => ({ ...pre, password: e.target.value }));
            }}
            required
          />
          {isVerified && (
            <TextField
              fullWidth
              label="otp"
              type="text"
              variant="outlined"
              margin="normal"
              value={formData.otp}
              onChange={(e) => {
                setFormData((pre) => ({ ...pre, otp: e.target.value }));
              }}
              required
            />
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className="mt-4"
          >
            {!isVerified ? "Send verification Code" : "Sign Up"}
          </Button>
        </form>
        <div className="mt-4">
          Already have an account{" "}
          <Link to="/admin/login" className="text-blue-500">
            Sign In here
          </Link>
        </div>
      </Box>
      {isModelOpen && <AdminModel />}
    </Container>
  );
};

export default Register;
