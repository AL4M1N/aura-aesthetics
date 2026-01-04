# Aura Aesthetics — Master README (Single Source of Truth)

A premium, performance-focused React + Tailwind website for a CPD‑accredited medical aesthetic clinic. This README consolidates all project documentation, guides, and test PHP samples into one place.

## Overview

- 5 core pages: Home, About, Services, Consent, Booking
- Modern UI: Radix UI + Tailwind, micro‑interactions, responsive design
- Optimized build: Vite, lazy routes, chunk splitting, CDN‑ready
- Backend ready: Clean API boundary for Laravel

## Tech Stack

- React 18 + TypeScript, React Router
- Tailwind CSS, Radix UI, Lucide Icons
- Vite build tooling
- Optional: Framer Motion for subtle transitions

## Project Structure

```
src/
  app/
    components/         # Shared UI
    pages/              # Home, About, Services, Consent, Booking
  hooks/
    useVisitorTracking.ts
  lib/
    api.ts              # API helpers
styles/                 # Fonts, theme, tailwind
```

## Quick Start

Prerequisites: Node.js 18+, npm

```cmd
npm install
npm run dev   


npm run build
npm run preview
```

Environment variables:

```cmd
copy .env.example .env
:: Edit .env
:: VITE_API_URL=http://localhost:8000
```

## Deployment (Cloudflare Pages) — 5 minutes

1) Push to GitHub
2) Create project at pages.cloudflare.com
3) Build command: `npm run build` • Output: `dist`
4) Set `VITE_API_URL` env var (if using API)
5) Deploy → global CDN

Notes:
- Detailed step‑by‑step (including custom domain, troubleshooting) is merged from prior guides and applies here.

## Performance Optimization — Quick Wins

- Compress images (WebP, 100–200KB each). Avoid 5–10MB Unsplash originals.
- Lazy‑load routes and heavy components.
- Use font‑display: swap; preconnect Google Fonts.
- Remove unused deps (e.g., MUI) to cut bundle size.
- Optional PWA caching via `vite-plugin-pwa`.

Expected results after these changes:
- Initial load: ~0.8–1.5s
- Bundle: ~250–400KB
- Lighthouse: 85–95+

## Visitor Tracking (Frontend + Laravel)

Purpose: Track anonymous sessions and page views without errors on refresh.

Frontend behavior (`src/hooks/useVisitorTracking.ts`):
- First visit: Send payload without `session_id`; backend generates and returns it
- Page change: Send `session_id`, `page`, `device`, `browser`, `os`, and `duration_seconds`
- Console emojis: 📍 first visit, 📄 page view, ✅ success, ⚠️ error, 👋 session end

Single backend endpoint (Laravel):

```php
// routes/api.php
Route::post('/visitor-log', [VisitorLogController::class, 'store']);
```

Controller (condensed from sample):

```php
class VisitorLogController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'session_id' => 'nullable|string|max:100',
            'page' => 'required|string|max:500',
            'device' => 'nullable|in:desktop,mobile,tablet',
            'browser' => 'nullable|string|max:100',
            'os' => 'nullable|string|max:100',
            'referrer' => 'nullable|string|max:500',
            'duration_seconds' => 'nullable|integer|min:0',
            'timestamp' => 'nullable|string',
        ]);

        return !empty($validated['session_id'])
            ? $this->updateExistingSession($validated)
            : $this->createNewVisitor($validated, $request);
    }

    private function createNewVisitor(array $data, Request $request)
    {
        $sid = 'sess_'.Str::uuid().'_'.time();
        $log = VisitorLog::create([
            'session_id' => $sid,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'device' => $data['device'] ?? null,
            'browser' => $data['browser'] ?? null,
            'os' => $data['os'] ?? null,
            'referrer' => $data['referrer'] ?? 'Direct',
            'landing_page' => $data['page'],
            'current_page' => $data['page'],
            'visited_at' => $data['timestamp'] ? \Carbon\Carbon::parse($data['timestamp']) : now(),
            'session_start' => now(),
            'duration_seconds' => $data['duration_seconds'] ?? 0,
        ]);
        return response()->json(['success' => true, 'message' => 'Visitor tracked', 'data' => ['id' => $log->id, 'session_id' => $sid, 'page' => $data['page']]], 201);
    }

    private function updateExistingSession(array $data)
    {
        $log = VisitorLog::where('session_id', $data['session_id'])->first();
        if (!$log) return response()->json(['success' => false, 'message' => 'Session not found'], 404);
        $log->update([
            'current_page' => $data['page'],
            'device' => $data['device'] ?? $log->device,
            'browser' => $data['browser'] ?? $log->browser,
            'os' => $data['os'] ?? $log->os,
            'duration_seconds' => $data['duration_seconds'] ?? 0,
            'session_end' => $data['timestamp'] ? \Carbon\Carbon::parse($data['timestamp']) : now(),
        ]);
        return response()->json(['success' => true, 'message' => 'Session updated', 'data' => ['id' => $log->id, 'session_id' => $log->session_id, 'current_page' => $log->current_page]]);
    }
}
```

Model fillables (example): `session_id, ip_address, user_agent, device, browser, os, referrer, landing_page, current_page, visited_at, session_start, session_end, duration_seconds`.

Migration highlights: `session_id UNIQUE`, indexes on `visited_at`, `device`, optional geo fields.

## Admin Panel (Summary)

- Auth flow: login → OTP → dashboard
- Dashboard: visitors, sessions, trends, devices, top pages/locations
- Users/Roles: CRUD with permissions, status, last login
- Logs: login activity + visitor logs with filters and export
- Ready endpoints to implement on Laravel (`/api/admin/*`)

## Laravel Blade Conversion (If migrating UI)

- Map React components to Blade partials/components
- Use Alpine.js for tabs, consent multi‑step, small interactions
- Keep Tailwind design tokens; ensure WCAG AA contrast
- Routes: home/about/services/consent/booking, plus form POST handlers

## Customization

- Colors: `src/styles/theme.css`
- Fonts: `src/styles/fonts.css`
- Content: edit page components in `src/app/pages/*`

## Attribution & License

- Icons: Lucide • UI: Radix • Fonts: Google • Images: Unsplash (replace in production)
- Proprietary project for Aura Aesthetics; do not redistribute.

---

## Troubleshooting & Bug Fixes

### Admin Panel Common Issues

#### 1. Login Form Page Refresh Issue
**Problem**: After entering wrong credentials, the login page refreshes instead of showing error message.

**Solution**: Enhanced form event handling in `Login.tsx`:
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  e.stopPropagation(); // Prevents page refresh
  // ... rest of login logic
}
```

#### 2. Profile Page Feedback
**Problem**: Profile updates and password changes showed inline messages that required manual timeout cleanup.

**Solution**: Integrated Sonner toast notifications in `UserProfile.tsx`:
```typescript
import { toast } from 'sonner';

// Profile update
toast.success('Profile updated successfully!');
toast.error(response.message || 'Failed to update profile');

// Password change
toast.success('Password changed successfully!');
toast.error('New passwords do not match');
```

Benefits:
- Auto-dismissing notifications
- Non-blocking UI feedback
- No manual state cleanup needed

#### 3. Profile Details Fetch Contract
**Problem**: The profile page was showing cached localStorage data instead of the latest backend user.

**Solution**: The frontend now calls `GET /admin/profile` during mount without passing any user `id` (backend should derive identity from the `Authorization` header). Backend should return the authenticated user inside the standard API wrapper:

```json
{
  "success": true,
  "message": "Profile fetched",
  "data": {
    "user": {
      "id": 1,
      "name": "Dr. Aura",
      "email": "admin@aura.com",
      "phone": "+440123456789",
      "status": "active",
      "role": {
        "id": 1,
        "name": "Super Admin",
        "slug": "super-admin",
        "color": "#d4af77",
        "is_system": true,
        "permissions": [],
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z"
      },
      "last_login_at": "2026-01-01T09:00:00.000Z",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-06-01T00:00:00.000Z"
    }
  }
}
```

The frontend keeps this response in sync with localStorage and surfaces a toast if fetching fails.

#### 4. Add User Modal Not Scrollable
**Problem**: Add User modal takes full screen height but form content isn't scrollable, hiding the save button.

**Solution**: Added height constraint and scroll behavior to `UserManagement.tsx`:
```typescript
<DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
  {/* Form content */}
</DialogContent>
```

This ensures the modal:
- Never exceeds 90% of viewport height
- Content scrolls vertically when needed
- Save button always accessible

### General Debugging Tips

- **Check browser console** for API errors and network issues
- **Verify API base URL** in `.env` matches your Laravel backend
- **Clear browser cache** if seeing stale data
- **Check CORS settings** if API calls fail from frontend
- **Inspect Network tab** to verify API responses and status codes

---

This README merges content from prior docs (Quick Start, Deployment, Performance, Visitor Tracking, Admin, Laravel conversion) and includes the essential PHP samples inline so you only need this one file.
### Important Notes
