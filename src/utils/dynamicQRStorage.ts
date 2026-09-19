import { DynamicQRCode, ScanEvent } from '../types';

const DYNAMIC_QR_KEY = 'nova_dynamic_qr_codes';
const SCAN_EVENTS_KEY = 'nova_qr_scan_events';

export const INITIAL_DYNAMIC_QRS: DynamicQRCode[] = [
  {
    id: 'dyn-landing-01',
    slug: 'portfolio-hub',
    title: 'Arpan Portfolio & Projects Hub',
    destinationUrl: 'https://arpangoswami.dev',
    description: 'Main redirect for promotional stickers and conference badges',
    category: 'Website',
    isActive: true,
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    totalScans: 142,
    lastScannedAt: new Date(Date.now() - 45 * 60000).toISOString(),
  },
  {
    id: 'dyn-menu-02',
    slug: 'summer-menu',
    title: 'Digital Restaurant Menu & Specials',
    destinationUrl: 'https://example.com/menu/summer-2026',
    description: 'Table tent QR codes - updated weekly with daily specials',
    category: 'Restaurant',
    isActive: true,
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    totalScans: 389,
    lastScannedAt: new Date(Date.now() - 12 * 60000).toISOString(),
  },
  {
    id: 'dyn-campaign-03',
    slug: 'vip-discount',
    title: 'VIP Promo Discount 20% Off',
    destinationUrl: 'https://example.com/promo/vip-secret',
    description: 'Flyer campaign with editable voucher destination',
    category: 'Marketing',
    isActive: true,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    totalScans: 88,
    lastScannedAt: new Date(Date.now() - 180 * 60000).toISOString(),
  },
];

export function getStoredDynamicQRs(): DynamicQRCode[] {
  try {
    const raw = localStorage.getItem(DYNAMIC_QR_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return INITIAL_DYNAMIC_QRS;
}

export function saveDynamicQRCode(qr: DynamicQRCode): DynamicQRCode[] {
  const current = getStoredDynamicQRs();
  const existingIdx = current.findIndex((item) => item.id === qr.id);
  let updated: DynamicQRCode[];

  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = { ...qr, updatedAt: new Date().toISOString() };
  } else {
    updated = [{ ...qr, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...current];
  }

  try {
    localStorage.setItem(DYNAMIC_QR_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
  return updated;
}

export function deleteDynamicQRCode(id: string): DynamicQRCode[] {
  const current = getStoredDynamicQRs();
  const updated = current.filter((item) => item.id !== id);
  try {
    localStorage.setItem(DYNAMIC_QR_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
  return updated;
}

export function toggleDynamicActive(id: string): DynamicQRCode[] {
  const current = getStoredDynamicQRs();
  const updated = current.map((item) => {
    if (item.id === id) {
      return { ...item, isActive: !item.isActive, updatedAt: new Date().toISOString() };
    }
    return item;
  });
  try {
    localStorage.setItem(DYNAMIC_QR_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
  return updated;
}

// Analytics and Scan Events
export function getStoredScanEvents(): ScanEvent[] {
  try {
    const raw = localStorage.getItem(SCAN_EVENTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }

  // Generate realistic sample scan events across past 7 days
  const sampleEvents: ScanEvent[] = [];
  const devices: ('iOS' | 'Android' | 'Desktop')[] = ['iOS', 'Android', 'iOS', 'Desktop', 'Android', 'iOS'];
  const locations = [
    { country: 'United States', city: 'San Francisco' },
    { country: 'United States', city: 'New York' },
    { country: 'India', city: 'Bengaluru' },
    { country: 'United Kingdom', city: 'London' },
    { country: 'Germany', city: 'Berlin' },
    { country: 'Canada', city: 'Toronto' },
    { country: 'Japan', city: 'Tokyo' },
  ];
  const browsers = ['Mobile Safari', 'Chrome Mobile', 'Firefox', 'Samsung Internet', 'Edge'];

  const now = Date.now();
  for (let i = 0; i < 60; i++) {
    const hoursAgo = Math.floor(Math.random() * 168); // within 7 days
    const dev = devices[i % devices.length];
    const loc = locations[i % locations.length];
    sampleEvents.push({
      id: `scan-${i}-${now}`,
      dynamicCodeId: i % 3 === 0 ? 'dyn-landing-01' : i % 3 === 1 ? 'dyn-menu-02' : 'dyn-campaign-03',
      codeTitle: i % 3 === 0 ? 'Arpan Portfolio & Projects Hub' : i % 3 === 1 ? 'Digital Restaurant Menu & Specials' : 'VIP Promo Discount 20% Off',
      timestamp: new Date(now - hoursAgo * 3600000).toISOString(),
      deviceType: dev,
      browser: browsers[i % browsers.length],
      country: loc.country,
      city: loc.city,
    });
  }

  sampleEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  try {
    localStorage.setItem(SCAN_EVENTS_KEY, JSON.stringify(sampleEvents));
  } catch {
    // ignore
  }

  return sampleEvents;
}

export function recordScanEvent(dynamicCodeId: string, title?: string): ScanEvent[] {
  const currentEvents = getStoredScanEvents();
  const currentCodes = getStoredDynamicQRs();

  const code = currentCodes.find((c) => c.id === dynamicCodeId);
  const codeTitle = title || code?.title || 'Dynamic QR Code';

  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  let deviceType: 'iOS' | 'Android' | 'Desktop' | 'Other' = 'Desktop';
  if (/iPhone|iPad|iPod/i.test(userAgent)) deviceType = 'iOS';
  else if (/Android/i.test(userAgent)) deviceType = 'Android';

  const newEvent: ScanEvent = {
    id: `scan-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    dynamicCodeId,
    codeTitle,
    timestamp: new Date().toISOString(),
    deviceType,
    browser: /Chrome/i.test(userAgent) ? 'Chrome' : /Safari/i.test(userAgent) ? 'Safari' : 'Browser',
    country: 'United States',
    city: 'San Francisco',
  };

  const updatedEvents = [newEvent, ...currentEvents];

  // Also increment totalScans on the dynamic code
  const updatedCodes = currentCodes.map((c) => {
    if (c.id === dynamicCodeId) {
      return {
        ...c,
        totalScans: c.totalScans + 1,
        lastScannedAt: new Date().toISOString(),
      };
    }
    return c;
  });

  try {
    localStorage.setItem(SCAN_EVENTS_KEY, JSON.stringify(updatedEvents));
    localStorage.setItem(DYNAMIC_QR_KEY, JSON.stringify(updatedCodes));
  } catch {
    // ignore
  }

  return updatedEvents;
}
