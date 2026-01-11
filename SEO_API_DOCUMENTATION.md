# SEO Management API Documentation

## Overview
This document outlines the API endpoints and database schema required to support SEO management functionality across the Aura Aesthetics website.

## Database Schema

### Table: `seo_data`

```sql
CREATE TABLE seo_data (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    page_type ENUM('home', 'about', 'services', 'consent', 'booking') NOT NULL,
    page_identifier VARCHAR(255) NULL, -- For service-specific SEO (service slug)
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    keywords TEXT NULL,
    og_title VARCHAR(255) NOT NULL,
    og_description TEXT NOT NULL,
    og_image VARCHAR(500) NULL, -- File path/URL to uploaded image
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Ensure unique combinations of page_type and page_identifier
    UNIQUE KEY unique_page (page_type, page_identifier)
);
```

### Indexes
```sql
CREATE INDEX idx_seo_page_type ON seo_data(page_type);
CREATE INDEX idx_seo_page_identifier ON seo_data(page_identifier);
```

## API Endpoints

### Admin Endpoints (Require Authentication)

#### 1. Get All SEO Data
```http
GET /admin/seo
```

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "page_type": "home",
            "page_identifier": null,
            "title": "Aura Aesthetics - Professional Beauty & Wellness Services",
            "description": "Transform your beauty journey with our expert aesthetic treatments...",
            "keywords": "aesthetics, beauty treatments, skincare, dermal fillers",
            "og_title": "Aura Aesthetics - Premium Beauty Services",
            "og_description": "Discover exceptional aesthetic treatments...",
            "og_image": "/storage/seo/home-og-image.jpg",
            "created_at": "2024-01-15T10:30:00Z",
            "updated_at": "2024-01-20T14:25:00Z"
        }
    ],
    "message": "SEO data retrieved successfully"
}
```

#### 2. Get SEO Data by Page Type
```http
GET /admin/seo/page?page_type=home&page_identifier=botox-treatment
```

**Query Parameters:**
- `page_type` (required): One of 'home', 'about', 'services', 'consent', 'booking'
- `page_identifier` (optional): For service-specific pages, use the service slug

**Response:**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "page_type": "services",
        "page_identifier": "botox-treatment",
        "title": "Botox Treatment - Professional Anti-Aging Services | Aura Aesthetics",
        "description": "Expert Botox treatments for natural-looking results...",
        "keywords": "botox, anti-aging, wrinkle treatment, facial rejuvenation",
        "og_title": "Professional Botox Treatment Services",
        "og_description": "Achieve youthful, natural results with our expert Botox treatments...",
        "og_image": "/storage/seo/botox-og-image.jpg",
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-20T14:25:00Z"
    },
    "message": "SEO data retrieved successfully"
}
```

#### 3. Create SEO Data
```http
POST /admin/seo
Content-Type: multipart/form-data
```

**Request Body (FormData):**
- `page_type` (string, required): One of 'home', 'about', 'services', 'consent', 'booking'
- `page_identifier` (string, optional): For service-specific pages
- `title` (string, required): Page title (max 255 chars)
- `description` (string, required): Meta description
- `keywords` (string, optional): SEO keywords
- `og_title` (string, required): Open Graph title
- `og_description` (string, required): Open Graph description
- `og_image` (file, optional): Open Graph image upload

**Response:**
```json
{
    "success": true,
    "data": {
        "id": 2,
        "page_type": "about",
        "page_identifier": null,
        "title": "About Us - Aura Aesthetics | Expert Beauty Team",
        "description": "Meet our experienced team of aesthetic professionals...",
        "keywords": "about aura aesthetics, beauty professionals, aesthetic team",
        "og_title": "About Aura Aesthetics - Expert Beauty Team",
        "og_description": "Learn about our qualified professionals...",
        "og_image": "/storage/seo/about-og-image.jpg",
        "created_at": "2024-01-21T15:30:00Z",
        "updated_at": "2024-01-21T15:30:00Z"
    },
    "message": "SEO data created successfully"
}
```

#### 4. Update SEO Data
```http
POST /admin/seo/{id}
Content-Type: multipart/form-data
```

**Request Body:** Same as create endpoint

**Response:** Same format as create endpoint with updated data

#### 5. Delete SEO Data
```http
DELETE /admin/seo/{id}
```

**Response:**
```json
{
    "success": true,
    "message": "SEO data deleted successfully"
}
```

### Public Endpoints (No Authentication Required)

#### 1. Get SEO Data for Frontend
```http
GET /seo?page_type=home&page_identifier=botox-treatment
```

**Query Parameters:**
- `page_type` (required): Page type
- `page_identifier` (optional): For service-specific pages

**Response:** Same format as admin endpoint, but only returns the single matching record

## File Storage

### Open Graph Images
- Store uploaded images in `storage/seo/` directory
- Recommended dimensions: 1200x630px
- Supported formats: JPG, PNG, WebP
- Maximum file size: 2MB
- Generate optimized versions if needed

### File Naming Convention
```
{page_type}_{page_identifier}_{timestamp}.{extension}
```

Examples:
- `home_1642781800.jpg`
- `services_botox-treatment_1642781800.png`

## Validation Rules

### Server-side Validation
1. **page_type**: Must be one of the allowed enum values
2. **title**: Required, max 255 characters
3. **description**: Required, max 500 characters (recommended: 150-160 chars)
4. **keywords**: Optional, max 1000 characters
5. **og_title**: Required, max 255 characters
6. **og_description**: Required, max 500 characters
7. **og_image**: Optional file upload, image types only, max 2MB
8. **page_identifier**: Optional, max 255 characters, alphanumeric and hyphens only

### Business Logic
1. Only one SEO record per unique combination of `page_type` and `page_identifier`
2. For general pages (home, about, consent, booking), `page_identifier` should be NULL
3. For service-specific SEO, validate that the `page_identifier` matches an existing service slug
4. When updating, preserve existing og_image if no new image is uploaded

## Error Responses

### Validation Error
```json
{
    "success": false,
    "message": "Validation failed",
    "errors": {
        "title": ["The title field is required."],
        "description": ["The description field is required."],
        "og_image": ["The og image must be an image file."]
    }
}
```

### Not Found Error
```json
{
    "success": false,
    "message": "SEO data not found"
}
```

### Duplicate Entry Error
```json
{
    "success": false,
    "message": "SEO data already exists for this page"
}
```

## Integration Notes

1. **Service Integration**: When a service is deleted, consider whether to also delete its SEO data or keep it for historical purposes
2. **Image Cleanup**: Implement cleanup of orphaned og_image files when SEO records are deleted
3. **Caching**: Consider implementing caching for frequently accessed SEO data, especially for public endpoints
4. **Default Values**: If no SEO data exists for a page, the frontend will use fallback values defined in the React components

## Sample Data

```sql
-- Sample SEO data for initial setup
INSERT INTO seo_data (page_type, page_identifier, title, description, keywords, og_title, og_description) VALUES
('home', NULL, 'Aura Aesthetics - Professional Beauty & Wellness Services', 'Transform your beauty journey with our expert aesthetic treatments. Professional skincare, dermal fillers, and wellness services in a luxurious setting.', 'aesthetics, beauty treatments, skincare, dermal fillers, wellness, botox, facial treatments, beauty clinic', 'Aura Aesthetics - Professional Beauty & Wellness Services', 'Transform your beauty journey with our expert aesthetic treatments. Professional skincare, dermal fillers, and wellness services in a luxurious setting.'),

('about', NULL, 'About Us - Aura Aesthetics | Expert Beauty & Wellness Team', 'Meet our experienced team of aesthetic professionals. Learn about our qualifications, values, and commitment to delivering exceptional beauty and wellness services.', 'about aura aesthetics, beauty professionals, aesthetic team, qualifications, experience, wellness experts', 'About Us - Aura Aesthetics | Expert Beauty & Wellness Team', 'Meet our experienced team of aesthetic professionals. Learn about our qualifications, values, and commitment to delivering exceptional beauty and wellness services.'),

('services', NULL, 'Services & Pricing - Aura Aesthetics | Premium Beauty Treatments', 'Discover our comprehensive range of aesthetic services with transparent pricing. From skincare to dermal fillers, explore premium beauty treatments with expert care.', 'aesthetic services, beauty treatments, skincare services, dermal fillers, botox, facial treatments, beauty pricing', 'Services & Pricing - Aura Aesthetics | Premium Beauty Treatments', 'Discover our comprehensive range of aesthetic services with transparent pricing. From skincare to dermal fillers, explore premium beauty treatments with expert care.'),

('consent', NULL, 'Consent Form - Aura Aesthetics | Treatment Agreement', 'Complete your treatment consent form online. Secure and professional documentation for your aesthetic treatment journey with Aura Aesthetics.', 'consent form, treatment agreement, aesthetic consent, medical form, beauty treatment consent', 'Consent Form - Aura Aesthetics | Treatment Agreement', 'Complete your treatment consent form online. Secure and professional documentation for your aesthetic treatment journey with Aura Aesthetics.'),

('booking', NULL, 'Book Appointment - Aura Aesthetics | Schedule Your Treatment', 'Book your aesthetic treatment appointment online. Choose from our range of professional beauty services and secure your preferred time slot at Aura Aesthetics.', 'book appointment, schedule treatment, aesthetic booking, beauty appointment, online booking, aura aesthetics', 'Book Appointment - Aura Aesthetics | Schedule Your Treatment', 'Book your aesthetic treatment appointment online. Choose from our range of professional beauty services and secure your preferred time slot at Aura Aesthetics.');
```

This completes the SEO management system implementation with admin interface, frontend integration, and comprehensive backend API specification.