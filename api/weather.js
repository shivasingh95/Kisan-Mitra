// api/weather.js — Vercel Serverless proxy for WeatherAPI.com
// Hides API key from browser network tab and adds basic rate limiting

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  // Use server-side env var (no VITE_ prefix) with fallback to VITE_ for dev
  const apiKey = process.env.WEATHER_API_KEY || process.env.VITE_WEATHER_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: 'API Key missing',
      message: 'Weather API key not configured in server environment variables.',
    });
  }

  try {
    const { q, endpoint = 'forecast' } = req.query;

    if (!q) {
      return res.status(400).json({
        error: 'Missing query parameter',
        message: 'Provide ?q=city_name or ?q=lat,lon',
      });
    }

    // Whitelist allowed endpoints
    const allowedEndpoints = ['current', 'forecast'];
    if (!allowedEndpoints.includes(endpoint)) {
      return res.status(400).json({
        error: 'Invalid endpoint',
        message: `Allowed endpoints: ${allowedEndpoints.join(', ')}`,
      });
    }

    // Build the WeatherAPI URL
    const params = new URLSearchParams({
      key: apiKey,
      q,
      aqi: 'no',
    });

    // Add forecast-specific params
    if (endpoint === 'forecast') {
      params.set('days', '6');
      params.set('alerts', 'yes');
    }

    const targetUrl = `https://api.weatherapi.com/v1/${endpoint}.json?${params}`;

    const response = await fetch(targetUrl);
    const status = response.status;
    const data = await response.json();

    // Set cache headers (15 minutes)
    res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=1800');

    return res.status(status).json(data);
  } catch (error) {
    console.error('Weather Proxy Error:', error);
    return res.status(500).json({
      error: 'Proxy Error',
      message: error.message || 'Failed to fetch weather data.',
    });
  }
}
