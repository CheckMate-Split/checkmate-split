import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "AIzaSyAjcwRdBBQ3PdjiXHIIgsmJj_B8Jw70-Do",
  authDomain: "checkmate-split-app.firebaseapp.com",
  projectId: "checkmate-split-app",
  storageBucket: "checkmate-split-app.appspot.com",
  messagingSenderId: "638783503585",
  appId: "1:638783503585:web:651a5ad7109d7bbf3c0ba0",
  measurementId: "G-EYWPP5FDK6"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);
export { app, db, storage, functions };
