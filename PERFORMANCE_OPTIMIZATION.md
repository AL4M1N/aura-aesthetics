# Performance Optimization Guide

## Current Issues & Solutions

### 1. **Image Optimization** (CRITICAL - Biggest Impact)

Your images from Unsplash are huge (often 5-10MB). This is likely your main problem.

#### Solutions:

**Option A: Use Cloudinary or ImageKit (RECOMMENDED)**
```typescript
// Instead of:
src="https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=800"

// Use:
src="https://res.cloudinary.com/YOUR_CLOUD/image/fetch/f_auto,q_auto,w_800/https://images.unsplash.com/photo-1519415510236-718bdfcd89c8"
```

**Option B: Local Optimized Images**
1. Download your images
2. Optimize them with TinyPNG or Squoosh
3. Store in `/public/images/` folder
4. Use WebP format with fallbacks

**Option C: Lazy Loading Images**
Add to all images:
```jsx
<img
  src="your-image.jpg"
  loading="lazy"
  decoding="async"
  alt="Description"
/>
```

### 2. **Code Splitting & Lazy Loading**

Currently, all pages load at once. Split them:

**Update your router in `main.tsx` or `App.tsx`:**
```typescript
import { lazy, Suspense } from 'react';

const Home = lazy(() => import('./app/pages/Home'));
const About = lazy(() => import('./app/pages/About'));
const Services = lazy(() => import('./app/pages/Services'));
const Booking = lazy(() => import('./app/pages/Booking'));
const Consent = lazy(() => import('./app/pages/Consent'));

// In your routes:
<Suspense fallback={<div className="min-h-screen flex items-center justify-center">
  <div className="text-[var(--aura-rose-gold)]">Loading...</div>
</div>}>
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/about" element={<About />} />
    {/* ... */}
  </Routes>
</Suspense>
```

### 3. **Font Optimization**

Your Google Fonts are blocking render. Use font-display: swap.

**Update `index.html`:**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

### 4. **Remove Unused Dependencies**

You have many unused MUI components. After confirming you don't use them:
```bash
npm uninstall @mui/material @mui/icons-material @emotion/react @emotion/styled
```

This could save ~500KB from your bundle.

### 5. **Preload Critical Assets**

Add to `index.html` `<head>`:
```html
<!-- Preload logo -->
<link rel="preload" as="image" href="/logo.png">

<!-- Preload hero image -->
<link rel="preload" as="image" href="/images/hero.webp">
```

### 6. **Add Service Worker for Caching**

Install workbox:
```bash
npm install vite-plugin-pwa -D
```

Update `vite.config.ts`:
```typescript
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'unsplash-images',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
        ],
      },
    }),
  ],
})
```

### 7. **CDN Deployment**

Deploy to Cloudflare Pages, Vercel, or Netlify for:
- Global CDN distribution
- Automatic compression (Brotli/Gzip)
- HTTP/2 & HTTP/3
- Edge caching

### 8. **Optimize Motion/Framer Motion**

Reduce animation complexity:
```typescript
// Instead of animating many properties:
animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}

// Just animate what's needed:
animate={{ opacity: 1, y: 0 }}
```

## Laravel Integration - Best Setup

### Architecture: Laravel API + React SPA

```
┌─────────────────┐         ┌─────────────────┐
│   React Build   │   API   │  Laravel API    │
│   (CDN/Static)  │ ←────→  │  (Backend)      │
│   Frontend      │         │  /api/*         │
└─────────────────┘         └─────────────────┘
```

### Setup Steps:

1. **Create Laravel API Backend:**
```bash
composer create-project laravel/laravel aura-api
cd aura-api
php artisan install:api
```

2. **Setup CORS:**
```php
// config/cors.php
'paths' => ['api/*'],
'allowed_origins' => ['https://your-frontend-domain.com'],
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
```

3. **Create API Routes:**
```php
// routes/api.php
Route::get('/services', [ServiceController::class, 'index']);
Route::post('/bookings', [BookingController::class, 'store']);
Route::post('/contact', [ContactController::class, 'store']);
```

4. **Update React to use API:**
```typescript
// src/lib/api.ts
const API_URL = import.meta.env.VITE_API_URL || 'https://api.yoursite.com';

export async function getServices() {
  const response = await fetch(`${API_URL}/api/services`);
  return response.json();
}

export async function createBooking(data: BookingData) {
  const response = await fetch(`${API_URL}/api/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}
```

5. **Deploy:**
- **Frontend**: Cloudflare Pages / Vercel / Netlify
- **Backend**: Laravel Forge / DigitalOcean / AWS
- **Database**: MySQL on same server as Laravel

## Performance Checklist

- [ ] Optimize all images (WebP, lazy loading)
- [ ] Implement code splitting (lazy routes)
- [ ] Add font-display: swap
- [ ] Remove unused dependencies
- [ ] Enable Vite build optimizations
- [ ] Deploy to CDN (Cloudflare/Vercel)
- [ ] Add service worker caching
- [ ] Compress assets (Brotli/Gzip)
- [ ] Minimize Framer Motion animations
- [ ] Use React.memo for expensive components
- [ ] Add loading skeletons
- [ ] Implement prefetching for routes

## Expected Results

**Before Optimization:**
- Initial Load: 3-5 seconds
- Bundle Size: 800KB - 1.5MB
- Lighthouse Score: 40-60

**After Optimization:**
- Initial Load: 0.5-1.5 seconds
- Bundle Size: 200-400KB
- Lighthouse Score: 85-95

## Testing Performance

```bash
# Build and analyze
npm run build
npx vite-bundle-visualizer

# Test with Lighthouse
npx lighthouse https://your-site.com --view
```

## Quick Wins (Do These First)

1. **Optimize images** - Use WebP, compress to 80% quality
2. **Deploy to Cloudflare Pages** - Free, fast, global CDN
3. **Lazy load routes** - Split code by page
4. **Remove unused MUI packages** - Reduce bundle size

These four changes alone can reduce load time from 5s to under 2s.
