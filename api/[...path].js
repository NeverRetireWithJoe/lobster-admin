// Vercel Serverless proxy → VPS backend
const BACKEND = 'http://82.197.94.119:8080';

export default async function handler(req, res) {
  const path = req.url; // e.g. /api/auth/login
  const url = `${BACKEND}${path}`;

  try {
    const headers = { ...req.headers };
    delete headers.host;
    delete headers['content-length'];

    const fetchOpts = {
      method: req.method,
      headers: {
        'Content-Type': req.headers['content-type'] || 'application/json',
      },
    };

    // Forward auth header
    if (req.headers.authorization) {
      fetchOpts.headers['Authorization'] = req.headers.authorization;
    }

    // Forward body for POST/PUT/PATCH
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      fetchOpts.body = JSON.stringify(req.body);
    }

    const response = await fetch(url, fetchOpts);
    const data = await response.text();

    // Forward response headers
    res.status(response.status);
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json');
    res.send(data);
  } catch (err) {
    res.status(502).json({ error: 'Backend unreachable', detail: err.message });
  }
}
