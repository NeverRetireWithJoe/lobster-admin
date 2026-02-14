// Vercel Serverless proxy → VPS backend
const BACKEND = 'http://82.197.94.119:8080';

export default async function handler(req, res) {
  // req.url = /api/auth/login (full path including /api)
  const url = `${BACKEND}${req.url}`;

  try {
    const fetchOpts = {
      method: req.method,
      headers: {},
    };

    // Forward content-type
    if (req.headers['content-type']) {
      fetchOpts.headers['Content-Type'] = req.headers['content-type'];
    }

    // Forward auth header
    if (req.headers.authorization) {
      fetchOpts.headers['Authorization'] = req.headers.authorization;
    }

    // Forward body for POST/PUT/PATCH/DELETE
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) && req.body) {
      fetchOpts.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }

    const response = await fetch(url, fetchOpts);
    const contentType = response.headers.get('content-type') || 'application/json';
    const data = await response.text();

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    res.setHeader('Content-Type', contentType);
    res.status(response.status).send(data);
  } catch (err) {
    res.status(502).json({ error: 'Backend unreachable', detail: err.message });
  }
}
