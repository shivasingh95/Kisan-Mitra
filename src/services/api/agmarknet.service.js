// src/services/api/agmarknet.service.js
// Service for fetching and calculating Mandi prices (Agmarknet / local market data)
// Includes offline caching, trend calculation, and MSP data for Indian crops

const MANDI_CACHE_KEY = 'krishi-mitra-mandi-cache';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export const DEFAULT_MANDI_PRICES = [
  { id: 'wheat', crop: 'Wheat', cropHi: 'गेहूं', emoji: '🌾', msp: 2275, current: 2150, trend: 'down', change: -35, loc: 'Bhopal', hist: [2100, 2120, 2135, 2130, 2145, 2150] },
  { id: 'rice', crop: 'Rice', cropHi: 'चावल', emoji: '🍚', msp: 2183, current: 3200, trend: 'up', change: +80, loc: 'Sehore', hist: [3050, 3100, 3120, 3160, 3180, 3200] },
  { id: 'maize', crop: 'Maize', cropHi: 'मक्का', emoji: '🌽', msp: 1962, current: 1850, trend: 'up', change: +20, loc: 'Indore', hist: [1800, 1810, 1820, 1830, 1840, 1850] },
  { id: 'tomato', crop: 'Tomato', cropHi: 'टमाटर', emoji: '🍅', msp: null, current: 45, trend: 'up', change: +12, loc: 'Vidisha', hist: [28, 30, 35, 38, 42, 45] },
  { id: 'onion', crop: 'Onion', cropHi: 'प्याज', emoji: '🧅', msp: null, current: 28, trend: 'down', change: -5, loc: 'Ujjain', hist: [38, 35, 33, 31, 29, 28] },
  { id: 'potato', crop: 'Potato', cropHi: 'आलू', emoji: '🥔', msp: null, current: 22, trend: 'up', change: +3, loc: 'Gwalior', hist: [18, 19, 20, 21, 21, 22] },
  { id: 'soybean', crop: 'Soybean', cropHi: 'सोयाबीन', emoji: '🫘', msp: 4892, current: 5100, trend: 'up', change: +45, loc: 'Ratlam', hist: [4950, 4980, 5010, 5030, 5070, 5100] },
  { id: 'cotton', crop: 'Cotton', cropHi: 'कपास', emoji: '🌼', msp: 6620, current: 6450, trend: 'down', change: -80, loc: 'Khandwa', hist: [6700, 6680, 6620, 6570, 6510, 6450] },
  { id: 'chana', crop: 'Gram / Chana', cropHi: 'चना', emoji: '🧆', msp: 5440, current: 5850, trend: 'up', change: +110, loc: 'Dewas', hist: [5600, 5650, 5700, 5750, 5800, 5850] },
  { id: 'mustard', crop: 'Mustard', cropHi: 'सरसों', emoji: '🌱', msp: 5650, current: 5400, trend: 'down', change: -25, loc: 'Morena', hist: [5550, 5520, 5490, 5450, 5420, 5400] },
];

/**
 * Fetch Mandi prices for a specific location or return all MP default rates.
 * Supports offline storage fallback.
 * @param {string} [location]
 * @returns {Promise<Array>}
 */
export async function getMandiPrices(location = '') {
  try {
    const cached = localStorage.getItem(MANDI_CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TTL_MS) {
        if (!location) return data;
        return data.filter(item => item.loc.toLowerCase().includes(location.toLowerCase()));
      }
    }
  } catch (err) {
    console.warn('[Agmarknet] Cache read error:', err);
  }

  // Simulate network fetch with live fluctuation simulation
  const freshData = DEFAULT_MANDI_PRICES.map(item => {
    // Add small random noise to simulate daily mandi market tick
    const jitter = Math.floor((Math.random() - 0.48) * 10);
    const updatedCurrent = Math.max(10, item.current + jitter);
    return {
      ...item,
      current: updatedCurrent,
      change: item.change + jitter,
      trend: (item.change + jitter) >= 0 ? 'up' : 'down',
      lastUpdated: new Date().toISOString(),
    };
  });

  try {
    localStorage.setItem(MANDI_CACHE_KEY, JSON.stringify({
      data: freshData,
      timestamp: Date.now(),
    }));
  } catch { /* ignore cache write fail */ }

  if (!location) return freshData;
  return freshData.filter(item => item.loc.toLowerCase().includes(location.toLowerCase()));
}

/**
 * Get Minimum Support Price (MSP) info for given crop
 * @param {string} cropName
 */
export function getCropMSP(cropName) {
  const match = DEFAULT_MANDI_PRICES.find(
    c => c.crop.toLowerCase() === cropName.toLowerCase() ||
         c.cropHi === cropName ||
         c.id === cropName.toLowerCase()
  );
  return match ? { msp: match.msp, crop: match.crop, cropHi: match.cropHi } : null;
}
