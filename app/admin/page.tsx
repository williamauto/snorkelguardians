import type { Metadata } from 'next';
import { AdminApp } from '@/components/admin/AdminApp';
import './admin.css';

// The dashboard runs entirely in the browser with the public anon key.
// What an account can see and change is decided by RLS + is_admin() in the database.
export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};
export const dynamic = 'force-static';

export default function AdminPage() {
  return <AdminApp supabaseUrl={process.env.SUPABASE_URL ?? ''} anonKey={process.env.SUPABASE_ANON_KEY ?? ''} />;
}
