import { NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function getCookie(req: Request, name: string) {
  const cookie = req.headers.get('cookie') || '';
  const pairs = cookie.split(';').map((c) => c.trim());
  for (const p of pairs) {
    if (p.startsWith(name + '=')) return decodeURIComponent(p.split('=')[1] || '');
  }
  return null;
}

export async function handler(request: Request) {
  try {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/').slice(3); // ['', 'api', 'proxy', ...path]
    const forwardPath = pathParts.join('/');
    const forwardUrl = `${API_BASE}/${forwardPath}${url.search}`;

    const token = getCookie(request, 'auth_token');

    const headers: Record<string, string> = {};
    // copy content-type and other important headers
    const ct = request.headers.get('content-type');
    if (ct) headers['content-type'] = ct;
    if (token) headers['authorization'] = `Bearer ${token}`;

    const resp = await fetch(forwardUrl, {
      method: request.method,
      headers,
      body: ['GET', 'HEAD'].includes(request.method) ? undefined : await request.arrayBuffer(),
    });

    const arrayBuf = await resp.arrayBuffer();
    const responseHeaders = new Headers(resp.headers);

    // Remove hop-by-hop headers that shouldn't be forwarded
    responseHeaders.delete('transfer-encoding');

    return new Response(arrayBuf, {
      status: resp.status,
      headers: responseHeaders,
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Proxy error' }, { status: 500 });
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const OPTIONS = handler;
