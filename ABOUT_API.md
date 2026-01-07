# About Page API Documentation

This document outlines the API endpoints required for the **About Page** management in the admin panel.

## Common Notes

- **Base URL:** `/api`
- **Authentication:** All admin endpoints require Bearer Token authentication.
- **Data Format:** JSON
- **Image Uploads:** Images should be handled via multipart/form-data or separate upload endpoints returning a URL path.
- **Success Response:**
  ```json
  {
      "success": true,
      "message": "Operation successful",
      "data": { ... }
  }
  ```

---

## 1. About Hero Section

Manage the hero section content of the About page.

### Table Schema (`page_about_hero`)

| Column | Type | Nullable | Notes |
| :--- | :--- | :--- | :--- |
| `id` | bigint | No | Primary Key |
| `title` | string | No | |
| `subtitle` | string | Yes | |
| `description` | text | Yes | |
| `background_image` | string | Yes | URL path to image |
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
              "title": "About Aura",
              "subtitle": "Our Journey",
              "description": "...",
              "background_image": "/uploads/about-hero.jpg",
              "is_active": true
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
      "title": "New Title",
      "subtitle": "New Subtitle",
      "description": "Updated description",
      "background_image": "/uploads/new-image.jpg",
      "is_active": true
  }
  ```

#### Get Hero Content (Public)
- **Method:** `GET`
- **URL:** `/pages/about/hero`
- **Note:** Should return only if `is_active` is true.

---

## 2. About Story (Main Content)

Manage the main story content, including detailed text and badge overlays.

### Table Schema (`page_about_story`)

| Column | Type | Nullable | Notes |
| :--- | :--- | :--- | :--- |
| `id` | bigint | No | Primary Key |
| `kicker_text` | string | Yes | Small text above headline |
| `headline_primary` | string | No | Main headline |
| `headline_highlight` | string | Yes | Highlighted part of headline |
| `description` | text | No | Short intro text |
| `detail_content` | text | Yes | Long rich text content |
| `image_url` | string | Yes | Side image |
| `badge_title` | string | Yes | Title on the overlay badge |
| `badge_subtitle` | string | Yes | Subtitle on the overlay badge |
| `is_active` | boolean | No | Default: true |

### Endpoints

#### Get Story Content (Admin)
- **Method:** `GET`
- **URL:** `/admin/pages/about/story`
- **Response:**
  ```json
  {
      "success": true,
      "data": {
          "story": {
              "id": 1,
              "kicker_text": "Our Philosophy",
              "headline_primary": "Beauty With",
              "headline_highlight": "Purpose",
              "description": "...",
              "detail_content": "...",
              "image_url": "/uploads/story.jpg",
              "badge_title": "10+",
              "badge_subtitle": "Years Experience",
              "is_active": true
          }
      }
  }
  ```

#### Update Story Content (Admin)
- **Method:** `PUT`
- **URL:** `/admin/pages/about/story`
- **Payload:** same fields as above (excluding id, created_at, updated_at)

#### Get Story Content (Public)
- **Method:** `GET`
- **URL:** `/pages/about/story`

---

## 3. Qualifications

Manage list of professional qualifications (similar to Features).

### Table Schema (`page_about_qualifications`)

| Column | Type | Nullable | Notes |
| :--- | :--- | :--- | :--- |
| `id` | bigint | No | Primary Key |
| `icon` | string | No | Lucide icon name |
| `title` | string | No | |
| `description` | text | No | |
| `sort_order` | integer | No | Default: 0 |
| `is_active` | boolean | No | Default: true |

### Endpoints

- `GET /admin/pages/about/qualifications` (List all)
- `POST /admin/pages/about/qualifications` (Create)
- `PUT /admin/pages/about/qualifications/{id}` (Update)
- `DELETE /admin/pages/about/qualifications/{id}` (Delete)
- `PUT /admin/pages/about/qualifications/{id}/status` (Toggle Active)
- `GET /pages/about/qualifications` (Public List - active only, sorted)

---

## 4. Values

Manage core values (similar to Features/Qualifications).

### Table Schema (`page_about_values`)

| Column | Type | Nullable | Notes |
| :--- | :--- | :--- | :--- |
| `id` | bigint | No | Primary Key |
| `icon` | string | No | Lucide icon name |
| `title` | string | No | |
| `description` | text | No | |
| `sort_order` | integer | No | Default: 0 |
| `is_active` | boolean | No | Default: true |

### Endpoints

- `GET /admin/pages/about/values` (List all)
- `POST /admin/pages/about/values` (Create)
- `PUT /admin/pages/about/values/{id}` (Update)
- `DELETE /admin/pages/about/values/{id}` (Delete)
- `PUT /admin/pages/about/values/{id}/status` (Toggle Active)
- `GET /pages/about/values` (Public List - active only, sorted)

---

## 5. Certificates

Manage certificates and licenses (Images + Details).

### Table Schema (`page_about_certificates`)

| Column | Type | Nullable | Notes |
| :--- | :--- | :--- | :--- |
| `id` | bigint | No | Primary Key |
| `title` | string | No | Certificate Name |
| `issuer` | string | No | Organization |
| `issue_date` | string | Yes | Year or Date |
| `image_url` | string | Yes | Scan/Logo of certificate |
| `description` | text | Yes | |
| `sort_order` | integer | No | Default: 0 |
| `is_active` | boolean | No | Default: true |

### Endpoints

- `GET /admin/pages/about/certificates` (List all)
- `POST /admin/pages/about/certificates` (Create)
- `PUT /admin/pages/about/certificates/{id}` (Update)
- `DELETE /admin/pages/about/certificates/{id}` (Delete)
- `PUT /admin/pages/about/certificates/{id}/status` (Toggle Active)
- `GET /pages/about/certificates` (Public List - active only, sorted)
