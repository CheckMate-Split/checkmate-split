import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';
// getReactNativePersistence is not typed in the bundled TS definitions
// @ts-ignore
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAjcwRdBBQ3PdjiXHIIgsmJj_B8Jw70-Do",
  authDomain: "checkmate-split-app.firebaseapp.com",
  projectId: "checkmate-split-app",
  storageBucket: "checkmate-split-app.appspot.com",
  messagingSenderId: "638783503585",
  appId: "1:638783503585:web:651a5ad7109d7bbf3c0ba0",
  measurementId: "G-EYWPP5FDK6"
};

let app: FirebaseApp;
let auth: Auth;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} else {
  app = getApp();
  auth = getAuth(app);
}

const db = getFirestore(app);
const storage = getStorage(app);
// Use explicit region for callable functions so the URL is predictable
// and easier to debug.
const functions = getFunctions(app, 'us-central1');

console.log('Firebase project', app.options.projectId);
console.log('Functions URL', `https://us-central1-${app.options.projectId}.cloudfunctions.net`);

export { app, auth, db, storage, functions };
