import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Firebase Web config (from Firebase console)
const firebaseConfig = {
  apiKey: 'AIzaSyANSsMoygD9YG5jwYlPDIqhPWaHfGgnfZs',
  authDomain: 'ezlift-prod-1819d.firebaseapp.com',
  projectId: 'ezlift-prod-1819d',
  // Note: storage bucket name typically ends with .appspot.com
  // Using the value provided; adjust to 'ezlift-prod-1819d.appspot.com' if needed
  storageBucket: 'ezlift-prod-1819d.firebasestorage.app',
  messagingSenderId: '505695168509',
  appId: '1:505695168509:web:c4698ae614ff43727adb94',
};

// Initialize (singleton)
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export default app; 