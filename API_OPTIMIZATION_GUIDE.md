# API Optimization Guide

## Issues Fixed

### 1. Services Page Empty Content
**Problem**: Services page was showing empty despite API fetching data successfully.

**Root Cause**: The `extractArrayPayload` function wasn't handling all possible API response structures.

**Solution**: Enhanced the function to check multiple common data field patterns:
- Direct array responses
- Nested keys (categories, services, instructions)
- `data` field
- `items` field  
- `results` field
- Added error logging to help debug API response issues

### 2. Repeated API Calls
**Problem**: `/api/services` endpoint being called repeatedly, especially when date changes in booking page.

**Solution**: 
- Added 300ms debounce to availability checks when date changes
- Used `useCachedResource` hook with 10-minute TTL for services listing
- Prevents unnecessary API calls during rapid user interactions

### 3. Mobile Navigation Issues
**Problem**: Nav background and close button not showing correctly when opened from scrolled positions.

**Solution**:
- Added `mobileMenuOpen` condition to header background state
- Applied `z-50` to logo and menu button for proper layering
- Fixed mobile menu positioning with explicit top value (96px)
- Ensured white background shows when mobile menu is open regardless of scroll position

---

## API Loading Strategy Recommendations

### Critical Data (Load Immediately on Page Mount)

#### **Home Page** - `/`
```javascript
// Initial Load (Blocking - show skeleton until ready)
1. GET /api/site-settings
   - Fields: branding (logo, site_title, tagline)
   - Fields: hero (title, subtitle)
   - Used for: Header, Hero section
   
2. GET /api/services/featured?limit=3
   - Fields: id, title, excerpt, featured_image, price_range, slug
   - Used for: Featured services section
```

#### **Services Page** - `/services`
```javascript
// Initial Load (Blocking)
1. GET /api/service-categories?active=true
   - Fields: id, name, slug, sort_order
   - Used for: Service category tabs
   
2. GET /api/services?active=true
   - Fields: id, title, excerpt, featured_image, price_range, 
            duration, category_id, slug, sort_order
   - Used for: Service listings

// Async Load (Non-blocking - show after initial render)
3. GET /api/service-instructions?active=true
   - Fields: id, title, content
   - Used for: Before/After care instructions section
```

#### **Booking Page** - `/booking`
```javascript
// Initial Load (Blocking)
1. GET /api/services?active=true&fields=id,title,price_range,duration
   - Minimal fields for service selection dropdown
   - Cached with 10-minute TTL

2. GET /api/site-settings?section=location
   - Fields: contact_email, contact_phone, whatsapp_link, 
            map_embed_url, address_notes, contact_hours
   - Used for: Location information display

// Async Load (Triggered by user action)
3. GET /api/bookings/availability?date={selected_date}
   - Triggered when: User selects a date
   - Debounced: 300ms
   - Fields: slots[time, available]
   - Used for: Available time slots
```

#### **About Page** - `/about`
```javascript
// Initial Load (Blocking)
1. GET /api/pages/about
   - Fields: hero, story_section, values, team_members, certifications
   - Used for: All page content

// Async Load (Non-blocking - can be lazy loaded)
2. GET /api/testimonials?active=true&limit=6
   - Fields: id, client_name, rating, content, service
   - Used for: Testimonials section (if shown on About)
```

#### **Service Detail Page** - `/services/:slug`
```javascript
// Initial Load (Blocking)
1. GET /api/services/{slug}
   - Fields: Complete service data including benefits, 
            suitability, process_steps, faqs
   - Used for: Full service details

// Async Load (Non-blocking)
2. GET /api/services?category_id={service.category_id}&limit=3
   - Fields: id, title, excerpt, featured_image, slug
   - Used for: Related services section
```

---

## Optimization Strategies

### 1. **Implement Field Selection**
Add field selection support to reduce payload size:

```typescript
// Backend: Support query parameter
GET /api/services?fields=id,title,excerpt,featured_image,price_range

// Response only includes requested fields
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Anti-Wrinkle Injections",
      "excerpt": "Smooth fine lines...",
      "featured_image": "...",
      "price_range": "£200 - £350"
    }
  ]
}
```

### 2. **Pagination for Large Lists**
Implement pagination to avoid loading all data at once:

```typescript
// Services management (admin)
GET /api/admin/services?page=1&per_page=20

// Response includes pagination metadata
{
  "success": true,
  "data": [...],
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 45,
    "total_pages": 3
  }
}
```

### 3. **Cache Strategy**

```typescript
// Frontend caching configuration
const CACHE_TTL = {
  STATIC_CONTENT: 30 * 60 * 1000,    // 30 minutes (pages, settings)
  SERVICES: 10 * 60 * 1000,          // 10 minutes
  CATEGORIES: 15 * 60 * 1000,        // 15 minutes
  AVAILABILITY: 2 * 60 * 1000,       // 2 minutes (booking slots)
  TESTIMONIALS: 20 * 60 * 1000,      // 20 minutes
};

// Usage
useCachedResource('services-list', fetchServices, {
  ttl: CACHE_TTL.SERVICES,
  fallbackData: [],
});
```

### 4. **Lazy Loading Images**
Use native lazy loading for images:

```tsx
<img 
  src={service.featured_image}
  alt={service.title}
  loading="lazy"
  className="w-full h-full object-cover"
/>
```

### 5. **Debounce User Interactions**
Already implemented for date selection, consider for:
- Search inputs (500ms)
- Filter selections (300ms)
- Availability checks (300ms - done ✓)

### 6. **Optimistic UI Updates**
For booking submissions:

```typescript
const handleSubmit = async () => {
  // Show success immediately
  setBookingSuccess(true);
  
  try {
    // Send to backend
    await bookingService.createBooking(data);
  } catch (error) {
    // Revert on error
    setBookingSuccess(false);
    alert('Booking failed. Please try again.');
  }
};
```

---

## API Endpoint Checklist

### Critical Endpoints (Must be fast < 200ms)
- ✅ `GET /api/site-settings` - Site configuration
- ✅ `GET /api/service-categories` - Category list  
- ✅ `GET /api/services` - Services list
- ⚠️ `GET /api/bookings/availability` - Should use date index

### Secondary Endpoints (< 500ms acceptable)
- ✅ `GET /api/pages/{slug}` - Page content
- ✅ `GET /api/services/{slug}` - Service details
- ✅ `GET /api/testimonials` - Testimonials

### Background Endpoints (Can be slower)
- ✅ `POST /api/bookings` - Create booking
- ✅ `POST /api/consent-forms` - Submit consent form
- ✅ `POST /api/visitor-tracking` - Log visitor

---

## Response Structure Standards

All API responses should follow this consistent structure:

```typescript
// Success Response
{
  "success": true,
  "data": [...] | {...},
  "message": "Optional success message"
}

// Error Response
{
  "success": false,
  "error": {
    "message": "User-friendly error message",
    "code": "ERROR_CODE",
    "details": {} // Optional validation errors
  }
}

// Paginated Response
{
  "success": true,
  "data": [...],
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 100,
    "total_pages": 5
  }
}
```

---

## Performance Monitoring

### Frontend Metrics to Track
```typescript
// Track API call duration
const startTime = performance.now();
const data = await fetchServices();
const duration = performance.now() - startTime;

// Log slow requests (> 1000ms)
if (duration > 1000) {
  console.warn(`Slow API call: fetchServices took ${duration}ms`);
}
```

### Backend Optimization Tips
1. **Database Indexing**
   - Index `is_active` columns for filtering
   - Index `slug` columns for lookups
   - Index `sort_order` for ordering
   - Composite index on `(category_id, is_active, sort_order)` for services

2. **Query Optimization**
   - Use `select()` to limit columns
   - Use `with()` for eager loading relationships
   - Avoid N+1 queries with proper eager loading

3. **Caching (Backend)**
   - Cache category list (rarely changes)
   - Cache site settings (rarely changes)
   - Cache featured services (changes infrequently)

---

## Implementation Priority

### High Priority ✅ (Completed)
1. ✅ Fix Services page data extraction
2. ✅ Add debouncing to booking availability
3. ✅ Fix mobile navigation positioning
4. ✅ Implement caching with useCachedResource

### Medium Priority 🔄 (Recommended)
1. Add field selection support to API endpoints
2. Implement pagination for admin tables
3. Add backend response caching
4. Optimize database queries with indexes

### Low Priority 📋 (Nice to have)
1. Implement optimistic UI updates
2. Add performance monitoring
3. Implement service worker for offline support
4. Add image optimization/CDN

---

## Testing Checklist

- [x] Services page loads with data
- [x] Booking page doesn't spam API calls
- [x] Mobile navigation works at all scroll positions
- [ ] Page load time < 2 seconds on 3G
- [ ] API response time < 500ms for critical endpoints
- [ ] Caching working correctly (check Network tab)
- [ ] Error states handled gracefully
- [ ] Loading states shown appropriately
