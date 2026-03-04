import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithCredential, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// TODO: Replace with your actual Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyAyxIAFT5zZoocX0sPjmMex6AvQBlZbVz0",
    authDomain: "personal-dictionary-2c7ed.firebaseapp.com",
    projectId: "personal-dictionary-2c7ed",
    storageBucket: "personal-dictionary-2c7ed.firebasestorage.app",
    messagingSenderId: "736119669168",
    appId: "1:736119669168:web:1b8df8ca6361d7bd539675",
    measurementId: "G-SQ46L8YN58"
};


// Log config for configuration debugging (careful not to expose too much in prod, but helpful in dev)
console.log('[FIREBASE INIT] Env keys detected keys:', {
    apiKeyLength: firebaseConfig.apiKey ? firebaseConfig.apiKey.length : 0,
    hasAuthDomain: !!firebaseConfig.authDomain,
    hasProjectId: !!firebaseConfig.projectId,
});

if (!firebaseConfig.apiKey) {
    console.error('[FIREBASE INIT ERROR] Missing apiKey. Ensure standard .env loading in Vite.');
}

// Initialize Firebase only if the API key config actually loaded
const app = firebaseConfig.apiKey ? initializeApp(firebaseConfig) : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider, signInWithCredential, signOut };
