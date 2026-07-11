// services/firebase/storage.service.js — Firebase Storage helpers
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

const storage = getStorage();

/**
 * Upload a file to Firebase Storage.
 * @param {File} file — browser File object
 * @param {string} path — storage path (e.g., 'crop-images/user123/photo.jpg')
 * @returns {Promise<string>} — download URL
 */
export async function uploadFile(file, path) {
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  return getDownloadURL(snapshot.ref);
}

/**
 * Get download URL for an existing storage path.
 * @param {string} path — storage path
 * @returns {Promise<string>}
 */
export async function getFileURL(path) {
  return getDownloadURL(ref(storage, path));
}

/**
 * Delete a file from storage.
 * @param {string} path — storage path
 */
export async function deleteFile(path) {
  return deleteObject(ref(storage, path));
}
