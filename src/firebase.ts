import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "higher-lower-cherry",
  appId: "1:705943931817:web:82b5fb306c94c0a67c52b8",
  storageBucket: "higher-lower-cherry.firebasestorage.app",
  apiKey: "AIzaSyAiDALGTQg80Id5XJ3NISkQhMslV-vtYN0",
  authDomain: "higher-lower-cherry.firebaseapp.com",
  messagingSenderId: "705943931817",
  measurementId: "G-GDBV7DJSRY"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
