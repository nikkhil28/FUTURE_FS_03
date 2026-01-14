import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAaiHGtE2REkPW7dSfvMk_7AybNzOoqKls",
  authDomain: "rebranding-8541f.firebaseapp.com",
  projectId: "rebranding-8541f",
  storageBucket: "rebranding-8541f.firebasestorage.app",
  messagingSenderId: "287525350624",
  appId: "1:287525350624:web:9f14eb09670aba1243b485",
  measurementId: "G-GNFR18ESF0"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

export const db = getFirestore(app);
export default app;
