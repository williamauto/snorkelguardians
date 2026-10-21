// Adds OUR affiliate IDs to clean Viator / GetYourGuide product URLs.
// IDs come from environment variables, so they never live in the database or the repo:
//   GYG_PARTNER_ID   GetYourGuide partner ID (Partner Center → Account)
//   VIATOR_PID       Viator partner ID, e.g. P00012345 (Viator Partner Resource Center)
//   VIATOR_MCID      Viator campaign ID (defaults to 42383, Viator's standard affiliate campaign)
// If an ID is missing the clean URL is returned, so links still work, just untracked.

import type { TourProvider } from './types';

export interface AffiliateIds { gygPartnerId?: string; viatorPid?: string; viatorMcid?: string }

export function affiliateIdsFromEnv(
  env: Record<string, string | undefined> = typeof process !== 'undefined' ? process.env : {},
): AffiliateIds {
  return { gygPartnerId: env.GYG_PARTNER_ID, viatorPid: env.VIATOR_PID, viatorMcid: env.VIATOR_MCID };
}

const STRIP = ['pid', 'mcid', 'medium', 'partner_id', 'visitor_id', 'psrc', 'client', 'utm_medium', 'utm_source', 'cmp'];

export function affiliateUrl(provider: TourProvider, productUrl: string, ids: AffiliateIds = affiliateIdsFromEnv()): string {
  let u: URL;
  try { u = new URL(productUrl); } catch { return productUrl; }
  STRIP.forEach(k => u.searchParams.delete(k));
  if (provider === 'getyourguide' && ids.gygPartnerId) {
    u.searchParams.set('partner_id', ids.gygPartnerId);
    u.searchParams.set('utm_medium', 'online_publisher');
  }
  if (provider === 'viator' && ids.viatorPid) {
    u.searchParams.set('pid', ids.viatorPid);
    u.searchParams.set('mcid', ids.viatorMcid || '42383');
    u.searchParams.set('medium', 'link');
  }
  return u.toString();
}

export const PROVIDER_NAME: Record<TourProvider, string> = { viator: 'Viator', getyourguide: 'GetYourGuide' };
