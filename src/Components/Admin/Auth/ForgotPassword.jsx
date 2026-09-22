import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { Box, Button, Container, TextField, Typography } from "@mui/material";
import { sendPasswordResetEmail } from "firebase/auth";
import { useState } from "react";
import { Link } from "react-router-dom";
import Agamas from "../../../assets/logo2.webp";
import { useLoading } from "../../../context/LoadingContext";
import { auth } from "../../../firebase";
import ToastMSG from "../../UI/ToastMSG";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSend, setIsSend] = useState(false);
  const { setLoading } = useLoading();

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    try {
      if (!email) {
        ToastMSG("error", "Please enter Email Id.");
        return;
      }
      await sendPasswordResetEmail(auth, email);
      setIsSend(true);
      ToastMSG("success", "Email as send Successfully");
    } catch (error) {
      ToastMSG("error", "Failed to send Email");
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
            Forgot Password
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
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            required
          />
          {isSend && (
            <div className="text-red-600">
              * If you do not find the Mail in your inbox Please check in spam
              folder
            </div>
          )}
          {!isSend && (
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className="mt-4"
            >
              Send Reset Link
            </Button>
          )}
        </form>

        <div className="mt-4 flex justify-between items-center">
          <div>
            <Link to="/admin/login" className="text-blue-500">
              Back to Login
            </Link>
          </div>
        </div>
      </Box>
    </Container>
  );
};

export default ForgotPassword;
