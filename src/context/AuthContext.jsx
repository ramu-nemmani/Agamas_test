import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db, functions } from "../firebase";
import { httpsCallable } from "firebase/functions";

// Enum for authentication states
export const AuthStatus = {
  LOADING: "LOADING",
  AUTHENTICATED: "AUTHENTICATED",
  UNAUTHENTICATED: "UNAUTHENTICATED",
};

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authStatus, setAuthStatus] = useState(AuthStatus.LOADING);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        if (!user.emailVerified) {
          setUser(null);
          setAuthStatus(AuthStatus.UNAUTHENTICATED);
          return;
        }
        
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userDocRef);

          let userDetails = {};
          if (userSnap.exists()) {
            userDetails = userSnap.data();
          } else {
            // If they sign in via Google for the first time but have no user document
            userDetails = {
              name: user.displayName || "User",
              email: user.email,
              createdAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, userDetails);
          }

          setUser({ ...user, ...userDetails });
          setAuthStatus(AuthStatus.AUTHENTICATED);
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser(user); // Fallback to just the auth user
          setAuthStatus(AuthStatus.AUTHENTICATED);
        }
      } else {
        setUser(null);
        setAuthStatus(AuthStatus.UNAUTHENTICATED);
      }
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    if (!userCredential.user.emailVerified) {
      await signOut(auth);
      const err = new Error("Please verify your email before logging in.");
      err.code = "auth/unverified-email";
      throw err;
    }
    return userCredential;
  };

  const signUpWithEmail = async (name, email, password, phone = "") => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Create user document
    await setDoc(doc(db, "users", userCredential.user.uid), {
      name,
      email,
      phone,
      createdAt: new Date().toISOString(),
    });

    // Send email verification using the deployed cloud function
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
        await sendEmailVerification(userCredential.user);
      }
    } catch (emailError) {
      console.error("Failed to call verification email function:", emailError);
      // We don't re-throw because the account was successfully created.
    }

    await signOut(auth);
    return userCredential;
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    return await signInWithPopup(auth, provider);
    // The onAuthStateChanged listener handles creating the firestore doc if missing
  };

  const resetPassword = async (email) => {
    try {
      const sendPasswordReset = httpsCallable(functions, "sendPasswordResetEmailFn");
      const result = await sendPasswordReset({ email });
      if (result.data && result.data.error) {
        console.error("Cloud function returned an error:", result.data.error);
        throw new Error(result.data.error);
      }
      
      if (result.data && result.data.method === 'none') {
        console.warn("SES not configured or failed, falling back to Firebase client SDK");
        return await sendPasswordResetEmail(auth, email);
      }
    } catch (err) {
      console.error("Failed to call password reset email function:", err);
      // Fallback
      return await sendPasswordResetEmail(auth, email);
    }
  };

  const updateUserProfile = async (updates) => {
    if (!user) return;
    const userDocRef = doc(db, "users", user.uid);
    await setDoc(userDocRef, updates, { merge: true });
    setUser((prev) => ({ ...prev, ...updates }));
  };

  const logout = async () => {
    localStorage.clear();
    await signOut(auth);
    setUser(null);
    setAuthStatus(AuthStatus.UNAUTHENTICATED);
    // Check if on admin path, otherwise just redirect to home
    if (window.location.pathname.startsWith("/admin")) {
      navigate("/admin/login");
    } else {
      navigate("/");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        authStatus,
        logout,
        loginWithEmail,
        signUpWithEmail,
        loginWithGoogle,
        updateUserProfile,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
