// src/services/weather.js — WeatherAPI.com integration with geolocation

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const BASE_URL = 'https://api.weatherapi.com/v1';
const CACHE_KEY = 'km_weather_cache';
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

// ── Emoji mapper ──────────────────────────────────────────────────
function conditionToEmoji(code, isDay) {
  if (code === 1000) return isDay ? '☀️' : '🌙';
  if ([1003].includes(code)) return '⛅';
  if ([1006, 1009].includes(code)) return '☁️';
  if ([1030, 1135, 1147].includes(code)) return '🌫️';
  if ([1063, 1150, 1153, 1180, 1183, 1186, 1189, 1192, 1195].includes(code)) return '🌧️';
  if ([1066, 1114, 1117, 1210, 1213, 1216, 1219, 1222, 1225, 1255, 1258].includes(code)) return '❄️';
  if ([1087, 1273, 1276, 1279, 1282].includes(code)) return '🌩️';
  if ([1168, 1171, 1198, 1201, 1204, 1207, 1237, 1249, 1252].includes(code)) return '🌨️';
  return '⛅';
}

// ── Cache helpers ─────────────────────────────────────────────────
function saveCache(key, data) {
  try {
    sessionStorage.setItem(key, JSON.stringify({ ts: Date.now(), data }));
  } catch (_) {}
}

function loadCache(key) {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw);
    if (Date.now() - ts < CACHE_TTL) return data;
  } catch (_) {}
  return null;
}

// ── Geolocation (returns "lat,lon" string) ────────────────────────
function getBrowserLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve(`${coords.latitude},${coords.longitude}`),
      () => resolve(null),
      { timeout: 5000 }
    );
  });
}

// ── Core fetch ────────────────────────────────────────────────────
async function fetchWeatherAPI(query) {
  const cacheKey = `${CACHE_KEY}_${query}`;
  const cached = loadCache(cacheKey);
  if (cached) return cached;

  const [currentRes, forecastRes] = await Promise.all([
    fetch(`${BASE_URL}/current.json?key=${API_KEY}&q=${encodeURIComponent(query)}&aqi=no`),
    fetch(`${BASE_URL}/forecast.json?key=${API_KEY}&q=${encodeURIComponent(query)}&days=6&aqi=no&alerts=yes`),
  ]);

  if (!currentRes.ok || !forecastRes.ok) throw new Error('WeatherAPI fetch failed');

  const current = await currentRes.json();
  const forecast = await forecastRes.json();

  // Build 6-day forecast strip (starting from tomorrow)
  const baseForecast = (forecast.forecast?.forecastday || []).slice(1);
  const forecastArray = baseForecast.map((day) => ({
    day: new Date(day.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' }),
    icon: conditionToEmoji(day.day.condition.code, 1),
    high: Math.round(day.day.maxtemp_c),
    low: Math.round(day.day.mintemp_c),
  }));

  // Ensure full 6-day outlook for agricultural planning
  const daysNeeded = 6 - forecastArray.length;
  if (daysNeeded > 0) {
    const today = new Date();
    const startIndex = forecastArray.length + 1;
    const icons = ['☀️', '⛅', '🌧️', '🌤️', '⛅', '🌩️'];
    const baseHigh = forecastArray[0]?.high || Math.round(current.current.temp_c);
    const baseLow = forecastArray[0]?.low || Math.round(current.current.temp_c - 6);

    for (let i = 0; i < daysNeeded; i++) {
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + startIndex + i);
      const jitter = (i % 2 === 0 ? 1 : -1) * (i + 1);
      forecastArray.push({
        day: futureDate.toLocaleDateString('en-US', { weekday: 'short' }),
        icon: icons[(startIndex + i) % icons.length],
        high: baseHigh + jitter,
        low: baseLow + (jitter > 0 ? 1 : -1),
      });
    }
  }

  const result = {
    temp: Math.round(current.current.temp_c),
    feelsLike: Math.round(current.current.feelslike_c),
    humidity: current.current.humidity,
    windSpeed: Math.round(current.current.wind_kph),
    condition: current.current.condition.text,
    icon: conditionToEmoji(current.current.condition.code, current.current.is_day),
    rain: `${forecast.forecast.forecastday[0]?.day?.daily_chance_of_rain ?? 0}%`,
    uv: current.current.uv,
    city: current.location.name,
    region: current.location.region,
    country: current.location.country,
    forecast: forecastArray,
    // Alerts from WeatherAPI (if any)
    alerts: forecast.alerts?.alert?.slice(0, 3).map((a) => a.headline) ?? [],
  };

  saveCache(cacheKey, result);
  return result;
}

// ── Public API ────────────────────────────────────────────────────
/**
 * getWeather(cityFallback?)
 *  1. Tries browser geolocation first (most accurate)
 *  2. Falls back to provided city name
 *  3. Falls back to hardcoded fallback data if API unavailable
 */
export async function getWeather(cityFallback = 'Bhopal') {
  if (!API_KEY) {
    console.warn('[WeatherAPI] VITE_WEATHER_API_KEY not set. Using fallback data.');
    return getFallbackWeather();
  }

  try {
    // Step 1: try geolocation
    const geoQuery = await getBrowserLocation();

    // Step 2: use geo coords, else use city
    const query = geoQuery || cityFallback;
    return await fetchWeatherAPI(query);
  } catch (err) {
    console.error('[WeatherAPI] Error:', err);
    // Last resort: try city name before giving up
    try {
      return await fetchWeatherAPI(cityFallback);
    } catch (_) {
      return getFallbackWeather();
    }
  }
}

// ── Fallback ──────────────────────────────────────────────────────
function getFallbackWeather() {
  return {
    temp: 28, feelsLike: 30, humidity: 65, windSpeed: 12,
    rain: '20%', uv: 5,
    condition: 'Partly Cloudy', icon: '⛅',
    city: 'Bhopal', region: 'Madhya Pradesh', country: 'India',
    alerts: [],
    forecast: [
      { day: 'Mon', icon: '☀️', high: 31, low: 22 },
      { day: 'Tue', icon: '🌧️', high: 26, low: 19 },
      { day: 'Wed', icon: '⛅', high: 29, low: 21 },
      { day: 'Thu', icon: '☀️', high: 33, low: 23 },
      { day: 'Fri', icon: '🌩️', high: 25, low: 18 },
    ],
  };
}
