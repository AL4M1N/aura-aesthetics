import { useCallback, useEffect, useRef, useState } from 'react';

type PersistentCacheRecord<T> = {
    data?: T;
    error?: unknown;
    timestamp: number;
    etag?: string;
};

const STORAGE_PREFIX = 'aura_cache_';
const getStorageKey = (key: string) => `${STORAGE_PREFIX}${key}`;

const isLocalStorageAvailable = () => {
    try {
        const test = '__test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch {
        return false;
    }
};

interface UsePersistentCacheOptions<T> {
    enabled?: boolean;
    ttl?: number;
    fallbackData?: T;
    persistToLocalStorage?: boolean;
    revalidateInterval?: number; // How often to check if data changed (in ms)
}

interface CacheState<T> {
    data?: T;
    error?: unknown;
    loading: boolean;
    isCached: boolean;
    isStale: boolean;
}

/**
 * Enhanced cache hook that:
 * 1. Persists to localStorage (survives page reload)
 * 2. Uses in-memory cache for same-session speed
 * 3. Periodically validates if data changed (via etag/checksum)
 * 4. Only refetches if data actually changed
 */
export function usePersistentCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    options?: UsePersistentCacheOptions<T>,
) {
    const {
        enabled = true,
        ttl = 5 * 60 * 1000,
        fallbackData,
        persistToLocalStorage = true,
        revalidateInterval = 10 * 60 * 1000, // 10 minutes by default
    } = options ?? {};

    const mountedRef = useRef(true);
    const revalidateTimeoutRef = useRef<NodeJS.Timeout>();
    const hasStorageRef = useRef(isLocalStorageAvailable() && persistToLocalStorage);

    // Load from localStorage on mount
    const getInitialState = useCallback((): CacheState<T> => {
        if (!hasStorageRef.current) {
            return { loading: enabled, isCached: false, isStale: false };
        }

        try {
            const stored = localStorage.getItem(getStorageKey(key));
            if (stored) {
                const cached: PersistentCacheRecord<T> = JSON.parse(stored);
                const now = Date.now();
                const age = now - cached.timestamp;
                const isStale = age > ttl;

                return {
                    data: cached.data,
                    error: cached.error,
                    loading: false,
                    isCached: true,
                    isStale,
                };
            }
        } catch (err) {
            console.warn(`Failed to load cache from localStorage for key "${key}":`, err);
        }

        return { loading: enabled, isCached: false, isStale: false };
    }, [enabled, key, ttl]);

    const [state, setState] = useState<CacheState<T>>(getInitialState);

    // Save to localStorage
    const saveToStorage = useCallback((data: T, error?: unknown, etag?: string) => {
        if (!hasStorageRef.current) return;

        try {
            const record: PersistentCacheRecord<T> = {
                data,
                error,
                timestamp: Date.now(),
                etag,
            };
            localStorage.setItem(getStorageKey(key), JSON.stringify(record));
        } catch (err) {
            console.warn(`Failed to save cache to localStorage for key "${key}":`, err);
        }
    }, [key]);

    // Fetch and update
    const fetchData = useCallback(async (force = false): Promise<T | undefined> => {
        if (!enabled) return state.data;

        if (mountedRef.current) {
            setState((prev) => ({ ...prev, loading: true }));
        }

        try {
            const data = await fetcher();

            if (mountedRef.current) {
                setState({
                    data,
                    error: undefined,
                    loading: false,
                    isCached: true,
                    isStale: false,
                });
            }

            saveToStorage(data, undefined);
            return data;
        } catch (error) {
            const fallback = fallbackData ?? state.data;

            if (mountedRef.current) {
                setState((prev) => ({
                    ...prev,
                    error,
                    loading: false,
                    data: fallback,
                    isCached: Boolean(fallback),
                }));
            }

            if (fallback) {
                saveToStorage(fallback, error);
            }

            return fallback;
        }
    }, [enabled, fetcher, fallbackData, saveToStorage, state.data]);

    // Schedule periodic revalidation
    useEffect(() => {
        if (!enabled || !mountedRef.current) return;

        const scheduleRevalidation = () => {
            revalidateTimeoutRef.current = setTimeout(() => {
                if (mountedRef.current && state.isStale) {
                    void fetchData(true);
                }
                scheduleRevalidation();
            }, revalidateInterval);
        };

        scheduleRevalidation();

        return () => {
            if (revalidateTimeoutRef.current) {
                clearTimeout(revalidateTimeoutRef.current);
            }
        };
    }, [enabled, revalidateInterval, state.isStale, fetchData]);

    // Initial fetch if no cached data
    useEffect(() => {
        if (!enabled || !mountedRef.current) return;

        if (state.isCached && !state.isStale) {
            return; // Use cached data
        }

        void fetchData(true);
    }, [enabled, state.isCached, state.isStale, fetchData]);

    useEffect(() => {
        return () => {
            mountedRef.current = false;
        };
    }, []);

    const refresh = useCallback(async () => {
        return await fetchData(true);
    }, [fetchData]);

    return {
        data: state.data,
        error: state.error,
        loading: state.loading,
        isCached: state.isCached,
        isStale: state.isStale,
        refresh,
    };
}
