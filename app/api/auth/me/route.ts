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

export async function GET(request: Request) {
  try {
    const token = getCookie(request, 'auth_token');

    if (!token) return NextResponse.json({ authenticated: false });

    // Optionally verify with backend
    try {
      const resp = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resp.ok) return NextResponse.json({ authenticated: false }, { status: 200 });
      const data = await resp.json();
      return NextResponse.json({ authenticated: true, user: data?.data || null });
    } catch (err) {
      return NextResponse.json({ authenticated: false });
    }
  } catch (err) {
    return NextResponse.json({ authenticated: false });
  }
}
