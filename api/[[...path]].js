// Vercel Serverless proxy → VPS backend
const BACKEND = 'http://82.197.94.119:8080';

export const config = { api: { bodyParser: true } };

export default async function handler(req, res) {
  // Vercel strips nothing — req.url is like /api/auth/login
  // But catch-all in /api/ folder means req.query.path = ["auth","login"]
  const pathSegments = req.query.path || [];
  const queryString = req.url.includes('?') ? '?' + req.url.split('?')[1] : '';
  const targetUrl = `${BACKEND}/api/${pathSegments.join('/')}${queryString}`;

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  try {
    const fetchOpts = {
      method: req.method,
      headers: {},
    };

    if (req.headers['content-type']) {
      fetchOpts.headers['Content-Type'] = req.headers['content-type'];
    }
    if (req.headers.authorization) {
      fetchOpts.headers['Authorization'] = req.headers.authorization;
    }

    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) && req.body) {
      fetchOpts.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }

    const response = await fetch(targetUrl, fetchOpts);
    const contentType = response.headers.get('content-type') || 'application/json';
    const data = await response.text();

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', contentType);
    res.status(response.status).send(data);
  } catch (err) {
    res.status(502).json({ error: 'Backend unreachable', detail: err.message });
  }
}
