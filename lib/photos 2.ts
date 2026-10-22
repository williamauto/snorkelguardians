import credits from '@/public/img/credits.json';

export type PhotoCredit = {
  file: string;
  title: string;
  creator: string;
  license: 'cc0' | 'pdm' | 'by';
  license_url: string;
  source: string;
  source_url: string;
  width: number;
  height: number;
  group: string;
};

const list = credits as PhotoCredit[];

// Build lookup by filename and by group (in order of appearance).
const byFile = new Map<string, PhotoCredit>();
const byGroup = new Map<string, PhotoCredit[]>();
for (const c of list) {
  byFile.set(c.file, c);
  const arr = byGroup.get(c.group) ?? [];
  arr.push(c);
  byGroup.set(c.group, arr);
}

// Deterministic pick by seed so SSR/CSR don't mismatch.
function pick<T>(arr: T[], seed: number) {
  if (arr.length === 0) return undefined;
  let h = seed >>> 0;
  h = (h * 131542391) >>> 0;
  return arr[h % arr.length];
}

export function getPhoto(file: string): PhotoCredit | undefined {
  return byFile.get(file);
}

export function getPhotoByGroup(group: string, seed = 0): PhotoCredit | undefined {
  return pick(byGroup.get(group) ?? [], seed);
}

export function getPhotosByGroup(group: string): PhotoCredit[] {
  return byGroup.get(group) ?? [];
}

// Curated picks for the redesign.
export const HERO_PHOTOS = ['hero-01.jpg', 'hero-02.jpg'];
export const REEF_PHOTOS = ['reef-05.jpg', 'reef2-59.jpg', 'reef2-62.jpg', 'reefscape-94.jpg'];
export const TURTLE_PHOTOS = ['turtle-11.jpg', 'turtle2-65.jpg', 'snorkeler-42.jpg'];
export const SHARK_PHOTOS = ['shark-18.jpg', 'shark2-87.jpg', 'shark-16.jpg'];
export const MANTA_PHOTOS = ['manta-12.jpg', 'manta2-70.jpg'];
export const DOLPHIN_PHOTOS = ['dolphin-15.jpg', 'dolphin2-67.jpg'];
export const BEACH_PHOTOS = ['beach-77.jpg', 'beach-78.jpg', 'sand2-91.jpg'];
export const BOAT_PHOTOS = ['boat-81.jpg', 'boat-83.jpg'];
export const KELP_PHOTOS = ['kelp-19.jpg', 'kelp-20.jpg'];
export const CORAL_PHOTOS = ['reef2-61.jpg', 'reef2-58.jpg'];

export function photoSrc(file: string) {
  return `/img/${file}`;
}

export function photoAlt(c: PhotoCredit) {
  // Use the title if it's descriptive; otherwise a generic alt.
  const t = c.title || '';
  if (/^[A-Z][a-z]+ [a-z]+/.test(t) && t.length < 80) return t;
  return 'Snorkeling and coral reef scene';
}
