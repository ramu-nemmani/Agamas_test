import { useState } from "react";
import { auth } from "../../../firebase";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { useAuth } from "../../../context/AuthContext";

export default function ProfileSecurityTab() {
  const { user } = useAuth();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const currentUser = auth.currentUser || user;
  const isGoogleUser = currentUser?.providerData?.some(
    (p) => p.providerId === "google.com"
  );

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
        <h2 className="text-2xl font-normal text-[#001e2d] mb-1" style={{ fontFamily: '"PP Fragment Glare Regular", Georgia, serif' }}>Security</h2>
        <p className="text-sm text-slate-500" style={{ fontFamily: '"PP Fragment Glare Regular", Georgia, serif' }}>Manage your password.</p>
      </div>
      <div className="bg-white rounded-3xl border border-[#001e2d]/10 p-8 max-w-xl" style={{ fontFamily: 'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"' }}>
        {isGoogleUser ? (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <h3 className="text-[#001e2d] font-normal text-[20px]">Google Account</h3>
            </div>
            <p 
              className="text-[16px] leading-relaxed"
              style={{ color: "oklab(0.221459 -0.0272409 -0.0374657 / 0.8)" }}
            >
              Passwords are managed from your Google account. To reset your Google password, use Google account recovery.
            </p>
          </div>
        ) : (
          <>
            <h3 className="text-[#001e2d] font-normal mb-6 text-xl">Change Password</h3>
            
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
                  className="w-full text-base text-[#001e2d] border border-slate-200 rounded-xl focus:outline-none focus:border-[#cd5c3d] focus:ring-2 focus:ring-[#cd5c3d]/20 px-4 py-2.5 bg-transparent transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full text-base text-[#001e2d] border border-slate-200 rounded-xl focus:outline-none focus:border-[#cd5c3d] focus:ring-2 focus:ring-[#cd5c3d]/20 px-4 py-2.5 bg-transparent transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full text-base text-[#001e2d] border border-slate-200 rounded-xl focus:outline-none focus:border-[#cd5c3d] focus:ring-2 focus:ring-[#cd5c3d]/20 px-4 py-2.5 bg-transparent transition-all"
                  required
                />
              </div>
              <div className="pt-2">
                <button 
                  type="submit"
                  disabled={isUpdating}
                  className="px-6 py-2.5 text-white font-medium rounded-full text-sm disabled:opacity-50"
                  style={{ backgroundColor: 'rgb(205, 92, 61)', fontFamily: 'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"' }}
                >
                  {isUpdating ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
