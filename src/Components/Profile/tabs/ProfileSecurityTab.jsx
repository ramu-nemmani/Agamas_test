import { useState } from "react";
import { auth } from "../../../firebase";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";

export default function ProfileSecurityTab() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword) {
      setMessage({ type: "error", text: "Please enter your current password." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match." });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "Password should be at least 6 characters." });
      return;
    }

    setIsUpdating(true);
    setMessage({ type: "", text: "" });

    try {
      if (auth.currentUser) {
        // Re-authenticate user first
        const credential = EmailAuthProvider.credential(auth.currentUser.email, oldPassword);
        await reauthenticateWithCredential(auth.currentUser, credential);
        
        // If successful, update password
        await updatePassword(auth.currentUser, newPassword);
        
        setMessage({ type: "success", text: "Password updated successfully!" });
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      console.error(err);
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
        setMessage({ type: "error", text: "Incorrect current password." });
      } else if (err.code === "auth/requires-recent-login") {
        setMessage({ type: "error", text: "Security requirement: Please log out and log back in to change your password." });
      } else {
        setMessage({ type: "error", text: "Failed to update password. Please try again." });
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <h2 className="text-2xl font-serif font-normal text-[#001e2d] mb-1">Security</h2>
        <p className="text-sm text-slate-500">Manage your password.</p>
      </div>
      <div className="bg-white rounded-3xl border border-[#001e2d]/10 p-8 max-w-xl">
        <h3 className="text-[#001e2d] font-semibold mb-6">Change Password</h3>
        
        {message.text && (
          <div className={`p-3 rounded-xl text-sm mb-6 border font-medium ${message.type === 'error' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-600 border-green-200'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-1">Current Password</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full text-base font-medium text-[#001e2d]/80 border border-amber-200 rounded-xl focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none px-4 py-2 bg-transparent transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full text-base font-medium text-[#001e2d]/80 border border-amber-200 rounded-xl focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none px-4 py-2 bg-transparent transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full text-base font-medium text-[#001e2d]/80 border border-amber-200 rounded-xl focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none px-4 py-2 bg-transparent transition-all"
              required
            />
          </div>
          <div className="pt-2">
            <button 
              type="submit"
              disabled={isUpdating}
              className="px-6 py-2.5 bg-amber-600 text-white font-semibold rounded-full hover:bg-amber-700 transition-colors text-sm disabled:opacity-50"
            >
              {isUpdating ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
