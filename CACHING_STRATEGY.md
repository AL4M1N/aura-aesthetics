# Efficient Caching Strategy for Aura Aesthetics

## Overview
This implements a **multi-layered caching system** that eliminates unnecessary API calls while keeping data fresh.

## Architecture

### 1. **Build-Time Data Fetching** (`scripts/prefetch-api-data.js`)
- Runs during build process
- Fetches all key API endpoints
- Generates `data-manifest.json` 
- Captures ETags for change detection
- **Result:** Pre-fetched data ready before app loads

**Usage:**
```bash
# Add to package.json scripts:
"build": "node scripts/prefetch-api-data.js && vite build"
```

### 2. **localStorage Persistence** (`usePersistentCache` hook)
- **On app startup:** `initializeCacheFromManifest()` seeds localStorage with build-time data
- **Instant availability:** No loading screen for cached data
- **Survives reload:** Data persists across page refreshes
- **Automatic fallback:** Falls back to runtime fetch if manifest missing

### 3. **Background Revalidation** (Periodic checks)
- Checks every `revalidateInterval` (default: 10 min)
- Lightweight validation before refetching
- Only fetches if data is stale (`ttl` exceeded)
- Updates localStorage automatically

### 4. **Smart Cache State**
```typescript
{
  data: T                  // The cached data
  error?: unknown          // Any fetch error
  loading: boolean         // Currently fetching?
  isCached: boolean        // Was this from cache?
  isStale: boolean         // Older than TTL?
  refresh: () => Promise   // Manual refresh function
}
```

## Data Flow

```
1. APP START
   ↓
   initializeCacheFromManifest()
   ↓
   localStorage seeded ← [data-manifest.json from build]
   ↓
   usePersistentCache(key, fetcher, options)
   ↓
   FAST: Return localStorage data immediately (no loading)
   ↓
   BACKGROUND: Schedule revalidation check
   
2. PERIODIC REVALIDATION (every revalidateInterval)
   ↓
   Check if data is stale
   ↓
   If stale → Fetch from API
   ↓
   Update localStorage + UI

3. MANUAL REFRESH
   ↓
   refresh() → Force fetch + update cache
```

## Usage Example

### Home Page
```tsx
const { data: homeContent, loading, isStale } = usePersistentCache(
  'home-content',
  fetchHomeContent,
  {
    ttl: 30 * 60 * 1000,           // 30 min before marked stale
    persistToLocalStorage: true,    // Save to localStorage
    revalidateInterval: 15 * 60 * 1000, // Check every 15 min
  },
);

// On first visit: instant data from localStorage
// Background: quietly checks for updates
// User sees: no loading spinner, fresh data
```

### Booking Page
```tsx
const { data: services, loading, refresh } = usePersistentCache(
  'booking-services',
  fetchActiveServices,
  {
    ttl: 60 * 60 * 1000,           // Cache for 1 hour
    persistToLocalStorage: true,
    revalidateInterval: 30 * 60 * 1000,
  },
);

// User can manually refresh if needed:
// <button onClick={refresh}>Refresh Services</button>
```

## Configuration Options

| Option | Type | Default | Purpose |
|--------|------|---------|---------|
| `ttl` | ms | 5 min | How long before data is marked stale |
| `persistToLocalStorage` | bool | true | Save to localStorage for persistence |
| `revalidateInterval` | ms | 10 min | How often to check for updates |
| `fallbackData` | T | undefined | Show this if fetch fails |

## Storage Size Concerns

localStorage has ~5-10MB limit per domain. Monitor usage:

```typescript
import { getCacheStats, clearAllCache } from '@/lib/cacheInitializer';

// Check current usage
const stats = getCacheStats();
console.log(`Using ${stats.totalSizeMB}MB in ${stats.totalEntries} entries`);

// Clear all cache if needed
clearAllCache();
```

## Environment Setup

1. **Development:**
   ```bash
   npm run dev
   # Fetches data at runtime (no build step)
   # Uses in-memory + localStorage cache
   ```

2. **Production Build:**
   ```bash
   npm run build
   # Step 1: node scripts/prefetch-api-data.js
   #   → Fetches and stores data in .cache/data-manifest.json
   # Step 2: vite build
   #   → Includes manifest in public assets
   # Result: Zero API calls on app load
   ```

3. **Copy manifest to public:**
   ```bash
   # Ensure .cache/data-manifest.json is copied to public/
   # Update package.json build script:
   "build": "node scripts/prefetch-api-data.js && cp .cache/data-manifest.json public/ && vite build"
   ```

## Advantages

✅ **Zero API calls on page load** (for cached endpoints)
✅ **Instant data availability** (from localStorage)
✅ **Automatic background updates** (periodic revalidation)
✅ **Works offline** (if data previously cached)
✅ **Reduced server load** (fewer redundant requests)
✅ **Better user experience** (no loading spinners for known data)
✅ **Bandwidth efficient** (only fetch if changed)

## Next Steps (Optional Enhancements)

1. **ETag support:** Use HTTP ETags to skip unnecessary downloads
2. **Service Worker:** Deeper offline support + cache expiry
3. **Differential updates:** Only fetch changed fields
4. **Analytics:** Track cache hit ratio to optimize TTLs
5. **Admin interface:** Manual cache invalidation dashboard
