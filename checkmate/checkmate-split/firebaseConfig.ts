import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyAjcwRdBBQ3PdjiXHIIgsmJj_B8Jw70-Do",
  authDomain: "checkmate-split-app.firebaseapp.com",
  projectId: "checkmate-split-app",
  storageBucket: "checkmate-split-app.firebasestorage.app",
  messagingSenderId: "638783503585",
  appId: "1:638783503585:web:651a5ad7109d7bbf3c0ba0",
  measurementId: "G-EYWPP5FDK6"
};

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export { app, auth };
