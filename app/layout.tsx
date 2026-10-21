import type { Metadata, Viewport } from 'next';
import { Fraunces, Manrope } from 'next/font/google';
import 'leaflet/dist/leaflet.css';
import './globals.css';
import { SITE_NAME, SITE_URL } from '@/lib/seo';

const fraunces = Fraunces({ subsets: ['latin'], weight: ['400', '600', '700'], style: ['normal', 'italic'], variable: '--font-fraunces', display: 'swap' });
const manrope = Manrope({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], variable: '--font-manrope', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  icons: { icon: '/icon.svg' },
};

export const viewport: Viewport = { themeColor: '#0A5257', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${manrope.variable}`}>
      <body>{children}</body>
    </html>
  );
}
