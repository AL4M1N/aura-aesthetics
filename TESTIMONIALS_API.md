# Testimonials API Documentation

This document describes the API endpoints for managing client testimonials on the homepage.

## Base URL
```
http://localhost:8000/api
```

## Endpoints

### 1. Get All Testimonials (Admin)
Retrieve all testimonials for admin management.

**Endpoint:** `GET /admin/pages/home/testimonials`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "client_name": "Sarah Johnson",
      "client_image": "/uploads/testimonials/sarah-johnson.jpg",
      "service_name": "Hydrafacial Treatment",
      "testimonial": "Absolutely thrilled with my results! The treatment was professional, comfortable, and the results look so natural. Couldn't be happier!",
      "rating": 5,
      "sort_order": 1,
      "is_active": true,
      "created_at": "2024-01-15T10:30:00.000000Z",
      "updated_at": "2024-01-15T10:30:00.000000Z"
    }
  ],
  "message": "Testimonials retrieved successfully"
}
```

---

### 2. Get Public Testimonials
Retrieve active testimonials for public display.

**Endpoint:** `GET /pages/home/testimonials`

**Headers:**
```
Content-Type: application/json
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "client_name": "Sarah Johnson",
      "client_image": "/uploads/testimonials/sarah-johnson.jpg",
      "service_name": "Hydrafacial Treatment",
      "testimonial": "Absolutely thrilled with my results! The treatment was professional, comfortable, and the results look so natural. Couldn't be happier!",
      "rating": 5,
      "sort_order": 1,
      "is_active": true,
      "created_at": "2024-01-15T10:30:00.000000Z",
      "updated_at": "2024-01-15T10:30:00.000000Z"
    }
  ],
  "message": "Public testimonials retrieved successfully"
}
```

---

### 3. Create Testimonial
Create a new testimonial entry.

**Endpoint:** `POST /admin/pages/home/testimonials`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Request Body (FormData):**
```
client_name: "Jane Smith"
client_image: [File] (optional)
service_name: "Lip Enhancement"
testimonial: "I'm so happy with the results! The team was professional and made me feel comfortable throughout the entire process."
rating: 5
sort_order: 2
is_active: true
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "client_name": "Jane Smith",
    "client_image": "/uploads/testimonials/jane-smith.jpg",
    "service_name": "Lip Enhancement",
    "testimonial": "I'm so happy with the results! The team was professional and made me feel comfortable throughout the entire process.",
    "rating": 5,
    "sort_order": 2,
    "is_active": true,
    "created_at": "2024-01-16T14:20:00.000000Z",
    "updated_at": "2024-01-16T14:20:00.000000Z"
  },
  "message": "Testimonial created successfully"
}
```

---

### 4. Update Testimonial
Update an existing testimonial.

**Endpoint:** `PUT /admin/pages/home/testimonials/{id}`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Request Body (FormData):**
```
client_name: "Jane Smith"
client_image: [File] (optional - only if changing)
service_name: "Lip Enhancement & Filler"
testimonial: "Updated testimonial text..."
rating: 5
sort_order: 2
is_active: true
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "client_name": "Jane Smith",
    "client_image": "/uploads/testimonials/jane-smith.jpg",
    "service_name": "Lip Enhancement & Filler",
    "testimonial": "Updated testimonial text...",
    "rating": 5,
    "sort_order": 2,
    "is_active": true,
    "created_at": "2024-01-16T14:20:00.000000Z",
    "updated_at": "2024-01-16T15:45:00.000000Z"
  },
  "message": "Testimonial updated successfully"
}
```

**Note:** When updating, if `client_image` is not provided in the request, the existing image will be preserved.

---

### 5. Delete Testimonial
Delete a testimonial entry.

**Endpoint:** `DELETE /admin/pages/home/testimonials/{id}`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Response:**
```json
{
  "success": true,
  "message": "Testimonial deleted successfully"
}
```

---

### 6. Toggle Testimonial Status
Toggle the active status of a testimonial.

**Endpoint:** `PUT /admin/pages/home/testimonials/{id}/status`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "is_active": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "client_name": "Jane Smith",
    "client_image": "/uploads/testimonials/jane-smith.jpg",
    "service_name": "Lip Enhancement",
    "testimonial": "I'm so happy with the results!...",
    "rating": 5,
    "sort_order": 2,
    "is_active": false,
    "created_at": "2024-01-16T14:20:00.000000Z",
    "updated_at": "2024-01-16T15:50:00.000000Z"
  },
  "message": "Testimonial status updated successfully"
}
```

---

## Field Specifications

### Testimonial Object
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | integer | Auto | Unique identifier |
| `client_name` | string | Yes | Name of the client |
| `client_image` | string/File | No | Client's profile image path or file upload |
| `service_name` | string | Yes | Name of the service received |
| `testimonial` | text | Yes | Client's testimonial text |
| `rating` | integer | Yes | Rating from 1-5 stars |
| `sort_order` | integer | Yes | Display order (1-based) |
| `is_active` | boolean | Yes | Visibility status |
| `created_at` | timestamp | Auto | Creation timestamp |
| `updated_at` | timestamp | Auto | Last update timestamp |

---

## Validation Rules

### Create/Update Testimonial
- `client_name`: Required, string, max 255 characters
- `client_image`: Optional, image file (jpg, jpeg, png, gif, webp), max 2MB
- `service_name`: Required, string, max 255 characters
- `testimonial`: Required, text, min 10 characters
- `rating`: Required, integer, between 1 and 5
- `sort_order`: Required, integer, min 1
- `is_active`: Required, boolean

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "errors": {
    "client_name": ["The client name field is required."],
    "rating": ["The rating must be between 1 and 5."]
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthenticated"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Testimonial not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to process testimonial"
}
```

---

## Database Schema Suggestion

```sql
CREATE TABLE home_testimonials (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    client_name VARCHAR(255) NOT NULL,
    client_image VARCHAR(255) NULL,
    service_name VARCHAR(255) NOT NULL,
    testimonial TEXT NOT NULL,
    rating TINYINT UNSIGNED NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    sort_order INT UNSIGNED NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL,
    INDEX idx_is_active (is_active),
    INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## Usage Notes

1. **Image Preservation**: When updating a testimonial, if you don't provide a new `client_image` file, the existing image will be preserved. Send `null` or omit the field to keep the current image.

2. **Service Name Selection**: The admin form displays a dropdown of all available services fetched from the Services API. The `service_name` field stores the selected service name string.

3. **Sort Order**: Lower numbers appear first. The frontend automatically suggests the next available sort order when creating a new testimonial.

4. **Rating Display**: The frontend displays ratings as filled/unfilled star icons based on the rating value (1-5).

5. **Active Status**: Only testimonials with `is_active: true` will be shown on the public homepage. The admin panel shows all testimonials regardless of status.

6. **Image URLs**: The frontend automatically resolves image paths like `/uploads/`, `/upload/`, or `/storage/` to `http://localhost:8000` for proper display.

7. **Display Limit**: The homepage displays up to 6 testimonials at a time, sorted by `sort_order` ascending.

---

## Frontend Implementation

### Admin Interface
Located at: `src/app/admin/pages/HomePages.tsx` (Testimonials tab)

Features:
- Search by client name or service name
- Table view with client image, service, testimonial preview, rating stars
- Add/Edit dialog with light background and scrolling
- Service name dropdown (fetched from Services API)
- Delete with confirmation
- Toggle status (show/hide)
- Sort order management

### Public Display
Located at: `src/app/pages/Home.tsx` (Testimonials section)

Features:
- Grid layout (3 columns on desktop)
- Client image or initial circle
- Client name and service name
- Star rating visualization
- Full testimonial text in quotes
- Smooth scroll animations
- Only shows active testimonials
