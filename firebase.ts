import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase instances
const validateConfig = () => {
  const requiredFields = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId'
  ];
  
  requiredFields.forEach(field => {
    if (!firebaseConfig[field]) {
      throw new Error(`Missing Firebase config field: ${field}`);
    }
  });
};

// Initialize Firebase with default values
let firebaseApp;
let firebaseDb;
let firebaseStorage;
let firebaseAuth;

try {
  validateConfig();
  firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
  firebaseDb = getFirestore(firebaseApp);
  firebaseStorage = getStorage(firebaseApp);
  firebaseAuth = getAuth(firebaseApp);
} catch (error) {
  console.error('Firebase initialization error:', error);
}

// Export the initialized instances
export const app = firebaseApp;
export const db = firebaseDb;
export const storage = firebaseStorage;
export const auth = firebaseAuth;