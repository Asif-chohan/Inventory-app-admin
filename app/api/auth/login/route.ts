import { NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function serializeCookie(name: string, value: string, opts: Record<string, any> = {}) {
  let str = `${name}=${encodeURIComponent(value)}`;
  if (opts.maxAge != null) str += `; Max-Age=${opts.maxAge}`;
  if (opts.httpOnly) str += `; HttpOnly`;
  if (opts.path) str += `; Path=${opts.path}`;
  if (opts.sameSite) str += `; SameSite=${opts.sameSite}`;
  if (opts.secure) str += `; Secure`;
  return str;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const resp = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await resp.json();

    if (!resp.ok || !data?.success) {
      return NextResponse.json({ success: false, message: data?.message || 'Login failed' }, { status: resp.status });
    }

    const { token, role } = data.data || {};
    const maxAge = 60 * 60 * 24 * 7; // 7 days
    const secure = process.env.NODE_ENV === 'production';

    const authCookie = serializeCookie('auth_token', token, { httpOnly: true, path: '/', maxAge, sameSite: 'Lax', secure });
    const roleCookie = serializeCookie('user_role', role || '', { httpOnly: false, path: '/', maxAge, sameSite: 'Lax', secure });

    const headers = new Headers();
    headers.append('Set-Cookie', authCookie);
    headers.append('Set-Cookie', roleCookie);

    return new Response(JSON.stringify({ success: true }), { status: 200, headers });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
