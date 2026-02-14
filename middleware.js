const BACKEND = 'http://82.197.94.119:8080';

export const config = {
  matcher: '/api/:path*',
};

export default async function middleware(request) {
  const url = new URL(request.url);
  const targetUrl = `${BACKEND}${url.pathname}${url.search}`;

  const headers = new Headers();
  if (request.headers.get('content-type')) {
    headers.set('Content-Type', request.headers.get('content-type'));
  }
  if (request.headers.get('authorization')) {
    headers.set('Authorization', request.headers.get('authorization'));
  }

  const fetchOpts = {
    method: request.method,
    headers,
  };

  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
    fetchOpts.body = await request.text();
  }

  try {
    const response = await fetch(targetUrl, fetchOpts);
    return new Response(response.body, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Backend unreachable' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
