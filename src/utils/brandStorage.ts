import { BrandKit } from '../types';

const BRAND_STORAGE_KEY = 'nova_qr_brand_kits';

export const DEFAULT_BRAND_KITS: BrandKit[] = [
  {
    id: 'brand-nova-default',
    name: 'NOVA Cyan Signature',
    dotColor: '#06b6d4',
    dotType: 'rounded',
    cornerSquareColor: '#0284c7',
    cornerSquareType: 'extra-rounded',
    cornerDotColor: '#38bdf8',
    cornerDotType: 'dot',
    backgroundColor: '#020617',
    errorCorrection: 'Q',
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'brand-purple-elegance',
    name: 'Neon Violet Pro',
    dotColor: '#a855f7',
    dotType: 'classy',
    cornerSquareColor: '#7c3aed',
    cornerSquareType: 'extra-rounded',
    cornerDotColor: '#c084fc',
    cornerDotType: 'dot',
    backgroundColor: '#0f0728',
    errorCorrection: 'H',
    isDefault: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'brand-emerald-clean',
    name: 'Emerald Minimalist',
    dotColor: '#10b981',
    dotType: 'dots',
    cornerSquareColor: '#059669',
    cornerSquareType: 'dot',
    cornerDotColor: '#34d399',
    cornerDotType: 'dot',
    backgroundColor: '#022c22',
    errorCorrection: 'Q',
    isDefault: false,
    createdAt: new Date().toISOString(),
  },
];

export function getStoredBrandKits(): BrandKit[] {
  try {
    const raw = localStorage.getItem(BRAND_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return DEFAULT_BRAND_KITS;
}

export function saveBrandKit(kit: BrandKit): BrandKit[] {
  const current = getStoredBrandKits();
  const existingIdx = current.findIndex((k) => k.id === kit.id);
  let updated: BrandKit[];

  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = kit;
  } else {
    updated = [kit, ...current];
  }

  try {
    localStorage.setItem(BRAND_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
  return updated;
}

export function deleteBrandKit(id: string): BrandKit[] {
  const current = getStoredBrandKits();
  const updated = current.filter((k) => k.id !== id);
  try {
    localStorage.setItem(BRAND_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
  return updated;
}
