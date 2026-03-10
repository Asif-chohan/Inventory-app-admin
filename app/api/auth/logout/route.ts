import { NextResponse } from 'next/server';

function serializeCookie(name: string, value: string, opts: Record<string, any> = {}) {
  let str = `${name}=${encodeURIComponent(value || '')}`;
  // expire cookie
  str += `; Max-Age=0`;
  if (opts.path) str += `; Path=${opts.path}`;
  if (opts.sameSite) str += `; SameSite=${opts.sameSite}`;
  if (opts.secure) str += `; Secure`;
  return str;
}

export async function POST() {
  const secure = process.env.NODE_ENV === 'production';
  const headers = new Headers();
  headers.append('Set-Cookie', serializeCookie('auth_token', '', { path: '/', sameSite: 'Lax', secure }));
  headers.append('Set-Cookie', serializeCookie('user_role', '', { path: '/', sameSite: 'Lax', secure }));

  return new Response(JSON.stringify({ success: true }), { status: 200, headers });
}
