import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithCredential, signOut, type Auth } from 'firebase/auth/web-extension';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyAyxIAFT5zZoocX0sPjmMex6AvQBlZbVz0",
    authDomain: "personal-dictionary-2c7ed.firebaseapp.com",
    projectId: "personal-dictionary-2c7ed",
    storageBucket: "personal-dictionary-2c7ed.firebasestorage.app",
    messagingSenderId: "736119669168",
    appId: "1:736119669168:web:1b8df8ca6361d7bd539675",
    measurementId: "G-SQ46L8YN58"
};

// Lazy singletons — Firebase SDK is only initialized on first access
let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;

function getApp(): FirebaseApp | null {
    if (!firebaseConfig.apiKey) return null;
    if (!_app) {
        _app = initializeApp(firebaseConfig);
    }
    return _app;
}

// Exported as getters so Firebase modules initialize lazily
const auth: Auth | null = (() => {
    // We need auth eagerly for onAuthStateChanged in App.tsx,
    // but only if the config is valid
    const app = getApp();
    if (!app) return null;
    if (!_auth) _auth = getAuth(app);
    return _auth;
})();

// Firestore is only needed when user is logged in — true lazy init
function getDb(): Firestore | null {
    const app = getApp();
    if (!app) return null;
    if (!_db) _db = getFirestore(app);
    return _db;
}

const googleProvider = new GoogleAuthProvider();

export { auth, getDb, googleProvider, signInWithCredential, signOut };
