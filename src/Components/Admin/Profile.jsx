import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  Button,
  Card,
  CardContent,
  FormControlLabel,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import {
  EmailAuthProvider,
  getAuth,
  reauthenticateWithCredential,
  updatePassword,
  updateProfile,
} from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { useState } from "react";
import { Link } from "react-router-dom";
import { db } from "../../firebase";

const Profile = () => {
  const auth = getAuth();
  const user = auth.currentUser;
  const [isChangePassword, setIsChangePassword] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.displayName,
    email: user?.email,
    oldPassword: "",
    newPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (!isChangePassword) {
      await updateUser();
      alert("Successfully updated");
      return;
    }

    if (formData.newPassword == formData.oldPassword) {
      alert("Old password and New password are Same");
      return;
    }
    if (formData.newPassword.length < 6) {
      alert("New password must be at least 6 characters long!");
      return;
    }
    try {
      if (!user) {
        return;
      }
      const credential = EmailAuthProvider.credential(
        user.email,
        formData.oldPassword
      );
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, formData.newPassword);
      alert("Successfully updated");
      await updateUser();
    } catch (error) {
      alert("Old password is incorrect!");
      console.error("Error updating password:", error);
    }
  };

  async function updateUser() {
    try {
      const user = auth.currentUser;
      const payload = {
        displayName: formData?.username,
      };
      const docRef = doc(db, "users", user.uid);
      await updateProfile(user, payload);
      await updateDoc(docRef, payload);
    } catch (error) {
      console.log("🚀 ~ createUser ~ error:", error);
    }
  }

  return (
    <div className="main-container bg-gray-100 p-4">
      <Link to={"/admin"} className="hover:text-blue-600 ">
        {" "}
        <ArrowBackIcon className="w-5 h-5" /> Go To DashBoard
      </Link>
      <div className="flex justify-center items-center h-[70vh]">
        <Card className="w-full max-w-md shadow-lg rounded-xl">
          <CardContent>
            <Typography variant="h5" className="text-center mb-6 font-semibold">
              Profile Settings
            </Typography>
            <form
              onSubmit={handlePasswordUpdate}
              className="flex flex-col gap-4"
            >
              <TextField
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                fullWidth
                required
              />
              <TextField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                fullWidth
                disabled
              />
              <FormControlLabel
                control={
                  <Switch
                    value={isChangePassword}
                    onChange={(e) => setIsChangePassword(e.target.checked)}
                  />
                }
                label="Change Password"
              />
              {isChangePassword && (
                <>
                  <TextField
                    label="Old Password"
                    name="oldPassword"
                    type="password"
                    value={formData.oldPassword}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                  <TextField
                    label="New Password"
                    name="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </>
              )}
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
              >
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
