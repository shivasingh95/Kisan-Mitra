// api/plantnet.js
// Serverless proxy for Pl@ntNet API to completely avoid CORS issues and keep API keys secure.

export const config = {
  api: {
    bodyParser: false, // Bypass Vercel's default JSON parsing to handle raw multipart/form-data stream
  },
};

export default async function handler(req, res) {
  // Only permit POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  // 1. Retrieve the Pl@ntNet API Key
  // Prefer server-side env var (no VITE_ prefix — never exposed to browser)
  // Fall back to VITE_ prefixed var for backward compat
  const apiKey = process.env.PLANTNET_API_KEY || process.env.VITE_PLANTNET_API_KEY;

  if (!apiKey) {
    return res.status(400).json({
      error: 'API Key missing',
      message: 'Pl@ntNet API key was not found in environment variables or request query.',
    });
  }

  try {
    // 2. Build target URL with parameters
    const lang = req.query.lang || 'en';
    const nbResults = req.query['nb-results'] || '3';
    const targetUrl = `https://my-api.plantnet.org/v2/identify/all?api-key=${apiKey}&lang=${lang}&nb-results=${nbResults}`;

    // 3. Read incoming request stream into a Buffer
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // 4. Forward the multipart/form-data request to Pl@ntNet
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'content-type': req.headers['content-type'],
      },
      body: buffer,
    });

    const status = response.status;
    const contentType = response.headers.get('content-type');

    // 5. Send back response to client
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return res.status(status).json(data);
    } else {
      const text = await response.text();
      return res.status(status).send(text);
    }
  } catch (error) {
    console.error('Serverless Pl@ntNet Proxy Error:', error);
    return res.status(500).json({
      error: 'Proxy Error',
      message: error.message || 'An error occurred forwarding the request to Pl@ntNet.',
    });
  }
}
