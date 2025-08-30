import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyD_BDXUbxEJLcOtXKEnJ0hLfVFgy0mcp-M",
  authDomain: "siparis-takip-sistemi-1afd7.firebaseapp.com",
  projectId: "siparis-takip-sistemi-1afd7",
  storageBucket: "siparis-takip-sistemi-1afd7.appspot.com",
  messagingSenderId: "623525838090",
  appId: "1:623525838090:web:ee7a6f3a54b122f9064ef3",
  measurementId: "G-7D3K4W60WJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export auth and firestore
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;