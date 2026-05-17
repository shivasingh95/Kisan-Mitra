// src/services/firebase.js — Firebase initialisation for Krishi Mitra
import { initializeApp } from 'firebase/app';
import { getAuth }       from 'firebase/auth';
import { getFirestore }  from 'firebase/firestore';
// NOTE: Storage is intentionally NOT imported — free Spark plan is fine for auth + Firestore

const firebaseConfig = {
  apiKey:            "AIzaSyDRMDxfj-l3Ib4G_CZRKvdphbu77xh7wwQ",
  authDomain:        "krishi-mitra-f60c6.firebaseapp.com",
  projectId:         "krishi-mitra-f60c6",
  storageBucket:     "krishi-mitra-f60c6.firebasestorage.app",
  messagingSenderId: "974756163646",
  appId:             "1:974756163646:web:b92a95d6d6ecc82240616f",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db   = getFirestore(app);
