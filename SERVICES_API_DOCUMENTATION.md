# Services API Documentation - With Categories

## Overview
Complete restructuring of services to include service categories for better organization and tab-based navigation.

---

## Database Schema

### **Service Categories Table**
```sql
CREATE TABLE service_categories (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NULL,
    icon VARCHAR(100) NULL, -- Icon name for UI (e.g., 'syringe', 'sparkles')
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);
```

### **Services Table (Updated)**
```sql
ALTER TABLE services ADD COLUMN category_id BIGINT UNSIGNED NULL AFTER id;
ALTER TABLE services ADD FOREIGN KEY (category_id) REFERENCES service_categories(id) ON DELETE SET NULL;
```

**Complete Services Table Structure:**
```sql
CREATE TABLE services (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    category_id BIGINT UNSIGNED NULL, -- NEW: Foreign key to service_categories
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    excerpt TEXT NULL,
    detail_content TEXT NULL,
    featured_image VARCHAR(255) NULL,
    price_range VARCHAR(100) NULL,
    duration VARCHAR(100) NULL,
    benefits JSON NULL,
    process_steps JSON NULL,
    gallery_images JSON NULL,
    before_after_images JSON NULL,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    FOREIGN KEY (category_id) REFERENCES service_categories(id) ON DELETE SET NULL
);
```

### **Service Instructions Table (NEW)**
```sql
CREATE TABLE service_instructions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    type ENUM('consultation_required', 'professional_excellence') NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    icon VARCHAR(100) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);
```

**Seeded Default Data:**
```sql
INSERT INTO service_instructions (type, title, content, icon, is_active) VALUES
('consultation_required', 'Consultation Required', 'All treatments require an initial consultation to ensure suitability and discuss realistic expectations. Your safety and satisfaction are our highest priorities.', 'calendar-check', TRUE),
('professional_excellence', 'Professional Excellence', 'All treatments performed by a CPD-accredited aesthetic practitioner using premium, medical-grade products in a safe, professional environment.', 'award', TRUE);
```

---

## API Endpoints

### **Service Categories**

#### 1. Get All Categories (Admin)
```
GET /api/admin/service-categories
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Service categories retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Dermal Fillers",
      "slug": "dermal-fillers",
      "description": "Volume restoration and facial contouring",
      "icon": "syringe",
      "sort_order": 1,
      "is_active": true,
      "services_count": 5,
      "created_at": "2026-01-07T10:00:00.000000Z",
      "updated_at": "2026-01-07T10:00:00.000000Z"
    }
  ]
}
```

#### 2. Get Active Categories (Public)
```
GET /api/service-categories
```

**Response:**
```json
{
  "success": true,
  "message": "Service categories retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Dermal Fillers",
      "slug": "dermal-fillers",
      "description": "Volume restoration and facial contouring",
      "icon": "syringe",
      "sort_order": 1,
      "services_count": 5
    }
  ]
}
```

#### 3. Get Single Category (Admin)
```
GET /api/admin/service-categories/{id}
Authorization: Bearer {token}
```

#### 4. Get Category by Slug with Services (Public)
```
GET /api/service-categories/{slug}
```

**Response:**
```json
{
  "success": true,
  "message": "Service category retrieved successfully",
  "data": {
    "id": 1,
    "name": "Dermal Fillers",
    "slug": "dermal-fillers",
    "description": "Volume restoration and facial contouring",
    "icon": "syringe",
    "sort_order": 1,
    "services": [
      {
        "id": 1,
        "title": "Lip Enhancement",
        "slug": "lip-enhancement",
        "excerpt": "Natural lip augmentation...",
        "featured_image": "/uploads/services/lip-enhancement.jpg",
        "price_range": "£200 - £350",
        "duration": "30-45 minutes",
        "sort_order": 1
      }
    ]
  }
}
```

#### 5. Create Category
```
POST /api/admin/service-categories
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Dermal Fillers",
  "slug": "dermal-fillers", // Optional - auto-generated from name
  "description": "Volume restoration and facial contouring",
  "icon": "syringe",
  "sort_order": 1,
  "is_active": true
}
```

#### 6. Update Category
```
PUT /api/admin/service-categories/{id}
Authorization: Bearer {token}
```

#### 7. Delete Category
```
DELETE /api/admin/service-categories/{id}
Authorization: Bearer {token}
```

#### 8. Update Category Status
```
PUT /api/admin/service-categories/{id}/status
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "status": true
}
```

---

### **Services (Updated)**

#### 1. Get All Services (Admin)
```
GET /api/admin/services
Authorization: Bearer {token}
```

**Response (Updated with category):**
```json
{
  "success": true,
  "message": "Services retrieved successfully",
  "data": [
    {
      "id": 1,
      "category_id": 1,
      "category": {
        "id": 1,
        "name": "Dermal Fillers",
        "slug": "dermal-fillers"
      },
      "slug": "lip-enhancement",
      "title": "Lip Enhancement",
      "excerpt": "Natural lip augmentation...",
      "detail_content": "Full detailed content...",
      "featured_image": "/uploads/services/lip-enhancement.jpg",
      "price_range": "£200 - £350",
      "duration": "30-45 minutes",
      "benefits": [
        "Natural-looking results",
        "Immediate effects"
      ],
      "process_steps": [
        {
          "step": 1,
          "title": "Consultation",
          "description": "Discuss your goals..."
        }
      ],
      "gallery_images": ["/uploads/services/gallery/1.jpg"],
      "before_after_images": [
        {
          "before": "/uploads/services/before/1.jpg",
          "after": "/uploads/services/after/1.jpg",
          "description": "3 months results"
        }
      ],
      "is_featured": true,
      "is_active": true,
      "sort_order": 1,
      "created_at": "2026-01-07T10:00:00.000000Z",
      "updated_at": "2026-01-07T10:00:00.000000Z"
    }
  ]
}
```

#### 2. Get Active Services by Category (Public)
```
GET /api/services?category={slug}
```

**Response:**
```json
{
  "success": true,
  "message": "Services retrieved successfully",
  "data": [
    {
      "id": 1,
      "title": "Lip Enhancement",
      "slug": "lip-enhancement",
      "excerpt": "Natural lip augmentation...",
      "featured_image": "/uploads/services/lip-enhancement.jpg",
      "price_range": "£200 - £350",
      "duration": "30-45 minutes",
      "benefits": ["Natural-looking results"],
      "sort_order": 1
    }
  ]
}
```

#### 3. Get All Active Services (Public - Services Page)
```
GET /api/services
```

Returns all active services grouped by category.

#### 4. Get Featured Services (Homepage)
```
GET /api/services/featured
```

#### 5. Get Single Service by Slug (Public)
```
GET /api/services/{slug}
```

**Response (Updated with category):**
```json
{
  "success": true,
  "message": "Service retrieved successfully",
  "data": {
    "id": 1,
    "category": {
      "id": 1,
      "name": "Dermal Fillers",
      "slug": "dermal-fillers"
    },
    "slug": "lip-enhancement",
    "title": "Lip Enhancement",
    "excerpt": "Natural lip augmentation...",
    "detail_content": "Full detailed content with HTML...",
    "featured_image": "/uploads/services/lip-enhancement.jpg",
    "price_range": "£200 - £350",
    "duration": "30-45 minutes",
    "benefits": [
      "Natural-looking results",
      "Immediate effects",
      "Long-lasting (6-12 months)"
    ],
    "process_steps": [
      {
        "step": 1,
        "title": "Consultation",
        "description": "We discuss your goals..."
      }
    ],
    "gallery_images": [
      "/uploads/services/gallery/1.jpg",
      "/uploads/services/gallery/2.jpg"
    ],
    "before_after_images": [
      {
        "before": "/uploads/services/before/1.jpg",
        "after": "/uploads/services/after/1.jpg",
        "description": "3 months after treatment"
      }
    ]
  }
}
```

#### 6. Create Service (Updated)
```
POST /api/admin/services
Authorization: Bearer {token}
```

**Request Body (Updated):**
```json
{
  "category_id": 1, // NEW: Required
  "title": "Lip Enhancement",
  "slug": "lip-enhancement", // Optional - auto-generated
  "excerpt": "Natural lip augmentation...",
  "detail_content": "Full content...",
  "featured_image": "data:image/jpeg;base64,..." or "/uploads/...",
  "price_range": "£200 - £350",
  "duration": "30-45 minutes",
  "benefits": [
    "Natural-looking results",
    "Immediate effects"
  ],
  "process_steps": [
    {
      "step": 1,
      "title": "Consultation",
      "description": "..."
    }
  ],
  "gallery_images": ["data:image/jpeg;base64,..."],
  "before_after_images": [
    {
      "before": "data:image/jpeg;base64,...",
      "after": "data:image/jpeg;base64,...",
      "description": "3 months results"
    }
  ],
  "is_featured": true,
  "is_active": true,
  "sort_order": 1
}
```

#### 7. Update Service
```
PUT /api/admin/services/{id}
Authorization: Bearer {token}
```

---

### **Service Instructions**

#### 1. Get All Instructions (Admin)
```
GET /api/admin/service-instructions
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Service instructions retrieved successfully",
  "data": [
    {
      "id": 1,
      "type": "consultation_required",
      "title": "Consultation Required",
      "content": "All treatments require an initial consultation...",
      "icon": "calendar-check",
      "is_active": true,
      "created_at": "2026-01-07T10:00:00.000000Z",
      "updated_at": "2026-01-07T10:00:00.000000Z"
    },
    {
      "id": 2,
      "type": "professional_excellence",
      "title": "Professional Excellence",
      "content": "All treatments performed by a CPD-accredited...",
      "icon": "award",
      "is_active": true,
      "created_at": "2026-01-07T10:00:00.000000Z",
      "updated_at": "2026-01-07T10:00:00.000000Z"
    }
  ]
}
```

#### 2. Get Active Instructions (Public)
```
GET /api/service-instructions
```

**Response:**
```json
{
  "success": true,
  "message": "Service instructions retrieved successfully",
  "data": [
    {
      "id": 1,
      "type": "consultation_required",
      "title": "Consultation Required",
      "content": "All treatments require an initial consultation...",
      "icon": "calendar-check"
    },
    {
      "id": 2,
      "type": "professional_excellence",
      "title": "Professional Excellence",
      "content": "All treatments performed by a CPD-accredited...",
      "icon": "award"
    }
  ]
}
```

#### 3. Update Instruction
```
PUT /api/admin/service-instructions/{id}
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "title": "Consultation Required",
  "content": "Updated content...",
  "icon": "calendar-check",
  "is_active": true
}
```

---

## Updated Routes

```php
// api.php

// Public Routes (No Auth)
Route::prefix('service-categories')->group(function () {
    Route::get('/', [ServiceCategoryController::class, 'indexPublic']);
    Route::get('/{slug}', [ServiceCategoryController::class, 'showBySlug']);
});

Route::prefix('services')->group(function () {
    Route::get('/', [ServiceController::class, 'indexPublic']);
    Route::get('/featured', [ServiceController::class, 'indexFeatured']);
    Route::get('/{slug}', [ServiceController::class, 'showBySlug']);
});

Route::get('/service-instructions', [ServiceInstructionController::class, 'indexPublic']);

// Admin Routes (Auth Required)
Route::middleware(['auth:sanctum'])->prefix('admin')->group(function () {
    // Service Categories
    Route::get('/service-categories', [ServiceCategoryController::class, 'index']);
    Route::get('/service-categories/{id}', [ServiceCategoryController::class, 'show']);
    Route::post('/service-categories', [ServiceCategoryController::class, 'store']);
    Route::put('/service-categories/{id}', [ServiceCategoryController::class, 'update']);
    Route::put('/service-categories/{id}/status', [ServiceCategoryController::class, 'updateStatus']);
    Route::delete('/service-categories/{id}', [ServiceCategoryController::class, 'destroy']);
    
    // Services (Existing - updated to include category)
    Route::get('/services', [ServiceController::class, 'index']);
    Route::get('/services/{id}', [ServiceController::class, 'show']);
    Route::post('/services', [ServiceController::class, 'store']);
    Route::put('/services/{id}', [ServiceController::class, 'update']);
    Route::put('/services/{id}/status', [ServiceController::class, 'updateStatus']);
    Route::delete('/services/{id}', [ServiceController::class, 'destroy']);
    
    // Service Instructions
    Route::get('/service-instructions', [ServiceInstructionController::class, 'index']);
    Route::put('/service-instructions/{id}', [ServiceInstructionController::class, 'update']);
});
```

---

## TypeScript Interfaces (Frontend)

```typescript
// Service Category
export interface ServiceCategory {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  sort_order: number;
  is_active: boolean;
  services_count?: number;
  services?: Service[];
  created_at: string;
  updated_at: string;
}

export interface ServiceCategoryPayload {
  name: string;
  slug?: string;
  description?: string | null;
  icon?: string | null;
  sort_order?: number;
  is_active?: boolean;
}

// Service (Updated)
export interface Service {
  id: number;
  category_id?: number | null;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
  slug: string;
  title: string;
  excerpt?: string | null;
  detail_content?: string | null;
  featured_image?: string | null;
  price_range?: string | null;
  duration?: string | null;
  benefits?: string[] | null;
  process_steps?: ProcessStep[] | null;
  gallery_images?: string[] | null;
  before_after_images?: BeforeAfter[] | null;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ServicePayload {
  category_id?: number | null;
  slug?: string;
  title: string;
  excerpt?: string | null;
  detail_content?: string | null;
  featured_image?: string | null;
  price_range?: string | null;
  duration?: string | null;
  benefits?: string[];
  process_steps?: ProcessStep[];
  gallery_images?: string[];
  before_after_images?: BeforeAfter[];
  is_featured?: boolean;
  is_active?: boolean;
  sort_order?: number;
}

// Service Instruction
export interface ServiceInstruction {
  id: number;
  type: 'consultation_required' | 'professional_excellence';
  title: string;
  content: string;
  icon?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ServiceInstructionPayload {
  title: string;
  content: string;
  icon?: string | null;
  is_active?: boolean;
}

// Supporting interfaces
interface ProcessStep {
  step: number;
  title: string;
  description: string;
}

interface BeforeAfter {
  before: string;
  after: string;
  description?: string;
}
```

---

## Migration Steps

1. Create `service_categories` table
2. Create `service_instructions` table
3. Add `category_id` column to `services` table
4. Seed default service instructions
5. Create sample service categories
6. Update existing services with category IDs

---

## Implementation Checklist

### Backend:
- [ ] Create migration for service_categories table
- [ ] Create migration for service_instructions table
- [ ] Create migration to add category_id to services
- [ ] Create ServiceCategory model
- [ ] Create ServiceInstruction model
- [ ] Create ServiceCategoryController
- [ ] Create ServiceInstructionController
- [ ] Update ServiceController to include category relationship
- [ ] Update routes
- [ ] Seed default data

### Frontend:
- [ ] Add TypeScript interfaces to types.ts
- [ ] Create serviceCategoriesService.ts
- [ ] Create serviceInstructionsService.ts
- [ ] Update servicesService.ts
- [ ] Create CategoryManagement admin page
- [ ] Update ServicesManagement admin page
- [ ] Create ServiceInstructions admin page
- [ ] Rebuild Services public page with tabs
- [ ] Update ServiceDetail page to show image and instructions
- [ ] Add "Book Now" buttons to services pages

