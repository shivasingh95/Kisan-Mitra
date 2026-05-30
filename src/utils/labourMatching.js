// src/utils/labourMatching.js — Worker-Job matching engine for KrishanMitra Labour Network

/**
 * Match and rank workers against a job posting.
 *
 * Filters:
 *   1. Skill must include jobType
 *   2. Worker availability overlaps job dates
 *   3. In same district OR within 50 km
 *   4. Daily rate ≤ offered rate
 *
 * Sorts by: rating (desc) → total jobs (desc) → distance (asc)
 *
 * @param {Object} job     - jobPosting object
 * @param {Array}  workers - array of worker objects
 * @returns {Array} sorted, filtered workers
 */
export function matchWorkers(job, workers) {
  if (!job || !workers?.length) return [];

  return workers
    .filter(w => {
      if (!w.isAvailable) return false;

      // 1. Skill check
      const skillOk = Array.isArray(w.skills) && w.skills.includes(job.jobType);
      if (!skillOk) return false;

      // 2. Availability check (support both Date objects and timestamps)
      const wFrom = toMs(w.availableFrom);
      const wTo   = toMs(w.availableTo);
      const jFrom = toMs(job.startDate);
      const jTo   = toMs(job.endDate);
      const available = wFrom != null && wTo != null && jFrom != null && jTo != null
        ? wFrom <= jFrom && wTo >= jTo
        : true; // skip if dates not set

      // 3. District match OR proximity ≤ 50 km
      const districtOk = w.district === job.location?.district;
      const distKm     = calcDistance(
        w.lat ?? 0, w.lng ?? 0,
        job.location?.lat ?? 0, job.location?.lng ?? 0
      );
      const nearbyOk = distKm <= 50;
      if (!districtOk && !nearbyOk) return false;

      // 4. Rate check
      const rateOk = w.dailyRate <= (job.dailyRateOffered ?? Infinity);

      return available && rateOk;
    })
    .sort((a, b) => {
      // Primary: rating desc
      if (b.rating !== a.rating) return b.rating - a.rating;
      // Secondary: total jobs desc
      if (b.totalJobs !== a.totalJobs) return b.totalJobs - a.totalJobs;
      // Tertiary: distance asc
      const dA = calcDistance(a.lat ?? 0, a.lng ?? 0, job.location?.lat ?? 0, job.location?.lng ?? 0);
      const dB = calcDistance(b.lat ?? 0, b.lng ?? 0, job.location?.lat ?? 0, job.location?.lng ?? 0);
      return dA - dB;
    });
}

/**
 * Haversine formula — great-circle distance in km.
 * @param {number} lat1
 * @param {number} lng1
 * @param {number} lat2
 * @param {number} lng2
 * @returns {number} distance in kilometres
 */
export function calcDistance(lat1, lng1, lat2, lng2) {
  const R    = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a    =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Normalise Firestore Timestamp, JS Date, or ms-number to milliseconds */
function toMs(val) {
  if (!val) return null;
  if (typeof val === 'number') return val;
  if (val instanceof Date) return val.getTime();
  if (val?.toDate)  return val.toDate().getTime(); // Firestore Timestamp
  if (val?.seconds) return val.seconds * 1000;      // plain {seconds, nanoseconds}
  return null;
}
