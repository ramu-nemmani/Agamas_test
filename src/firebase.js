import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const firebaseConfigVideos = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY_VIDEOS,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN_VIDEOS,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID_VIDEOS,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET_VIDEOS,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID_VIDEOS,
  appId: import.meta.env.VITE_FIREBASE_APP_ID_VIDEOS,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID_VIDEOS,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const appVideos = initializeApp(firebaseConfigVideos, "videos");
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);

const dbVideos = getFirestore(appVideos);

// Automatically connect to local functions emulator on localhost / 127.0.0.1
if (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
  connectFunctionsEmulator(functions, "127.0.0.1", 5001);
  console.log("⚡ Connected to local Firebase Functions emulator on port 5001");
}

export { app, auth, db, dbVideos, storage, functions };
