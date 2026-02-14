const BACKEND = 'http://82.197.94.119:8080';

export default async function handler(req, res) {
  // The original path comes as query param: /api/proxy?p=/auth/login
  const apiPath = req.query.p || '/';
  const targetUrl = `${BACKEND}/api${apiPath}`;

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  try {
    const fetchOpts = { method: req.method, headers: {} };

    if (req.headers['content-type']) fetchOpts.headers['Content-Type'] = req.headers['content-type'];
    if (req.headers.authorization) fetchOpts.headers['Authorization'] = req.headers.authorization;

    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) && req.body) {
      fetchOpts.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }

    const response = await fetch(targetUrl, fetchOpts);
    const data = await response.text();

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json');
    res.status(response.status).send(data);
  } catch (err) {
    res.status(502).json({ error: 'Backend unreachable', detail: err.message });
  }
}
