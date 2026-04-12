import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// TODO: Replace with your Firebase config from Firebase Console
// 1. Go to https://console.firebase.google.com
// 2. Create a new project (or use existing)
// 3. Go to Project Settings → General
// 4. Copy your config object and paste below
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDemoKeyChangeThis',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'wholesale-hub.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'wholesale-hub-demo',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'wholesale-hub.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789:web:abcdef123456',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Optional: Connect to Firestore emulator for local development
// Uncomment if you want to use Firestore emulator for testing
// if (import.meta.env.DEV) {
//   try {
//     connectFirestoreEmulator(db, 'localhost', 8080);
//   } catch (e) {
//     console.log('Emulator already connected');
//   }
// }

export default app;
