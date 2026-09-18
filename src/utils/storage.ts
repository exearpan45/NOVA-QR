import { AppSettings, QRHistoryItem } from '../types';
import { DEFAULT_STYLE } from './qrPresets';

const STORAGE_KEYS = {
  HISTORY: 'nova_qr_history',
  SETTINGS: 'nova_qr_settings',
  THEME: 'nova_qr_theme',
  HAS_SEEN_SPLASH: 'nova_qr_seen_splash_session',
};

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  defaultSize: 512,
  defaultPreset: 'midnight',
  defaultErrorCorrection: 'Q',
};

export function getStoredTheme(): 'dark' | 'light' | 'system' {
  try {
    const theme = localStorage.getItem(STORAGE_KEYS.THEME);
    if (theme === 'light' || theme === 'dark' || theme === 'system') {
      return theme;
    }
  } catch {
    // ignore
  }
  return 'dark';
}

export function setStoredTheme(theme: 'dark' | 'light' | 'system'): void {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  } catch {
    // ignore
  }
}

export function getStoredSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch {
    // ignore
  }
  return DEFAULT_SETTINGS;
}

export function setStoredSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

export function getStoredHistory(): QRHistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return [];
}

export function saveHistoryItem(item: Omit<QRHistoryItem, 'id' | 'timestamp' | 'isFavorite'>): QRHistoryItem {
  const history = getStoredHistory();
  // Check if identical content exists recently, remove to place at top
  const filtered = history.filter((h) => h.content !== item.content);

  const newItem: QRHistoryItem = {
    ...item,
    id: 'qr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    timestamp: Date.now(),
    isFavorite: false,
  };

  const updated = [newItem, ...filtered].slice(0, 50); // Keep last 50
  try {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
  } catch {
    // ignore
  }
  return newItem;
}

export function toggleFavoriteItem(id: string): QRHistoryItem[] {
  const history = getStoredHistory();
  const updated = history.map((item) => {
    if (item.id === id) {
      return { ...item, isFavorite: !item.isFavorite };
    }
    return item;
  });
  try {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
  } catch {
    // ignore
  }
  return updated;
}

export function deleteHistoryItem(id: string): QRHistoryItem[] {
  const history = getStoredHistory();
  const updated = history.filter((item) => item.id !== id);
  try {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
  } catch {
    // ignore
  }
  return updated;
}

export function clearAllHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
  } catch {
    // ignore
  }
}

export function clearAllFavorites(): QRHistoryItem[] {
  const history = getStoredHistory();
  const updated = history.map((h) => ({ ...h, isFavorite: false }));
  try {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
  } catch {
    // ignore
  }
  return updated;
}

export function resetAllAppSettings(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.THEME);
  } catch {
    // ignore
  }
}
