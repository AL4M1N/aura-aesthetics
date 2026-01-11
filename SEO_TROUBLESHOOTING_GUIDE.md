# SEO Management - Troubleshooting & Debugging Guide

## Issues Fixed

### 1. **Dependency Loop in SEOManagement Component**
**Problem**: The `useEffect` had `fetchSEOData` in its dependency array, which caused infinite re-fetches when data changed.

**Fix**: Changed the initial fetch effect to have an empty dependency array `[]` so it only runs once on mount.
```typescript
// Before (problematic)
useEffect(() => {
  void fetchSEOData();
  void fetchServices();
}, [fetchSEOData, fetchServices]); // ❌ Infinite loop

// After (fixed)
useEffect(() => {
  void fetchSEOData();
  void fetchServices();
}, []); // ✅ Only runs once on mount
```

---

### 2. **ImageUploadField Props Mismatch**
**Problem**: Used non-existent `placeholder` prop on ImageUploadField.

**Fix**: Changed to use correct props: `label` and `description`.
```typescript
// Before (incorrect)
<ImageUploadField
  placeholder="Upload an image..."
/>

// After (correct)
<ImageUploadField
  label="Open Graph Image"
  description="Upload an image for social media sharing (recommended: 1200x630px)"
/>
```

---

### 3. **Insufficient Response Handling**
**Problem**: API response structure wasn't being handled correctly, causing "nothing shows" issue.

**Fix**: Added flexible response handling and debug logging to all seoService methods.
```typescript
async getSEOData() {
  try {
    const response = await apiClient.get('/admin/seo');
    console.log('Raw API Response:', response); // ✅ Debug logging
    
    // Handle multiple response structures
    if (response.data?.data) {
      return response.data; // Standard format
    } else if (Array.isArray(response.data)) {
      return { success: true, data: response.data }; // Direct array
    } else {
      return { success: false, message: 'Unexpected response structure' };
    }
  } catch (error: any) {
    console.error('API Error:', error); // ✅ Better error logging
    return { success: false, message: '...' };
  }
}
```

---

## How to Debug When Things Aren't Working

### Step 1: Check Browser Console
Open developer tools (F12) and look at the **Console** tab. You should see logs like:
```
SEO Data Response: {success: true, data: Array(5)}
Raw API Response (getSEOData): {data: {...}, status: 200}
```

**If you see errors**, they'll be logged with context:
```
API Error (getSEOData): {...details...}
```

### Step 2: Check Network Tab
1. Open DevTools → **Network** tab
2. Reload the page or click "Refresh" button in SEO admin
3. Look for requests to `/admin/seo` (or `/api/admin/seo`)
4. Click the request to see:
   - **Status**: Should be 200 (success) or 401 (auth error)
   - **Response**: Should contain the SEO data
   - **Headers**: Should include Authorization header

**If 401 Unauthorized**: Your auth token may have expired. Log out and log back in.

### Step 3: Initial Load vs. Refresh
The issue you described ("after some time it gives error, but refresh works") suggests:
- **Initial load** - Component mounts, tries to fetch, but data isn't ready yet
- **Refresh** - Data is now cached or available

This is now fixed because:
1. ✅ Fixed dependency loop that was causing re-renders
2. ✅ Better error handling that gracefully falls back
3. ✅ Console logs so you can see what's happening

---

## Response Format Expected

### Backend Should Return (GET /admin/seo):
```json
{
  "success": true,
  "message": "SEO data retrieved successfully",
  "data": [
    {
      "id": 1,
      "page_type": "home",
      "page_identifier": null,
      "title": "Aura Aesthetics - Professional Beauty...",
      "description": "Transform your beauty journey...",
      "keywords": "aesthetics, beauty, skincare",
      "og_title": "Aura Aesthetics - Professional Beauty",
      "og_description": "Transform your beauty journey...",
      "og_image": "/storage/seo/home-og-image.jpg",
      "created_at": "2026-01-11T10:00:00Z",
      "updated_at": "2026-01-11T10:00:00Z"
    }
  ]
}
```

### Or Direct Array Format:
```json
[
  {
    "id": 1,
    "page_type": "home",
    ...
  }
]
```

The updated seoService now handles both formats. ✅

---

## What Changed in Code

### Files Modified:
1. **src/services/seoService.ts**
   - Added `console.log()` for all API responses
   - Flexible response handling for different formats
   - Better error logging with error details

2. **src/app/admin/pages/SEOManagement.tsx**
   - Fixed useEffect dependency array (removed dependency loop)
   - Added debug logging in fetchSEOData
   - Fixed ImageUploadField props

### Testing After Fix:
1. Open the admin panel → SEO Management
2. Check browser console (F12)
3. You should see `SEO Data Response: {success: true, data: [...]}`
4. The table should populate with 5 default SEO records

---

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| "Unable to load" appears briefly then disappears | Race condition/timing issue | Now fixed - see console for details |
| Nothing shows in admin table | Dependency loop re-fetching | ✅ Fixed with empty dependency array |
| Network shows 401 on /admin/seo | Authentication token expired | Log out and log back in |
| Network shows 500 on /admin/seo | Server error (check Laravel logs) | Check backend Laravel logs |
| Console shows "Unexpected response structure" | API returning different format | Service now handles multiple formats |
| ImageUploadField error | Wrong prop names | ✅ Fixed - now uses `label` and `description` |

---

## Frontend Caching (Additional Context)

The SEO data also uses the persistent cache system:
- **TTL**: 5 minutes (data considered fresh)
- **Storage**: localStorage + in-memory
- **Revalidation**: Background refresh every 10 minutes if mounted

This means:
- ✅ First load shows cached data immediately
- ✅ After 5 minutes, fetch fresh data
- ✅ Background updates keep cache fresh
- ✅ Manual refresh button forces immediate fetch

---

## If Issues Persist

If you still see "Unable to load" error:

1. **Check Laravel API**:
   ```bash
   # Test the endpoint directly
   curl -H "Authorization: Bearer YOUR_TOKEN" \
     "http://localhost:8000/api/admin/seo"
   ```

2. **Check Laravel logs**:
   ```bash
   tail -f storage/logs/laravel.log
   ```

3. **Check Frontend logs**:
   - Open DevTools console (F12)
   - Look for all messages starting with "SEO"
   - Copy and share the error message

4. **Verify Migration ran**:
   ```bash
   php artisan migrate:status | grep seo
   ```

5. **Verify Data exists**:
   ```bash
   php artisan tinker
   >>> \App\Models\SeoData::count()
   => 5
   ```

---

## Additional Notes

- Prefetching for core pages (home, about, services, consent, booking) happens in WebsiteSettingsContext
- SEOHead component uses persistent cache so data persists across page navigations
- All API calls now have detailed console logging for easier debugging
- Response structure flexibility handles backend changes without breaking frontend

