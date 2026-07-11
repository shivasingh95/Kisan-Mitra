// src/services/db.js — Firestore database operations for Krishi Mitra
import { db } from './config';
import {
  doc, getDoc, setDoc, updateDoc, arrayUnion,
  collection, addDoc, getDocs, onSnapshot,
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

// ═══════════════════════════════════════════════════════════════
//  LABOUR NETWORK — WORKERS
// ═══════════════════════════════════════════════════════════════

/** Register a new worker profile */
export async function registerWorker(uid, workerData) {
  const workerId = `w_${uid}_${Date.now()}`;
  await setDoc(doc(db, 'workers', workerId), {
    workerId,
    userId: uid,
    ...workerData,
    aadhaarVerified: false,
    rating: 0,
    totalJobs: 0,
    isAvailable: true,
    createdAt: serverTimestamp(),
  });
  return workerId;
}

/** Get a single worker profile by workerId */
export async function getWorkerProfile(workerId) {
  const snap = await getDoc(doc(db, 'workers', workerId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/** Get worker profile by Firebase UID */
export async function getWorkerByUid(uid) {
  const q = query(collection(db, 'workers'), where('userId', '==', uid), limit(1));
  const snap = await getDocs(q);
  return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
}

/** Get workers in a specific district */
export async function getWorkersByDistrict(district, limitCount = 30) {
  const q = query(
    collection(db, 'workers'),
    where('district', '==', district),
    where('isAvailable', '==', true),
    orderBy('rating', 'desc'),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/** Get all available workers */
export async function getAllWorkers(limitCount = 50) {
  const q = query(
    collection(db, 'workers'),
    where('isAvailable', '==', true),
    orderBy('rating', 'desc'),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ═══════════════════════════════════════════════════════════════
//  LABOUR NETWORK — JOB POSTINGS
// ═══════════════════════════════════════════════════════════════

/** Post a new job — farmer side */
export async function postJob(farmerId, jobData) {
  const ref = await addDoc(collection(db, 'jobPostings'), {
    farmerId,
    ...jobData,
    status: 'open',
    applicants: [],
    acceptedWorkers: [],
    escrowHeld: false,
    escrowAmount: 0,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/** Get all open jobs for a district (worker side) */
export async function getOpenJobsByDistrict(district, limitCount = 20) {
  const q = query(
    collection(db, 'jobPostings'),
    where('status', '==', 'open'),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  // Filter district client-side to avoid composite index requirement
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(j => j.location?.district === district);
}

/** Get all open jobs (no district filter — fallback) */
export async function getAllOpenJobs(limitCount = 20) {
  const q = query(
    collection(db, 'jobPostings'),
    where('status', '==', 'open'),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/** Get a farmer's own job postings */
export async function getFarmerJobs(farmerId) {
  const q = query(
    collection(db, 'jobPostings'),
    where('farmerId', '==', farmerId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/** Worker applies to a job */
export async function applyToJob(jobId, workerId) {
  await updateDoc(doc(db, 'jobPostings', jobId), {
    applicants: arrayUnion({
      workerId,
      appliedAt: Date.now(),
      status: 'pending',
    }),
  });
}

/** Farmer accepts an applicant */
export async function acceptApplicant(jobId, workerId) {
  const snap = await getDoc(doc(db, 'jobPostings', jobId));
  if (!snap.exists()) return;
  const job = snap.data();
  const updatedApplicants = job.applicants.map(a =>
    a.workerId === workerId ? { ...a, status: 'accepted' } : a
  );
  const acceptedWorkers = [...(job.acceptedWorkers || []), workerId];
  await updateDoc(doc(db, 'jobPostings', jobId), {
    applicants: updatedApplicants,
    acceptedWorkers,
    status: acceptedWorkers.length >= job.workersNeeded ? 'filled' : 'open',
  });
}

/** Farmer rejects an applicant */
export async function rejectApplicant(jobId, workerId) {
  const snap = await getDoc(doc(db, 'jobPostings', jobId));
  if (!snap.exists()) return;
  const job = snap.data();
  const updatedApplicants = job.applicants.map(a =>
    a.workerId === workerId ? { ...a, status: 'rejected' } : a
  );
  await updateDoc(doc(db, 'jobPostings', jobId), { applicants: updatedApplicants });
}

/** Farmer confirms payment hold (mocked escrow) */
export async function confirmEscrow(jobId, escrowAmount) {
  await updateDoc(doc(db, 'jobPostings', jobId), {
    escrowHeld: true,
    escrowAmount,
    status: 'in_progress',
  });
}

/** Farmer confirms work done → releases payment */
export async function completeJob(jobId) {
  await updateDoc(doc(db, 'jobPostings', jobId), {
    status: 'completed',
  });
}

// ═══════════════════════════════════════════════════════════════
//  LABOUR NETWORK — TRANSACTIONS
// ═══════════════════════════════════════════════════════════════

/** Create a payment transaction record */
export async function createTransaction(txnData) {
  return addDoc(collection(db, 'transactions'), {
    ...txnData,
    status: 'released',
    createdAt: serverTimestamp(),
    releasedAt: serverTimestamp(),
  });
}

/** Get all transactions for a worker */
export async function getWorkerTransactions(workerId) {
  const q = query(
    collection(db, 'transactions'),
    where('workerId', '==', workerId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ═══════════════════════════════════════════════════════════════
//  LABOUR NETWORK — NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════

/** Create a notification for a user */
export async function createNotification(userId, notifData) {
  return addDoc(collection(db, 'notifications'), {
    userId,
    ...notifData,
    read: false,
    createdAt: serverTimestamp(),
  });
}

/** Mark a single notification as read */
export async function markNotificationRead(notifId) {
  await updateDoc(doc(db, 'notifications', notifId), { read: true });
}

/**
 * Subscribe to unread notifications for a user.
 * Returns an unsubscribe function.
 * @param {string}   userId
 * @param {Function} callback - called with array of notification objects
 */
export function subscribeToNotifications(userId, callback) {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    where('read', '==', false),
    orderBy('createdAt', 'desc'),
    limit(10)
  );
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}
