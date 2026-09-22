import { useState } from "react";
import { auth, db, storage } from "../../../firebase";
import {
  deleteUser,
  reauthenticateWithPopup,
  reauthenticateWithCredential,
  GoogleAuthProvider,
  EmailAuthProvider
} from "firebase/auth";
import { doc, deleteDoc, collection, query, where, getDocs } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { Trash2, AlertTriangle, X, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

export default function ProfileDeleteTab() {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Re-authentication state
  const [requiresPasswordAuth, setRequiresPasswordAuth] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { logout } = useAuth();

  const handleReauthAndDelete = async () => {
    if (!auth.currentUser || !auth.currentUser.email) return;

    setIsLoading(true);
    setError(null);
    try {
      const credential = EmailAuthProvider.credential(auth.currentUser.email, password);
      await reauthenticateWithCredential(auth.currentUser, credential);
      setRequiresPasswordAuth(false);
      await performDeletion();
    } catch (err) {
      console.error(err);
      if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        setError("Incorrect password.");
      } else {
        setError("Failed to verify identity. Please try again.");
      }
      setIsLoading(false);
    }
  };

  const performDeletion = async () => {
    if (!auth.currentUser) return;

    const uid = auth.currentUser.uid;

    // 1. Delete downloads associated with the user
    const downloadsQuery = query(collection(db, "downloads"), where("userId", "==", uid));
    const downloadsSnapshot = await getDocs(downloadsQuery);
    const downloadDeletePromises = downloadsSnapshot.docs.map(downloadDoc =>
      deleteDoc(doc(db, "downloads", downloadDoc.id))
    );
    await Promise.all(downloadDeletePromises);

    // 2. Delete reading progress subcollection
    const progressQuery = query(collection(db, "users", uid, "readingProgress"));
    const progressSnapshot = await getDocs(progressQuery);
    const progressDeletePromises = progressSnapshot.docs.map(progressDoc =>
      deleteDoc(doc(db, "users", uid, "readingProgress", progressDoc.id))
    );
    await Promise.all(progressDeletePromises);

    // 3. Delete user document
    await deleteDoc(doc(db, "users", uid));

    // 4. Delete profile picture from storage
    if (auth.currentUser.photoURL && auth.currentUser.photoURL.includes('firebasestorage')) {
      try {
        const imageRef = ref(storage, `users/${uid}/profile.jpg`);
        await deleteObject(imageRef);
      } catch (storageErr) {
        // Ignore if the file doesn't exist
        if (storageErr.code !== 'storage/object-not-found') {
          console.error("Failed to delete profile picture:", storageErr);
        }
      }
    }

    // 5. Delete the authentication user
    await deleteUser(auth.currentUser);

    window.location.href = "/";
  };

  const handleDeleteAccount = async () => {
    if (!auth.currentUser) return;

    setIsLoading(true);
    setError(null);
    try {
      await performDeletion();
    } catch (err) {
      console.error(err);
      if (err.code === "auth/requires-recent-login") {
        const providerId = auth.currentUser.providerData[0]?.providerId;

        if (providerId === "google.com") {
          try {
            const provider = new GoogleAuthProvider();
            await reauthenticateWithPopup(auth.currentUser, provider);
            await performDeletion();
          } catch (reauthErr) {
            console.error(reauthErr);
            setError("Google verification failed. Please try again.");
            setIsLoading(false);
          }
        } else if (providerId === "password") {
          setRequiresPasswordAuth(true);
          setError("For security, please enter your password to confirm deletion.");
          setIsLoading(false);
        } else {
          setError("For security, you must log in again to delete your account.");
          await logout();
          setIsLoading(false);
          setIsConfirming(false);
        }
      } else {
        setError("Failed to delete account. Please try again.");
        setIsLoading(false);
        setIsConfirming(false);
      }
    }
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-2xl">
      <div className="mb-8">
        <h2 className="text-2xl font-serif text-red-600 mb-2">Delete Account</h2>
        <p className="text-[#001e2d]/70 text-sm">Permanently delete your account and all associated data.</p>
      </div>

      <div className="bg-red-50/50 rounded-3xl border border-red-100 p-6 sm:p-8">
        {error && !requiresPasswordAuth && (
          <div className="mb-6 p-3 text-sm text-red-700 bg-red-100 border border-red-200 rounded-xl">
            {error}
          </div>
        )}

        <div className="flex items-start gap-4">
          <div className="mt-1 bg-red-100 p-2 rounded-full text-red-600">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-red-900 mb-2">Warning: This action is irreversible.</h3>
            <p className="text-sm text-red-700/80 mb-6 leading-relaxed">
              Deleting your account will permanently erase your profile, reading progress, downloaded sutras, and authentication details. You will be able to sign up again with the same email as a new user, but your old data cannot be recovered.
            </p>

            <button
              onClick={() => setIsConfirming(true)}
              className="px-5 py-2.5 rounded-full bg-red-100 text-red-600 text-sm font-semibold hover:bg-red-200 transition-colors"
            >
              Delete My Account
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isConfirming && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 max-w-sm w-full relative"
            >
              <button
                onClick={() => {
                  setIsConfirming(false);
                  setRequiresPasswordAuth(false);
                  setError(null);
                }}
                disabled={isLoading}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center text-center">
                <div className="bg-red-100 p-4 rounded-full text-red-600 mb-4">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Account?</h3>
                <p className="text-slate-500 text-sm mb-6">
                  This action cannot be undone. All your data will be permanently lost. Are you absolutely sure?
                </p>

                {requiresPasswordAuth ? (
                  <div className="w-full flex flex-col gap-3">
                    {error && (
                      <div className="p-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg text-left">
                        {error}
                      </div>
                    )}
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-10 text-sm text-slate-900 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <button
                      onClick={handleReauthAndDelete}
                      disabled={isLoading || !password}
                      className="w-full py-3 rounded-full bg-red-600 text-white font-medium hover:bg-red-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                    >
                      {isLoading ? "Verifying..." : "Verify & Delete"}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col w-full gap-3">
                    <button
                      onClick={handleDeleteAccount}
                      disabled={isLoading}
                      className="w-full py-3 rounded-full bg-red-600 text-white font-medium hover:bg-red-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isLoading ? "Deleting..." : "Yes, Delete Account"}
                    </button>
                    <button
                      onClick={() => setIsConfirming(false)}
                      disabled={isLoading}
                      className="w-full py-3 rounded-full bg-white border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors disabled:opacity-70"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

