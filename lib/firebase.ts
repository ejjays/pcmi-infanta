import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA80oK9bOoaXYVAknMIANx1xZ9-m7MuTRY",
  authDomain: "mediashare-6eb03.firebaseapp.com",
  projectId: "mediashare-6eb03",
  storageBucket: "mediashare-6eb03.firebasestorage.app",
  messagingSenderId: "289581748973",
  appId: "1:289581748973:web:87f5460485b16655ac32e4",
  measurementId: "G-E8L3LTXJBK"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

export { db };