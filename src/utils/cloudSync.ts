import { User } from '@supabase/supabase-js';
import { QRHistoryItem } from '../types';
import { supabase } from '../lib/supabase';
import { getStoredHistory, setStoredHistory } from './storage';

export interface SyncResult {
  success: boolean;
  syncedCount: number;
  newFromCloudCount: number;
  mergedItems: QRHistoryItem[];
  timestamp: number;
  error?: string;
}

/**
 * Merge local history items and cloud history items intelligently:
 * - Deduplicates by content and type
 * - Preserves favorite status if favorited in either place
 * - Keeps newest timestamp
 * - Orders by timestamp descending
 */
export function mergeHistoryItems(local: QRHistoryItem[], cloud: QRHistoryItem[]): QRHistoryItem[] {
  const map = new Map<string, QRHistoryItem>();

  // Process cloud first, then local
  const combined = [...cloud, ...local];

  for (const item of combined) {
    // Generate a deterministic key based on content & category
    const key = `${item.type}::${item.content.trim()}`;

    if (!map.has(key)) {
      map.set(key, { ...item });
    } else {
      const existing = map.get(key)!;
      // Merge best attributes
      const isFavorite = existing.isFavorite || item.isFavorite;
      const latestTimestamp = Math.max(existing.timestamp, item.timestamp);
      // Keep richer style if available
      const style = item.style || existing.style;
      const title = (item.title && item.title !== 'QR Code') ? item.title : existing.title;

      map.set(key, {
        ...existing,
        id: existing.id || item.id,
        title,
        timestamp: latestTimestamp,
        isFavorite,
        style,
      });
    }
  }

  // Convert to array and sort newest first, max 100 items
  return Array.from(map.values())
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 100);
}

/**
 * Automatically syncs local history with the user's Supabase cloud account upon login
 */
export async function syncHistoryWithCloud(user: User): Promise<SyncResult> {
  if (!user) {
    return {
      success: false,
      syncedCount: 0,
      newFromCloudCount: 0,
      mergedItems: getStoredHistory(),
      timestamp: Date.now(),
      error: 'User not authenticated',
    };
  }

  try {
    const localItems = getStoredHistory();
    const rawCloudItems = user.user_metadata?.synced_history;
    let cloudItems: QRHistoryItem[] = [];

    if (Array.isArray(rawCloudItems)) {
      cloudItems = rawCloudItems;
    }

    // Merge both sources
    const merged = mergeHistoryItems(localItems, cloudItems);

    // Count how many new items came from cloud
    const localIds = new Set(localItems.map((i) => i.id));
    const newFromCloud = merged.filter((i) => !localIds.has(i.id)).length;

    // 1. Update local storage
    setStoredHistory(merged);

    // 2. Push merged state back to user metadata in Supabase (if online session)
    if (!user.id.startsWith('local_usr_')) {
      try {
        await supabase.auth.updateUser({
          data: {
            synced_history: merged,
            last_synced_at: new Date().toISOString(),
            total_synced_history_count: merged.length,
          },
        });
      } catch (cloudPushErr) {
        console.warn('Could not push metadata to cloud:', cloudPushErr);
      }
    }

    return {
      success: true,
      syncedCount: merged.length,
      newFromCloudCount: newFromCloud,
      mergedItems: merged,
      timestamp: Date.now(),
    };
  } catch (err: any) {
    console.error('Error auto-syncing history with Supabase:', err);
    return {
      success: false,
      syncedCount: 0,
      newFromCloudCount: 0,
      mergedItems: getStoredHistory(),
      timestamp: Date.now(),
      error: err?.message || 'Failed to sync with cloud',
    };
  }
}

/**
 * Pushes updated history to Supabase cloud in background
 */
export async function pushHistoryToCloud(user: User | null, items: QRHistoryItem[]): Promise<void> {
  if (!user) return;
  try {
    await supabase.auth.updateUser({
      data: {
        synced_history: items.slice(0, 100),
        last_synced_at: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.warn('Failed background cloud history push:', err);
  }
}
