import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyA80oK9bOoaXYVAknMIANx1xZ9-m7MuTRY",
  authDomain: "mediashare-6eb03.firebaseapp.com",
  projectId: "mediashare-6eb03",
  storageBucket: "mediashare-6eb03.appspot.com", // Make sure this is correct
  messagingSenderId: "289581748973",
  appId: "1:289581748973:web:87f5460485b16655ac32e4",
  measurementId: "G-E8L3LTXJBK"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);