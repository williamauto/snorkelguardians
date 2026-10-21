import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

// Called by /admin after publishing or editing, so changes go live immediately
// instead of waiting for the hourly refresh. Only a signed-in admin can trigger it:
// we pass the caller's own Supabase session token to the is_admin() RPC.
export async function POST(req: Request) {
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  const url = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY;
  if (!token || !url || !anon) return NextResponse.json({ ok: false }, { status: 401 });

  const res = await fetch(`${url}/rest/v1/rpc/is_admin`, {
    method: 'POST',
    headers: { apikey: anon, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: '{}',
    cache: 'no-store',
  });
  if (!res.ok || (await res.json()) !== true) return NextResponse.json({ ok: false }, { status: 403 });

  revalidateTag('content');
  revalidatePath('/', 'layout');
  return NextResponse.json({ ok: true, revalidated: new Date().toISOString() });
}
