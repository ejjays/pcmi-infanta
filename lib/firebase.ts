import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth'; 

const firebaseConfig = {
  apiKey: "AIzaSyA80oK9bOoaXYVAknMIANx1xZ9-m7MuTRY",
  authDomain: "mediashare-6eb03.firebaseapp.com",
  projectId: "mediashare-6eb03",
  storageBucket: "mediashare-6eb03.firebasestorage.app",
  messagingSenderId: "289581748973",
  appId: "1:289581748973:web:87f5460485b16655ac32e4",
  measurementId: "G-E8L3LTXJBK"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app); 

export { db, storage, app, auth }; 