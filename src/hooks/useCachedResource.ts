import { useCallback, useEffect, useRef, useState } from 'react';

type CacheRecord<T> = {
    data?: T;
    error?: unknown;
    timestamp: number;
    promise?: Promise<T>;
};

const resourceCache = new Map<string, CacheRecord<unknown>>();

const isFresh = (entry: CacheRecord<unknown> | undefined, ttl: number) => {
    if (!entry || entry.data === undefined) {
        return false;
    }
    if (!ttl) {
        return true;
    }
    return Date.now() - entry.timestamp < ttl;
};

export interface UseCachedResourceOptions<T> {
    enabled?: boolean;
    ttl?: number;
    fallbackData?: T;
    revalidateOnMount?: boolean;
}

interface ResourceState<T> {
    data?: T;
    error?: unknown;
    loading: boolean;
    isCached: boolean;
}

export const invalidateCachedResource = (key?: string) => {
    if (!key) {
        resourceCache.clear();
        return;
    }
    resourceCache.delete(key);
};

export function useCachedResource<T>(
    key: string,
    fetcher: () => Promise<T>,
    options?: UseCachedResourceOptions<T>,
) {
    const { enabled = true, ttl = 5 * 60 * 1000, fallbackData, revalidateOnMount = false } = options ?? {};
    const cachedEntry = resourceCache.get(key) as CacheRecord<T> | undefined;
    const mountedRef = useRef(true);

    const [state, setState] = useState<ResourceState<T>>({
        data: cachedEntry?.data,
        error: cachedEntry?.error,
        loading: enabled && !cachedEntry?.data,
        isCached: Boolean(cachedEntry?.data),
    });

    useEffect(() => {
        return () => {
            mountedRef.current = false;
        };
    }, []);

    const runFetch = useCallback(async (force = false): Promise<T | undefined> => {
        if (!enabled) {
            return (resourceCache.get(key) as CacheRecord<T> | undefined)?.data;
        }

        const entry = resourceCache.get(key) as CacheRecord<T> | undefined;
        const fresh = isFresh(entry, ttl);

        if (!force && fresh && entry) {
            if (mountedRef.current) {
                setState({ data: entry.data, error: entry.error, loading: false, isCached: true });
            }
            return entry.data;
        }

        if (!force && entry?.promise) {
            if (mountedRef.current) {
                setState((prev) => ({ ...prev, loading: true }));
            }
            try {
                const data = await entry.promise;
                if (mountedRef.current) {
                    setState({ data, error: undefined, loading: false, isCached: true });
                }
                return data;
            } catch (error) {
                if (mountedRef.current) {
                    setState({ data: fallbackData, error, loading: false, isCached: Boolean(fallbackData) });
                }
                return fallbackData;
            }
        }

        if (mountedRef.current) {
            setState((prev) => ({ ...prev, loading: true }));
        }

        const promise = fetcher();
        resourceCache.set(key, {
            data: entry?.data,
            error: undefined,
            timestamp: entry?.timestamp ?? Date.now(),
            promise,
        });

        try {
            const data = await promise;
            resourceCache.set(key, { data, error: undefined, timestamp: Date.now() });
            if (mountedRef.current) {
                setState({ data, error: undefined, loading: false, isCached: true });
            }
            return data;
        } catch (error) {
            const fallback = fallbackData ?? entry?.data;
            if (fallback !== undefined) {
                resourceCache.set(key, { data: fallback, error, timestamp: Date.now() });
            } else {
                resourceCache.delete(key);
            }

            if (mountedRef.current) {
                setState({ data: fallback, error, loading: false, isCached: Boolean(fallback) });
            }
            return fallback;
        }
    }, [enabled, fallbackData, fetcher, key, ttl]);

    useEffect(() => {
        if (!enabled) {
            return;
        }

        const entry = resourceCache.get(key) as CacheRecord<T> | undefined;
        const hasData = entry?.data !== undefined;
        const fresh = isFresh(entry, ttl);

        if (!entry) {
            // No cache entry yet – start a fresh request
            void runFetch(true);
            return;
        }

        if (!hasData) {
            // Reuse any in-flight request instead of starting a new one
            void runFetch(false);
            return;
        }

        if (!fresh || revalidateOnMount) {
            void runFetch(!fresh);
            return;
        }

        if (mountedRef.current) {
            setState({ data: entry.data, error: entry.error, loading: false, isCached: true });
        }
    }, [enabled, key, runFetch, ttl, revalidateOnMount]);

    const refresh = useCallback(async () => {
        resourceCache.delete(key);
        return await runFetch(true);
    }, [key, runFetch]);

    return {
        data: state.data,
        error: state.error,
        loading: state.loading,
        isCached: state.isCached,
        refresh,
    };
}
