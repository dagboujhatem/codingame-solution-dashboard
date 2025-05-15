import { initializeApp } from "firebase-admin/app";
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
const firebaseApp = initializeApp();
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

export { auth, db };
