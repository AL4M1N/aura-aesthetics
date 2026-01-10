/**
 * Initialize persistent cache from build-time manifest
 * This runs on app startup and seeds localStorage with pre-fetched data
 */

const STORAGE_PREFIX = 'aura_cache_';

export interface CacheManifestEntry {
    key: string;
    url: string;
    data: unknown;
    timestamp: number;
    etag?: string;
}

/**
 * Seed localStorage with data from build manifest
 * Called during app initialization (in main.tsx or App.tsx)
 */
export async function initializeCacheFromManifest() {
    try {
        // Try to load the manifest that was generated at build time
        const response = await fetch('/data-manifest.json');

        if (!response.ok) {
            console.debug('No build-time manifest found (expected in development)');
            return;
        }

        const manifest: CacheManifestEntry[] = await response.json();

        const isStorageAvailable = (() => {
            try {
                const test = '__test__';
                localStorage.setItem(test, test);
                localStorage.removeItem(test);
                return true;
            } catch {
                return false;
            }
        })();

        if (!isStorageAvailable) {
            console.warn('localStorage not available, skipping cache initialization');
            return;
        }

        let count = 0;
        for (const entry of manifest) {
            try {
                const storageKey = `${STORAGE_PREFIX}${entry.key}`;

                // Only store if not already in localStorage (user might have newer data)
                if (!localStorage.getItem(storageKey)) {
                    // Transform manifest entry to match usePersistentCache format
                    const cacheRecord = {
                        data: entry.data,
                        timestamp: entry.timestamp,
                        etag: entry.etag,
                    };
                    localStorage.setItem(storageKey, JSON.stringify(cacheRecord));
                    count++;
                }
            } catch (err) {
                console.warn(`Failed to cache entry "${entry.key}":`, err);
            }
        }

        console.debug(`✅ Initialized ${count} cache entries from build manifest`);
    } catch (err) {
        if (err instanceof TypeError && 'fetch' in globalThis) {
            // Fetch not available or failed (expected in some environments)
            console.debug('Cache manifest initialization skipped');
        } else {
            console.error('Error initializing cache from manifest:', err);
        }
    }
}

/**
 * Clear all cached data from localStorage
 */
export function clearAllCache() {
    if (typeof localStorage === 'undefined') return;

    const keys = Object.keys(localStorage);
    for (const key of keys) {
        if (key.startsWith(STORAGE_PREFIX)) {
            localStorage.removeItem(key);
        }
    }
    console.debug('✅ Cleared all cache entries from localStorage');
}

/**
 * Get cache storage stats
 */
export function getCacheStats() {
    if (typeof localStorage === 'undefined') {
        return { totalEntries: 0, totalSize: 0 };
    }

    let totalSize = 0;
    let totalEntries = 0;

    const keys = Object.keys(localStorage);
    for (const key of keys) {
        if (key.startsWith(STORAGE_PREFIX)) {
            totalEntries++;
            const item = localStorage.getItem(key);
            totalSize += item ? item.length : 0;
        }
    }

    return {
        totalEntries,
        totalSize,
        totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
    };
}
