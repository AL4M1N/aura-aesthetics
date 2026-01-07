# About Page API Documentation - UPDATED

This document outlines the **exact** API endpoints required for the About Page management, matching the actual frontend structure.

## Common Notes

- **Base URL:** `/api`
- **Authentication:** All admin endpoints require Bearer Token authentication.
- **Data Format:** JSON
- **Image Uploads:** Images should be handled via multipart/form-data or separate upload endpoints returning a URL path.

---

## 1. Hero Section

The hero banner at the top of the About page with three-part headline.

### Table Schema (`page_about_hero`)

| Column | Type | Nullable | Notes |
| :--- | :--- | :--- | :--- |
| `id` | bigint | No | Primary Key |
| `kicker_text` | string | No | Small uppercase text (e.g., "About Me") |
| `headline_primary` | string | No | First part of headline (e.g., "Artistry Meets") |
| `headline_highlight` | string | No | Highlighted/italic part (e.g., "Medical Excellence") |
| `description` | text | No | Description paragraph |
| `background_image` | string | Yes | Optional background image URL |
| `is_active` | boolean | No | Default: true |
| `created_at` | timestamp | No | |
| `updated_at` | timestamp | No | |

### Endpoints

#### Get Hero Content (Admin)
- **Method:** `GET`
- **URL:** `/admin/pages/about/hero`
- **Response:**
```json
{
  "success": true,
  "data": {
    "hero": {
      "id": 1,
      "kicker_text": "About Me",
      "headline_primary": "Artistry Meets",
      "headline_highlight": "Medical Excellence",
      "description": "Dedicated to helping you feel confident through safe, sophisticated aesthetic treatments",
      "background_image": "/uploads/hero-bg.jpg",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### Update Hero Content (Admin)
- **Method:** `PUT`
- **URL:** `/admin/pages/about/hero`
- **Payload:**
```json
{
  "kicker_text": "About Me",
  "headline_primary": "Artistry Meets",
  "headline_highlight": "Medical Excellence",
  "description": "Dedicated to helping you feel confident through safe, sophisticated aesthetic treatments",
  "background_image": "/uploads/hero-bg.jpg",
  "is_active": true
}
```

#### Get Hero Content (Public)
- **Method:** `GET`
- **URL:** `/pages/about/hero`
- **Note:** Returns only if `is_active` is true.

---

## 2. Bio Section

The main "Your Journey to Confidence" section with practitioner image and single content field.

### Table Schema (`page_about_bio`)

| Column | Type | Nullable | Notes |
| :--- | :--- | :--- | :--- |
| `id` | bigint | No | Primary Key |
| `title` | string | No | Section title (e.g., "Your Journey to Confidence") |
| `content` | text | No | Full biography content (multi-paragraph) |
| `image_url` | string | No | Main practitioner image |
| `badge_icon` | string | No | Icon name (e.g., "award") |
| `badge_title` | string | No | Badge title (e.g., "CPD Accredited") |
| `badge_subtitle` | string | No | Badge subtitle (e.g., "Trained by Rejuvenate") |
| `is_active` | boolean | No | Default: true |
| `created_at` | timestamp | No | |
| `updated_at` | timestamp | No | |

### Endpoints

#### Get Bio Content (Admin)
- **Method:** `GET`
- **URL:** `/admin/pages/about/bio`
- **Response:**
```json
{
  "success": true,
  "data": {
    "bio": {
      "id": 1,
      "title": "Your Journey to Confidence",
      "content": "As a CPD-accredited aesthetic practitioner, I've dedicated my career to the art and science of aesthetic enhancement. Trained by Rejuvenate, one of the UK's most prestigious aesthetic training providers, I bring both expertise and artistry to every treatment.\n\nMy approach is rooted in the belief that true beauty enhancement comes from understanding and celebrating each person's unique features. Rather than following trends, I focus on creating harmonious, natural-looking results that stand the test of time.\n\nEvery consultation begins with listening—understanding your goals, concerns, and expectations. Through open dialogue and honest advice, we create a personalized treatment plan that aligns with your vision while maintaining the highest safety standards.",
      "image_url": "/uploads/practitioner.jpg",
      "badge_icon": "award",
      "badge_title": "CPD Accredited",
      "badge_subtitle": "Trained by Rejuvenate",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### Update Bio Content (Admin)
- **Method:** `PUT`
- **URL:** `/admin/pages/about/bio`
- **Payload:**
```json
{
  "title": "Your Journey to Confidence",
  "content": "As a CPD-accredited aesthetic practitioner...\n\nMy approach is rooted...\n\nEvery consultation begins...",
  "image_url": "/uploads/practitioner.jpg",
  "badge_icon": "award",
  "badge_title": "CPD Accredited",
  "badge_subtitle": "Trained by Rejuvenate",
  "is_active": true
}
```

#### Get Bio Content (Public)
- **Method:** `GET`
- **URL:** `/pages/about/bio`
- **Note:** Returns only if `is_active` is true.

---

## 3. Qualifications

List of professional qualifications with icon, title, and description.

### Table Schema (`page_about_qualifications`)

| Column | Type | Nullable | Notes |
| :--- | :--- | :--- | :--- |
| `id` | bigint | No | Primary Key |
| `icon` | string | No | Icon identifier (e.g., "award", "sparkles") |
| `title` | string | No | Qualification title |
| `description` | text | No | Description of the qualification |
| `sort_order` | integer | No | Display order |
| `is_active` | boolean | No | Default: true |
| `created_at` | timestamp | No | |
| `updated_at` | timestamp | No | |

### Endpoints

#### List Qualifications (Admin)
- **Method:** `GET`
- **URL:** `/admin/pages/about/qualifications`
- **Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "icon": "award",
      "title": "CPD Certified Aesthetic Practitioner",
      "description": "Comprehensive training in aesthetic medicine and patient care excellence",
      "sort_order": 1,
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Create Qualification (Admin)
- **Method:** `POST`
- **URL:** `/admin/pages/about/qualifications`
- **Payload:**
```json
{
  "icon": "award",
  "title": "CPD Certified Aesthetic Practitioner",
  "description": "Comprehensive training in aesthetic medicine and patient care excellence",
  "sort_order": 1,
  "is_active": true
}
```

#### Update Qualification (Admin)
- **Method:** `PUT`
- **URL:** `/admin/pages/about/qualifications/{id}`
- **Payload:** Same as Create

#### Delete Qualification (Admin)
- **Method:** `DELETE`
- **URL:** `/admin/pages/about/qualifications/{id}`

#### List Qualifications (Public)
- **Method:** `GET`
- **URL:** `/pages/about/qualifications`
- **Note:** Returns only active qualifications, sorted by `sort_order`.

---

## 4. Core Values

List of core values/philosophy with icon, title, and description.

### Table Schema (`page_about_values`)

| Column | Type | Nullable | Notes |
| :--- | :--- | :--- | :--- |
| `id` | bigint | No | Primary Key |
| `icon` | string | No | Icon identifier (e.g., "shield", "heart") |
| `title` | string | No | Value title |
| `description` | text | No | Description of the value |
| `sort_order` | integer | No | Display order |
| `is_active` | boolean | No | Default: true |
| `created_at` | timestamp | No | |
| `updated_at` | timestamp | No | |

### Endpoints

#### List Values (Admin)
- **Method:** `GET`
- **URL:** `/admin/pages/about/values`
- **Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "icon": "shield",
      "title": "Safety First",
      "description": "Medical-grade protocols and sterilization in every treatment",
      "sort_order": 1,
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Create Value (Admin)
- **Method:** `POST`
- **URL:** `/admin/pages/about/values`
- **Payload:**
```json
{
  "icon": "shield",
  "title": "Safety First",
  "description": "Medical-grade protocols and sterilization in every treatment",
  "sort_order": 1,
  "is_active": true
}
```

#### Update Value (Admin)
- **Method:** `PUT`
- **URL:** `/admin/pages/about/values/{id}`
- **Payload:** Same as Create

#### Delete Value (Admin)
- **Method:** `DELETE`
- **URL:** `/admin/pages/about/values/{id}`

#### List Values (Public)
- **Method:** `GET`
- **URL:** `/pages/about/values`
- **Note:** Returns only active values, sorted by `sort_order`.

---

## 5. Certificates

Gallery of certification images with metadata.

### Table Schema (`page_about_certificates`)

| Column | Type | Nullable | Notes |
| :--- | :--- | :--- | :--- |
| `id` | bigint | No | Primary Key |
| `title` | string | No | Certificate title |
| `issuer` | string | No | Issuing organization |
| `issue_date` | string | No | Date issued (YYYY-MM-DD) |
| `image_url` | string | Yes | Certificate image |
| `description` | text | Yes | Optional description |
| `sort_order` | integer | No | Display order |
| `is_active` | boolean | No | Default: true |
| `created_at` | timestamp | No | |
| `updated_at` | timestamp | No | |

### Endpoints

#### List Certificates (Admin)
- **Method:** `GET`
- **URL:** `/admin/pages/about/certificates`
- **Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Advanced Aesthetic Practitioner",
      "issuer": "Rejuvenate Academy",
      "issue_date": "2023-06-15",
      "image_url": "/uploads/cert-1.jpg",
      "description": "Advanced training in aesthetic procedures",
      "sort_order": 1,
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Create Certificate (Admin)
- **Method:** `POST`
- **URL:** `/admin/pages/about/certificates`
- **Payload:**
```json
{
  "title": "Advanced Aesthetic Practitioner",
  "issuer": "Rejuvenate Academy",
  "issue_date": "2023-06-15",
  "image_url": "/uploads/cert-1.jpg",
  "description": "Advanced training in aesthetic procedures",
  "sort_order": 1,
  "is_active": true
}
```

#### Update Certificate (Admin)
- **Method:** `PUT`
- **URL:** `/admin/pages/about/certificates/{id}`
- **Payload:** Same as Create

#### Delete Certificate (Admin)
- **Method:** `DELETE`
- **URL:** `/admin/pages/about/certificates/{id}`

#### List Certificates (Public)
- **Method:** `GET`
- **URL:** `/pages/about/certificates`
- **Note:** Returns only active certificates, sorted by `sort_order`.

---

## Available Icons

The following icons are available for use in Qualifications, Values, and Bio badge:

- `sparkles` - Sparkles ✨
- `shield` - Shield 🛡️
- `heart` - Heart ❤️
- `star` - Star ⭐
- `zap` - Zap ⚡
- `crown` - Crown 👑
- `award` - Award 🏆
- `check-circle` - Check Circle ✓
- `trending-up` - Trending Up 📈

---

## Summary of Changes from Previous Version

1. **Hero Section:**
   - Changed `title` → `headline_primary` (first part of headline)
   - Changed `subtitle` → `headline_highlight` (italic/colored part)
   - Added `kicker_text` (small uppercase text above headline)
   - Made all text fields required except `background_image`

2. **Story Section → Bio Section:**
   - Renamed section from "Story" to "Bio"
   - Changed endpoints from `/story` to `/bio`
   - Single `content` field instead of multiple paragraphs (stores full biography with line breaks)
   - Removed `kicker_text`, `headline_primary`, `headline_highlight`, `detail_content`
   - Added `badge_icon` field to specify which icon to display
   - Made `image_url` required (not optional)

3. **Qualifications, Values, Certificates:**
   - No structural changes, already matching the frontend

This structure now **exactly matches** the frontend implementation in `About.tsx`.
