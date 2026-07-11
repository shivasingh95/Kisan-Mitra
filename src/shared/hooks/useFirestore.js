// shared/hooks/useFirestore.js — Reusable Firestore CRUD hook
import { useState, useEffect, useCallback } from 'react';
import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, onSnapshot
} from 'firebase/firestore';
import { db } from '@/services/firebase/config';

/**
 * Generic Firestore collection hook with real-time option.
 * @param {string} collectionName — Firestore collection path
 * @param {object} [options] — { realtime, queryConstraints, initialData }
 */
export function useFirestoreCollection(collectionName, options = {}) {
  const { realtime = false, queryConstraints = [], initialData = [] } = options;
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!collectionName) return;
    setLoading(true);

    const q = query(collection(db, collectionName), ...queryConstraints);

    if (realtime) {
      const unsub = onSnapshot(q,
        (snapshot) => {
          setData(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
          setLoading(false);
        },
        (err) => { setError(err); setLoading(false); }
      );
      return () => unsub();
    } else {
      getDocs(q)
        .then(snap => setData(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
        .catch(err => setError(err))
        .finally(() => setLoading(false));
    }
  }, [collectionName, realtime]);

  const add = useCallback(async (docData) => {
    const ref = await addDoc(collection(db, collectionName), docData);
    return ref.id;
  }, [collectionName]);

  const update = useCallback(async (docId, docData) => {
    await updateDoc(doc(db, collectionName, docId), docData);
  }, [collectionName]);

  const remove = useCallback(async (docId) => {
    await deleteDoc(doc(db, collectionName, docId));
  }, [collectionName]);

  return { data, loading, error, add, update, remove };
}

/**
 * Single Firestore document hook.
 */
export function useFirestoreDoc(collectionName, docId, options = {}) {
  const { realtime = false } = options;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!collectionName || !docId) return;
    setLoading(true);

    const docRef = doc(db, collectionName, docId);

    if (realtime) {
      const unsub = onSnapshot(docRef,
        (snap) => {
          setData(snap.exists() ? { id: snap.id, ...snap.data() } : null);
          setLoading(false);
        },
        (err) => { setError(err); setLoading(false); }
      );
      return () => unsub();
    } else {
      getDoc(docRef)
        .then(snap => setData(snap.exists() ? { id: snap.id, ...snap.data() } : null))
        .catch(err => setError(err))
        .finally(() => setLoading(false));
    }
  }, [collectionName, docId, realtime]);

  return { data, loading, error };
}
