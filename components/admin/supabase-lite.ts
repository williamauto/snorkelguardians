// Minimal Supabase client for the admin dashboard: email magic-link auth + PostgREST.
// Uses only the public anon key; every read/write is authorized by RLS and is_admin()
// on the database side, so nothing secret ever reaches the browser.

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_at: number; // epoch seconds
  email: string;
}

export interface AdminClient {
  session(): Session | null;
  sendMagicLink(email: string, redirectTo: string): Promise<void>;
  /** Picks up tokens from the magic-link redirect (#access_token=...). Returns true if a session was created. */
  consumeRedirect(): Promise<boolean>;
  signOut(): Promise<void>;
  select<T>(table: string, query: string): Promise<T[]>;
  update(table: string, match: string, patch: Record<string, unknown>): Promise<void>;
  insert(table: string, rows: Record<string, unknown> | Record<string, unknown>[], onConflict?: string): Promise<void>;
  remove(table: string, match: string): Promise<void>;
  rpc<T = unknown>(fn: string, args?: Record<string, unknown>): Promise<T>;
  revalidateSite(): Promise<boolean>;
}

const STORE = 'sg-admin-session';

function load(): Session | null {
  try {
    const raw = window.localStorage.getItem(STORE);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch { return null; }
}
function save(s: Session | null) {
  try {
    if (s) window.localStorage.setItem(STORE, JSON.stringify(s));
    else window.localStorage.removeItem(STORE);
  } catch { /* private mode: session lives in memory only */ }
}

async function errorText(res: Response) {
  try {
    const j = await res.json();
    return j.message || j.msg || j.error_description || j.error || JSON.stringify(j);
  } catch { return `${res.status} ${res.statusText}`; }
}

export function createAdminClient(url: string, anonKey: string): AdminClient {
  let current: Session | null = typeof window === 'undefined' ? null : load();

  function setSession(s: Session | null) { current = s; save(s); }

  async function fromTokens(access: string, refresh: string, expiresIn: number): Promise<Session> {
    const res = await fetch(`${url}/auth/v1/user`, { headers: { apikey: anonKey, Authorization: `Bearer ${access}` } });
    if (!res.ok) throw new Error(await errorText(res));
    const user = await res.json();
    return { access_token: access, refresh_token: refresh, expires_at: Math.floor(Date.now() / 1000) + expiresIn, email: user.email };
  }

  async function token(): Promise<string> {
    if (!current) throw new Error('Signed out');
    if (current.expires_at - 60 > Date.now() / 1000) return current.access_token;
    const res = await fetch(`${url}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: { apikey: anonKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: current.refresh_token }),
    });
    if (!res.ok) { setSession(null); throw new Error('Your session expired. Sign in again.'); }
    const j = await res.json();
    setSession({ access_token: j.access_token, refresh_token: j.refresh_token, expires_at: Math.floor(Date.now() / 1000) + j.expires_in, email: current.email });
    return current!.access_token;
  }

  async function rest(path: string, init: RequestInit & { prefer?: string } = {}) {
    const t = await token();
    const res = await fetch(`${url}/rest/v1/${path}`, {
      ...init,
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${t}`,
        'Content-Type': 'application/json',
        ...(init.prefer ? { Prefer: init.prefer } : {}),
      },
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(await errorText(res));
    return res;
  }

  return {
    session: () => current,

    async sendMagicLink(email, redirectTo) {
      const res = await fetch(`${url}/auth/v1/otp?redirect_to=${encodeURIComponent(redirectTo)}`, {
        method: 'POST',
        headers: { apikey: anonKey, 'Content-Type': 'application/json' },
        // create_user: false — only people already added in Supabase Auth get a link.
        body: JSON.stringify({ email: email.trim().toLowerCase(), create_user: false }),
      });
      if (!res.ok) throw new Error(await errorText(res));
    },

    async consumeRedirect() {
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const access = hash.get('access_token');
      const refresh = hash.get('refresh_token');
      if (hash.get('error_description')) {
        history.replaceState(null, '', window.location.pathname);
        throw new Error(hash.get('error_description')!);
      }
      if (!access || !refresh) return false;
      history.replaceState(null, '', window.location.pathname);
      setSession(await fromTokens(access, refresh, Number(hash.get('expires_in') ?? 3600)));
      return true;
    },

    async signOut() {
      try {
        if (current) await fetch(`${url}/auth/v1/logout`, { method: 'POST', headers: { apikey: anonKey, Authorization: `Bearer ${current.access_token}` } });
      } finally { setSession(null); }
    },

    async select<T>(table: string, query: string) {
      const res = await rest(`${table}?${query}`);
      return (await res.json()) as T[];
    },

    async update(table, match, patch) {
      const res = await rest(`${table}?${match}`, { method: 'PATCH', body: JSON.stringify(patch), prefer: 'return=representation' });
      const rows = await res.json();
      if (Array.isArray(rows) && rows.length === 0) throw new Error('Nothing was saved (no permission or row not found).');
    },

    async insert(table, rows, onConflict) {
      await rest(`${table}${onConflict ? `?on_conflict=${onConflict}` : ''}`, {
        method: 'POST', body: JSON.stringify(rows), prefer: `return=minimal${onConflict ? ',resolution=merge-duplicates' : ''}`,
      });
    },

    async remove(table, match) {
      await rest(`${table}?${match}`, { method: 'DELETE' });
    },

    async rpc<T>(fn: string, args: Record<string, unknown> = {}) {
      const res = await rest(`rpc/${fn}`, { method: 'POST', body: JSON.stringify(args) });
      const text = await res.text();
      return (text ? JSON.parse(text) : null) as T;
    },

    async revalidateSite() {
      try {
        const res = await fetch('/api/revalidate/', { method: 'POST', headers: { Authorization: `Bearer ${await token()}` } });
        return res.ok;
      } catch { return false; }
    },
  };
}
