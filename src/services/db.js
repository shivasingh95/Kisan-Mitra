// src/services/db.js — Firestore database operations for Krishi Mitra
import { db } from './firebase';
import {
  doc, getDoc, setDoc, updateDoc,
  collection, addDoc, getDocs,
  query, where, orderBy, limit,
  serverTimestamp,
} from 'firebase/firestore';

// ═══════════════════════════════════════════════════════════════
//  USER PROFILES
// ═══════════════════════════════════════════════════════════════

// Get user profile by Firebase UID
export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// Create new user profile (called on first login)
export async function createUserProfile(uid, data) {
  await setDoc(doc(db, 'users', uid), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

// Update user profile fields
export async function updateUserProfile(uid, data) {
  await updateDoc(doc(db, 'users', uid), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

// ═══════════════════════════════════════════════════════════════
//  CROP SCAN HISTORY
// ═══════════════════════════════════════════════════════════════

// Save a new scan result (image stored as base64 — no Storage needed)
export async function saveScanResult(uid, scanData) {
  return addDoc(collection(db, 'scans'), {
    uid,
    ...scanData,
    date: serverTimestamp(),
  });
}

// Get last 10 scans for a farmer
export async function getScanHistory(uid) {
  const q = query(
    collection(db, 'scans'),
    where('uid', '==', uid),
    orderBy('date', 'desc'),
    limit(10)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ═══════════════════════════════════════════════════════════════
//  MARKETPLACE LISTINGS
// ═══════════════════════════════════════════════════════════════

// Post a new crop listing
export async function addListing(uid, listing) {
  return addDoc(collection(db, 'listings'), {
    uid,
    ...listing,
    status: 'active',
    createdAt: serverTimestamp(),
  });
}

// Get all active listings (for buyers / marketplace browse)
export async function getActiveListings(limitCount = 20) {
  const q = query(
    collection(db, 'listings'),
    where('status', '==', 'active'),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// Get only this farmer's listings
export async function getMyListings(uid) {
  const q = query(
    collection(db, 'listings'),
    where('uid', '==', uid),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ═══════════════════════════════════════════════════════════════
//  LABOUR HIRE JOBS
// ═══════════════════════════════════════════════════════════════

export async function addLabourJob(uid, job) {
  return addDoc(collection(db, 'labourJobs'), {
    uid, ...job, status: 'open', createdAt: serverTimestamp()
  });
}

export async function getOpenJobs(limitCount = 15) {
  const q = query(
    collection(db, 'labourJobs'),
    where('status', '==', 'open'),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
