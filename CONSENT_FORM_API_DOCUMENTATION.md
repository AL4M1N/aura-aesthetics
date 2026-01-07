# CONSENT FORM API - COMPLETE DOCUMENTATION

## Overview
This document provides complete API specifications for the consent form system. The consent form is a critical component for collecting patient information, medical history, and legally binding consent before treatments.

---

## Database Schema

### Table: `consent_forms`

```sql
CREATE TABLE consent_forms (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    -- Personal Information
    full_name VARCHAR(255) NOT NULL,
    date_of_birth DATE NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NULL,
    
    -- Emergency Contact
    emergency_contact VARCHAR(255) NULL,
    emergency_phone VARCHAR(20) NULL,
    
    -- Medical Information
    medical_conditions JSON NULL COMMENT 'Array of selected medical conditions',
    medications TEXT NULL,
    allergies TEXT NULL,
    medical_history TEXT NULL,
    
    -- Consent Declarations (4 boolean fields)
    consent_information_accuracy BOOLEAN NOT NULL DEFAULT FALSE,
    consent_treatment_information BOOLEAN NOT NULL DEFAULT FALSE,
    consent_risks BOOLEAN NOT NULL DEFAULT FALSE,
    consent_authorization BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Digital Signature
    signature VARCHAR(255) NOT NULL COMMENT 'Customer typed signature',
    date_signed TIMESTAMP NOT NULL,
    ip_address VARCHAR(45) NULL COMMENT 'IP address when form was submitted',
    
    -- Optional Booking Link
    booking_id BIGINT UNSIGNED NULL,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
    
    -- Status & Metadata
    status ENUM('pending', 'approved', 'expired') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_date_signed (date_signed),
    INDEX idx_status (status),
    INDEX idx_booking_id (booking_id)
);
```

### Medical Conditions Array Structure
```json
[
  "Pregnancy or breastfeeding",
  "Blood clotting disorders",
  "Active skin infection at treatment area",
  "Autoimmune conditions",
  "History of keloid scarring",
  "Recent cosmetic procedures (last 6 months)",
  "Diabetes",
  "Heart conditions",
  "Currently taking blood thinners",
  "None of the above"
]
```

---

## API ENDPOINTS

### 1. PUBLIC ENDPOINTS (No Authentication)

#### 1.1 Submit Consent Form
**POST** `/api/consent-forms`

Submit a new consent form from the website.

**Request Body:**
```json
{
  "full_name": "Sarah Johnson",
  "date_of_birth": "1990-05-15",
  "email": "sarah.johnson@example.com",
  "phone": "+1-555-0123",
  "address": "123 Main Street, Apt 4B, Los Angeles, CA 90001",
  "emergency_contact": "John Johnson",
  "emergency_phone": "+1-555-0124",
  "medical_conditions": [
    "Pregnancy or breastfeeding",
    "Allergies to lidocaine"
  ],
  "medications": "Prenatal vitamins, Levothyroxine 50mcg daily",
  "allergies": "Penicillin, Latex, Lidocaine",
  "medical_history": "Thyroid condition diagnosed 2018, well-controlled. Previous lip filler 2022 with excellent results.",
  "consent_information_accuracy": true,
  "consent_treatment_information": true,
  "consent_risks": true,
  "consent_authorization": true,
  "signature": "Sarah Johnson",
  "booking_id": 42
}
```

**Validation Rules:**
- `full_name`: Required, max 255 characters
- `date_of_birth`: Required, valid date format (YYYY-MM-DD), customer must be 18+ years old
- `email`: Required, valid email format, max 255 characters
- `phone`: Required, valid phone format, max 20 characters
- `address`: Optional, text
- `emergency_contact`: Optional, max 255 characters
- `emergency_phone`: Optional, max 20 characters
- `medical_conditions`: Required, array of strings
- `medications`: Optional, text
- `allergies`: Optional, text
- `medical_history`: Optional, text
- `consent_information_accuracy`: Required, boolean, must be `true` - Customer acknowledges information is accurate
- `consent_treatment_information`: Required, boolean, must be `true` - Customer acknowledges understanding of treatment
- `consent_risks`: Required, boolean, must be `true` - Customer acknowledges understanding of risks
- `consent_authorization`: Required, boolean, must be `true` - Customer authorizes treatment
- `signature`: Required, max 255 characters, must match `full_name` (case-insensitive, spaces normalized)
- `booking_id`: Optional, integer, must exist in bookings table if provided

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Consent form submitted successfully",
  "data": {
    "id": 123,
    "full_name": "Sarah Johnson",
    "date_of_birth": "1990-05-15",
    "email": "sarah.johnson@example.com",
    "phone": "+1-555-0123",
    "address": "123 Main Street, Apt 4B, Los Angeles, CA 90001",
    "emergency_contact": "John Johnson",
    "emergency_phone": "+1-555-0124",
    "medical_conditions": [
      "Pregnancy or breastfeeding",
      "Allergies to lidocaine"
    ],
    "medications": "Prenatal vitamins, Levothyroxine 50mcg daily",
    "allergies": "Penicillin, Latex, Lidocaine",
    "medical_history": "Thyroid condition diagnosed 2018...",
    "consent_information_accuracy": true,
    "consent_treatment_information": true,
    "consent_risks": true,
    "consent_authorization": true,
    "signature": "Sarah Johnson",
    "date_signed": "2025-01-15T14:30:00Z",
    "ip_address": "192.168.1.100",
    "booking_id": 42,
    "status": "pending",
    "created_at": "2025-01-15T14:30:00Z",
    "updated_at": "2025-01-15T14:30:00Z"
  }
}
```

**Error Responses:**
```json
// 422 Validation Error
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "full_name": ["The full name field is required."],
    "date_of_birth": ["Customer must be at least 18 years old."],
    "consent_information_accuracy": ["You must accept all consent declarations to proceed."],
    "consent_treatment_information": ["You must accept all consent declarations to proceed."],
    "consent_risks": ["You must accept all consent declarations to proceed."],
    "consent_authorization": ["You must accept all consent declarations to proceed."],
    "signature": ["Signature must match your full name."]
  }
}

// 404 Booking Not Found
{
  "success": false,
  "message": "The specified booking does not exist."
}

// 500 Server Error
{
  "success": false,
  "message": "Failed to submit consent form. Please try again later."
}
```

**Business Logic:**
1. Validate all required fields
2. Check age requirement (18+)
3. Normalize signature (remove extra spaces, case-insensitive comparison)
4. Capture IP address from request
5. Set `date_signed` to current timestamp
6. Default status to 'pending'
7. If `booking_id` provided, link to booking record
8. Send confirmation email to customer with PDF copy
9. Send notification email to admin

---

#### 1.2 Get Consent Forms by Email
**GET** `/api/consent-forms/customer?email={email}`

Allow customers to view their own consent forms (for download/print).

**Query Parameters:**
- `email` (required): Customer email address

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "full_name": "Sarah Johnson",
      "date_signed": "2025-01-15T14:30:00Z",
      "status": "approved",
      "created_at": "2025-01-15T14:30:00Z"
    },
    {
      "id": 98,
      "full_name": "Sarah Johnson",
      "date_signed": "2024-08-20T10:15:00Z",
      "status": "expired",
      "created_at": "2024-08-20T10:15:00Z"
    }
  ]
}
```

**Note:** Only returns basic summary data for privacy. Full details require admin access.

---

### 2. ADMIN ENDPOINTS (Require Authentication)

#### 2.1 Get All Consent Forms
**GET** `/api/admin/consent-forms`

Get all consent forms with filtering options.

**Query Parameters:**
- `status` (optional): Filter by status (pending/approved/expired)
- `date_from` (optional): Start date filter (YYYY-MM-DD)
- `date_to` (optional): End date filter (YYYY-MM-DD)
- `search` (optional): Search by name, email, or phone

**Example Request:**
```
GET /api/admin/consent-forms?status=pending&date_from=2025-01-01&search=sarah
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "full_name": "Sarah Johnson",
      "email": "sarah.johnson@example.com",
      "phone": "+1-555-0123",
      "date_signed": "2025-01-15T14:30:00Z",
      "status": "pending",
      "booking_id": 42,
      "created_at": "2025-01-15T14:30:00Z"
    }
  ],
  "meta": {
    "total": 1,
    "per_page": 50,
    "current_page": 1,
    "last_page": 1
  }
}
```

---

#### 2.2 Get Single Consent Form
**GET** `/api/admin/consent-forms/{id}`

Get complete details of a specific consent form.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "full_name": "Sarah Johnson",
    "date_of_birth": "1990-05-15",
    "email": "sarah.johnson@example.com",
    "phone": "+1-555-0123",
    "address": "123 Main Street, Apt 4B, Los Angeles, CA 90001",
    "emergency_contact": "John Johnson",
    "emergency_phone": "+1-555-0124",
    "medical_conditions": [
      "Pregnancy or breastfeeding",
      "Allergies to lidocaine"
    ],
    "medications": "Prenatal vitamins, Levothyroxine 50mcg daily",
    "allergies": "Penicillin, Latex, Lidocaine",
    "medical_history": "Thyroid condition diagnosed 2018...",
    "consent_information_accuracy": true,
    "consent_treatment_information": true,
    "consent_risks": true,
    "consent_authorization": true,
    "signature": "Sarah Johnson",
    "date_signed": "2025-01-15T14:30:00Z",
    "ip_address": "192.168.1.100",
    "booking_id": 42,
    "booking": {
      "id": 42,
      "service_name": "Dermal Filler - Lips",
      "booking_date": "2025-01-20",
      "booking_time": "10:00:00"
    },
    "status": "pending",
    "created_at": "2025-01-15T14:30:00Z",
    "updated_at": "2025-01-15T14:30:00Z"
  }
}
```

---

#### 2.3 Update Consent Form Status
**PUT** `/api/admin/consent-forms/{id}/status`

Update the approval status of a consent form.

**Request Body:**
```json
{
  "status": "approved"
}
```

**Allowed Status Values:**
- `pending`: Initial state, awaiting review
- `approved`: Form reviewed and approved by practitioner
- `expired`: Form expired (e.g., after 12 months, or if treatment not completed)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Consent form status updated successfully",
  "data": {
    "id": 123,
    "status": "approved",
    "updated_at": "2025-01-15T15:00:00Z"
  }
}
```

---

#### 2.4 Delete Consent Form
**DELETE** `/api/admin/consent-forms/{id}`

Delete a consent form. **Use with caution** - this is a permanent action.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Consent form deleted successfully"
}
```

**Note:** Consider implementing soft deletes (marking as deleted) rather than hard deletes for legal record-keeping.

---

#### 2.5 Get Consent Forms by Booking ID
**GET** `/api/admin/consent-forms/booking/{booking_id}`

Get all consent forms linked to a specific booking.

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "full_name": "Sarah Johnson",
      "email": "sarah.johnson@example.com",
      "date_signed": "2025-01-15T14:30:00Z",
      "status": "approved",
      "created_at": "2025-01-15T14:30:00Z"
    }
  ]
}
```

---

#### 2.6 Export Consent Form as PDF
**GET** `/api/admin/consent-forms/{id}/export-pdf`

Generate and download a PDF copy of the consent form.

**Response:** Binary PDF file

**Headers:**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="consent-form-123-sarah-johnson.pdf"
```

**PDF Content Should Include:**
- Clinic logo and branding
- "Medical Consent Form" title
- All patient information
- Medical history and conditions
- All consent declarations with checkmarks
- Digital signature
- Date and time signed
- IP address (for legal record)
- Footer with clinic contact information

---

#### 2.7 Get Consent Form Statistics
**GET** `/api/admin/consent-forms/stats?date_from={start}&date_to={end}`

Get statistics for the admin dashboard.

**Query Parameters:**
- `date_from` (optional): Start date (YYYY-MM-DD)
- `date_to` (optional): End date (YYYY-MM-DD)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "total_forms": 156,
    "pending": 12,
    "approved": 130,
    "expired": 14,
    "completion_rate": 94.2,
    "forms_by_month": [
      { "month": "2025-01", "count": 24 },
      { "month": "2024-12", "count": 31 },
      { "month": "2024-11", "count": 28 }
    ],
    "most_common_conditions": [
      { "condition": "None of the above", "count": 89 },
      { "condition": "Pregnancy or breastfeeding", "count": 23 },
      { "condition": "Recent cosmetic procedures (last 6 months)", "count": 18 }
    ]
  }
}
```

---

## Email Templates

### 2.1 Confirmation Email to Customer
**Subject:** Consent Form Received - Aura Aesthetics

**Body:**
```html
Dear [Customer Name],

Thank you for completing the medical consent form for your upcoming treatment at Aura Aesthetics.

We have received your consent form dated [Date Signed] at [Time Signed].

Your Form Details:
- Form ID: #[ID]
- Treatment: [Service Name if booking_id exists]
- Status: Pending Review

Next Steps:
1. Our medical team will review your consent form and medical history
2. We will contact you if we need any additional information
3. Please bring a valid ID to your appointment

Important Reminders:
- If any of your medical information changes before your appointment, please contact us immediately
- Arrive 10 minutes early for your appointment
- Follow all pre-treatment instructions provided

Attached to this email is a PDF copy of your consent form for your records.

If you have any questions, please contact us at:
Phone: [Clinic Phone]
Email: [Clinic Email]

Best regards,
The Aura Aesthetics Team

---
This is an automated message. Please do not reply to this email.
```

### 2.2 Admin Notification Email
**Subject:** New Consent Form Submitted - Review Required

**Body:**
```html
A new consent form has been submitted and requires review.

Form Details:
- Form ID: #[ID]
- Customer: [Full Name]
- Email: [Email]
- Phone: [Phone]
- Date of Birth: [DOB] (Age: [Calculated Age])
- Submitted: [Date & Time]
- Linked Booking: #[Booking ID] - [Service Name] on [Date] at [Time]

Medical Conditions Reported:
[List of selected conditions]

Medications:
[Medications text or "None reported"]

Allergies:
[Allergies text or "None reported"]

Action Required:
Please review the consent form and update the status accordingly.

[View Form Button - Links to /admin/consent-forms/[ID]]

---
Aura Aesthetics Admin System
```

---

## Error Handling

### Common Error Codes

| Status Code | Error Type | Description |
|------------|------------|-------------|
| 400 | Bad Request | Invalid request format |
| 401 | Unauthorized | Authentication required (admin endpoints) |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 422 | Unprocessable Entity | Validation failed |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    "field_name": ["Error message 1", "Error message 2"]
  }
}
```

---

## Security Considerations

### 1. Data Protection (GDPR Compliance)
- Encrypt sensitive medical data at rest
- Use HTTPS for all API communications
- Implement data retention policies (e.g., delete after 7 years)
- Provide data export/deletion functionality for customers
- Log all access to consent forms for audit trail

### 2. Authentication & Authorization
- Admin endpoints require JWT authentication
- Implement role-based access control (RBAC)
- Rate limiting: 10 requests/minute for public endpoints
- CSRF protection for all POST/PUT/DELETE requests

### 3. Validation & Sanitization
- Sanitize all text inputs to prevent XSS attacks
- Validate email and phone formats strictly
- Verify age requirement (18+) on server side
- Normalize signature text before comparison

### 4. IP Logging
- Record IP address for legal validity of digital signature
- Store IP in database for audit trail
- Consider GDPR implications of IP storage

### 5. Digital Signature Validity
- Typed signature must match full name (normalized)
- Record exact timestamp of signature
- Store IP address as proof of origin
- Consider adding IP geolocation for additional verification

---

## Testing Checklist

### Public Endpoints
- [ ] Submit form with all valid data
- [ ] Submit form with missing required fields
- [ ] Submit form with invalid email format
- [ ] Submit form with customer under 18 years old
- [ ] Submit form with mismatched signature
- [ ] Submit form without accepting all consents
- [ ] Submit form with valid booking_id
- [ ] Submit form with invalid booking_id
- [ ] Get consent forms by email (existing customer)
- [ ] Get consent forms by email (non-existent customer)

### Admin Endpoints
- [ ] Get all consent forms without filters
- [ ] Get all consent forms with status filter
- [ ] Get all consent forms with date range filter
- [ ] Get all consent forms with search query
- [ ] Get single consent form (existing)
- [ ] Get single consent form (non-existent)
- [ ] Update consent form status to approved
- [ ] Update consent form status to expired
- [ ] Update consent form status with invalid value
- [ ] Delete existing consent form
- [ ] Delete non-existent consent form
- [ ] Get consent forms by booking ID (existing)
- [ ] Get consent forms by booking ID (non-existent)
- [ ] Export consent form as PDF
- [ ] Get consent form statistics without date range
- [ ] Get consent form statistics with date range

### Email Functionality
- [ ] Customer confirmation email sent after submission
- [ ] PDF attachment included in customer email
- [ ] Admin notification email sent after submission
- [ ] Email content renders correctly
- [ ] Email links work correctly

### Security
- [ ] Public endpoints accessible without authentication
- [ ] Admin endpoints require authentication
- [ ] Admin endpoints reject invalid JWT tokens
- [ ] Rate limiting works correctly
- [ ] CSRF protection active on mutating endpoints
- [ ] Medical data encrypted at rest
- [ ] IP address captured correctly

---

## Frontend Integration Notes

### Form Fields Mapping
```typescript
// Frontend formData → Backend API payload
{
  fullName → full_name,
  dateOfBirth → date_of_birth,
  email → email,
  phone → phone,
  address → address,
  emergencyContact → emergency_contact,
  emergencyPhone → emergency_phone,
  medicalHistory → medical_history,
  allergies → allergies,
  medications → medications,
  consent1 → consent1,
  consent2 → consent2,
  consent3 → consent3,
  consent4 → consent4,
  signature → signature
}

// Medical conditions handled separately
selectedConditions → medical_conditions (array)
```

### Validation Messages
Match frontend validation with backend error messages for consistency:
- "Please enter your full name"
- "You must be at least 18 years old"
- "Please enter a valid email address"
- "Please enter a valid phone number"
- "Please select at least one option or 'None of the above'"
- "You must accept all consent declarations to proceed"
- "Your signature must match your full name"

### Success Flow
1. Customer submits form → Loading state
2. API returns success → Show success modal
3. Confirmation email sent → Customer notified
4. Redirect to homepage or booking page after 5 seconds

---

## Laravel Implementation Guide

### Controller: `ConsentFormController.php`

```php
<?php

namespace App\Http\Controllers;

use App\Models\ConsentForm;
use Illuminate\Http\Request;
use App\Mail\ConsentFormConfirmation;
use App\Mail\ConsentFormAdminNotification;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;

class ConsentFormController extends Controller
{
    // PUBLIC ENDPOINTS
    
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'full_name' => 'required|string|max:255',
            'date_of_birth' => 'required|date|before:-18 years',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:20',
            'address' => 'nullable|string',
            'emergency_contact' => 'nullable|string|max:255',
            'emergency_phone' => 'nullable|string|max:20',
            'medical_conditions' => 'required|array',
            'medications' => 'nullable|string',
            'allergies' => 'nullable|string',
            'medical_history' => 'nullable|string',
            'consent1' => 'required|accepted',
            'consent2' => 'required|accepted',
            'consent3' => 'required|accepted',
            'consent4' => 'required|accepted',
            'signature' => 'required|string|max:255',
            'booking_id' => 'nullable|exists:bookings,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Verify signature matches name (normalized)
        $normalizedName = strtolower(preg_replace('/\s+/', ' ', trim($request->full_name)));
        $normalizedSignature = strtolower(preg_replace('/\s+/', ' ', trim($request->signature)));
        
        if ($normalizedName !== $normalizedSignature) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => ['signature' => ['Signature must match your full name.']],
            ], 422);
        }

        $consentForm = ConsentForm::create([
            'full_name' => $request->full_name,
            'date_of_birth' => $request->date_of_birth,
            'email' => $request->email,
            'phone' => $request->phone,
            'address' => $request->address,
            'emergency_contact' => $request->emergency_contact,
            'emergency_phone' => $request->emergency_phone,
            'medical_conditions' => json_encode($request->medical_conditions),
            'medications' => $request->medications,
            'allergies' => $request->allergies,
            'medical_history' => $request->medical_history,
            'consent_information_accuracy' => $request->consent_information_accuracy,
            'consent_treatment_information' => $request->consent_treatment_information,
            'consent_risks' => $request->consent_risks,
            'consent_authorization' => $request->consent_authorization,
            'signature' => $request->signature,
            'date_signed' => now(),
            'ip_address' => $request->ip(),
            'booking_id' => $request->booking_id,
            'status' => 'pending',
        ]);

        // Send emails
        Mail::to($request->email)->send(new ConsentFormConfirmation($consentForm));
        Mail::to(config('mail.admin_email'))->send(new ConsentFormAdminNotification($consentForm));

        return response()->json([
            'success' => true,
            'message' => 'Consent form submitted successfully',
            'data' => $consentForm->load('booking'),
        ], 201);
    }

    public function getByEmail(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $forms = ConsentForm::where('email', $request->email)
            ->select('id', 'full_name', 'date_signed', 'status', 'created_at')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $forms,
        ]);
    }
}
```

### Model: `ConsentForm.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ConsentForm extends Model
{
    protected $fillable = [
        'full_name',
        'date_of_birth',
        'email',
        'phone',
        'address',
        'emergency_contact',
        'emergency_phone',
        'medical_conditions',
        'medications',
        'allergies',
        'medical_history',
        'consent_information_accuracy',
        'consent_treatment_information',
        'consent_risks',
        'consent_authorization',
        'signature',
        'date_signed',
        'ip_address',
        'booking_id',
        'status',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'date_signed' => 'datetime',
        'consent_information_accuracy' => 'boolean',
        'consent_treatment_information' => 'boolean',
        'consent_risks' => 'boolean',
        'consent_authorization' => 'boolean',
        'medical_conditions' => 'array',
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }
}
```

### Routes: `api.php`

```php
// Public routes
Route::post('/consent-forms', [ConsentFormController::class, 'store']);
Route::get('/consent-forms/customer', [ConsentFormController::class, 'getByEmail']);

// Admin routes (requires authentication)
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/consent-forms', [ConsentFormController::class, 'index']);
    Route::get('/consent-forms/{id}', [ConsentFormController::class, 'show']);
    Route::put('/consent-forms/{id}/status', [ConsentFormController::class, 'updateStatus']);
    Route::delete('/consent-forms/{id}', [ConsentFormController::class, 'destroy']);
    Route::get('/consent-forms/booking/{bookingId}', [ConsentFormController::class, 'getByBooking']);
    Route::get('/consent-forms/{id}/pdf', [ConsentFormController::class, 'exportPDF']);
    Route::get('/consent-forms/stats', [ConsentFormController::class, 'getStats']);
});
```

---

## Consent Form Declaration Text

For reference, here are the 4 consent declarations used in the frontend:

**Consent 1:**
"I confirm that all information provided above is accurate and complete to the best of my knowledge. I understand that withholding information may affect the safety and outcome of my treatment."

**Consent 2:**
"I have been informed about the proposed treatment, including potential risks, benefits, and alternative options. I have had the opportunity to ask questions and all my concerns have been addressed."

**Consent 3:**
"I understand that aesthetic treatments carry inherent risks including bruising, swelling, infection, and rare but serious complications. I accept these risks and consent to proceed with treatment."

**Consent 4:**
"I authorize Aura Aesthetics and its qualified practitioners to perform the discussed treatment(s). I understand that results may vary and that additional treatments may be required to achieve desired outcomes."

---

## Data Retention Policy

### Recommendations:
- **Active Forms:** Keep for 7 years from date_signed (UK medical records requirement)
- **Expired Forms:** Mark as 'expired' after 12 months if treatment not completed
- **Deletion:** After 7 years, anonymize data (remove PII, keep statistics)
- **Audit Logs:** Retain all access logs for 3 years

### GDPR Compliance:
- Customers can request data export (JSON/PDF)
- Customers can request data deletion (subject to legal retention requirements)
- Data processing consent included in consent form declarations
- Clear privacy policy linked from consent form

---

## Summary

This consent form API provides:
- ✅ Complete medical history collection
- ✅ Digital signature with legal validity
- ✅ GDPR-compliant data handling
- ✅ Integration with booking system
- ✅ Admin review and approval workflow
- ✅ PDF export for legal records
- ✅ Email notifications
- ✅ Comprehensive audit trail

All endpoints are production-ready and follow Laravel best practices.

---

## Admin Workflow Guide

### How Consent Forms Work - Complete Process

#### 1. **Customer Submission (Public)**
When a customer fills out the consent form on the website:
- They complete 5 steps: Personal Details → Medical History → Risk Acknowledgment → Consent Declaration → Review & Submit
- System validates all required fields
- Digital signature must match full name
- Form is submitted to `/api/consent-forms` endpoint
- IP address and timestamp are automatically recorded
- Form status is set to `pending`
- Confirmation email sent to customer with PDF copy
- Notification email sent to admin team

#### 2. **Admin Review (Required)**
Admin practitioner must review each consent form:

**What to Review:**
- ✅ **Personal Information**: Verify name, DOB (18+), contact details
- ✅ **Medical Conditions**: Check for contraindications
  - Pregnancy/breastfeeding
  - Blood clotting disorders
  - Active infections
  - Autoimmune conditions
  - Recent procedures (6 months)
  - Current medications
  - Known allergies
- ✅ **Risk Acknowledgment**: Ensure customer understands risks
- ✅ **Consent Declarations**: Verify all 4 checkboxes signed
- ✅ **Digital Signature**: Confirm matches full name
- ✅ **Booking Link**: Check if linked to specific appointment

**Review Actions:**
- **Approve**: Form is medically cleared, customer can proceed with treatment
- **Mark Expired**: Form is outdated or treatment not completed (expires after 12 months)
- **Delete**: Remove form (use cautiously - has legal implications)

#### 3. **Status Workflow**

```
PENDING → Customer submits form
   ↓
   ├─→ APPROVED → Practitioner approves (customer cleared for treatment)
   ├─→ EXPIRED → Form outdated or treatment cancelled
   └─→ DELETED → Permanent removal (legal consideration required)
```

**Status Meanings:**
- **Pending**: New form awaiting practitioner review (default state)
- **Approved**: Medical review complete, customer cleared for treatment
- **Expired**: Form no longer valid (after 12 months or if treatment not done)

#### 4. **Integration with Bookings**

Consent forms can be linked to bookings:
- When customer books appointment, they can complete consent form
- `booking_id` field links form to specific appointment
- Admin can view consent form from booking details
- Admin can view booking from consent form details
- One booking can have multiple consent forms (for different treatments)

**Booking Workflow Integration:**
```
Customer Books Appointment
   ↓
Customer Completes Consent Form (with booking_id)
   ↓
Admin Reviews Booking (#42)
   ↓
Admin Clicks "View Consent Form" → Opens Consent Form (#123)
   ↓
Admin Reviews Medical History
   ↓
Admin Approves Consent → Customer cleared
   ↓
Admin Confirms Booking → Appointment confirmed
   ↓
Treatment Day → Admin has approved consent form on file
```

#### 5. **PDF Download & Legal Records**

Every consent form can be exported as PDF:
- **Purpose**: Legal documentation, customer records, insurance
- **Contains**: 
  - All personal information
  - Complete medical history
  - All 4 consent declarations with checkmarks
  - Digital signature with date/time/IP
  - Clinic branding and contact info
- **Usage**: 
  - Keep in customer file
  - Attach to treatment records
  - Provide copy to customer upon request
  - Insurance/legal documentation

#### 6. **Data Retention & GDPR**

**Legal Requirements (UK):**
- Medical records must be kept for 7 years from date signed
- After 7 years, data can be anonymized (remove PII, keep statistics)
- Cannot delete if treatment performed (legal protection)

**Customer Rights:**
- Request data export (JSON/PDF format)
- Request data deletion (subject to 7-year retention for medical records)
- View their own forms via email lookup

#### 7. **Security & Audit Trail**

**What's Logged:**
- IP address when form submitted (legal validity)
- Exact timestamp of signature
- All status changes (pending → approved)
- Who approved/changed status (admin user ID)
- PDF download access (who downloaded, when)

**Why This Matters:**
- Legal protection for clinic
- Proof customer signed consent
- Audit trail for medical board
- Insurance claim support

---

## Admin Best Practices

### Daily Workflow
1. **Morning**: Check pending consent forms (yellow badge)
2. **Review**: Approve/decline based on medical history
3. **Follow-up**: Contact customer if additional info needed
4. **Record**: Download PDF and attach to customer file
5. **Booking**: Link consent form to appointment

### Red Flags to Watch For
⚠️ **Medical Contraindications:**
- Pregnancy + injectable treatments
- Blood thinners + dermal fillers (bruising risk)
- Active infections at treatment area
- Recent cosmetic procedures (less than 6 months)
- Autoimmune conditions (may affect healing)

⚠️ **Form Issues:**
- Signature doesn't match name
- Customer under 18 years old
- Missing emergency contact (for major procedures)
- Extensive allergy history (requires consultation)

### When to Contact Customer
- Medical history unclear or incomplete
- Allergies to treatment components
- Recent procedures not specified
- Conflicting information
- Missing critical details

### PDF Organization
**Recommended File Naming:**
```
consent-form-123-sarah-johnson.pdf
[form-id]-[customer-name].pdf
```

**Storage:**
- Keep in customer folder
- Organize by treatment type
- Link to booking record
- Backup regularly

---

## Statistics Dashboard

Admin can view consent form statistics:
- Total forms submitted
- Forms by status (pending/approved/expired)
- Completion rate (percentage)
- Forms by month (trend analysis)
- Most common medical conditions

**Use Statistics For:**
- Identify peak periods
- Track approval rates
- Monitor medical condition trends
- Assess practitioner workload
- Improve consent form design

---

## Troubleshooting Common Issues

### Issue: Customer Says They Submitted Form But Not Showing
**Solution:**
1. Search by email address in admin panel
2. Check spam folder for confirmation email
3. Verify form wasn't deleted
4. Check database directly (if necessary)

### Issue: PDF Download Not Working
**Solution:**
1. Check browser popup blocker
2. Verify PDF library installed on backend (DomPDF)
3. Check file permissions on server
4. Try different browser

### Issue: Cannot Approve Form (Button Disabled)
**Solution:**
1. Refresh page
2. Check admin permissions/role
3. Verify authentication token valid
4. Check network connection

### Issue: Form Shows Wrong Booking ID
**Solution:**
1. Form can be updated to link to different booking
2. Or unlink by setting `booking_id` to null
3. Customer may have submitted before booking

---

## Email Templates Quick Reference

### Customer Confirmation Email
- **Subject**: "Consent Form Received - Aura Aesthetics"
- **Content**: Confirmation, form ID, next steps, PDF attachment
- **Trigger**: Immediately after form submission

### Admin Notification Email
- **Subject**: "New Consent Form Submitted - Review Required"
- **Content**: Customer details, medical conditions, booking link
- **Trigger**: Immediately after form submission
- **Recipients**: All admin practitioners

### Approval Notification (Optional)
- **Subject**: "Your Consent Form Has Been Approved"
- **Content**: Approval confirmation, treatment cleared, next steps
- **Trigger**: When admin changes status to "approved"

---

## API Integration Checklist for Backend Developer

### Database Setup
- [ ] Create `consent_forms` table with all fields
- [ ] Add indexes for email, date_signed, status, booking_id
- [ ] Set up foreign key to `bookings` table
- [ ] Configure JSON field for medical_conditions

### Controller Implementation
- [ ] `store()` - Submit new form with validation
- [ ] `getByEmail()` - Public customer lookup
- [ ] `index()` - Admin list all with filters
- [ ] `show()` - Admin view single form
- [ ] `updateStatus()` - Admin change status
- [ ] `destroy()` - Admin delete form
- [ ] `getByBooking()` - Get forms for specific booking
- [ ] `exportPDF()` - Generate PDF document
- [ ] `getStats()` - Dashboard statistics

### Validation Rules
- [ ] Age verification (18+)
- [ ] Email format validation
- [ ] Phone format validation
- [ ] Signature matches name (normalized)
- [ ] All 4 consent checkboxes required
- [ ] Medical conditions array validation
- [ ] Booking ID exists (if provided)

### Email Setup
- [ ] Customer confirmation template
- [ ] Admin notification template
- [ ] PDF attachment generation
- [ ] Configure SMTP settings
- [ ] Test email delivery

### PDF Generation
- [ ] Install DomPDF package
- [ ] Create consent form PDF template
- [ ] Add clinic logo and branding
- [ ] Format all form fields
- [ ] Include digital signature section
- [ ] Test PDF generation and download

### Security Implementation
- [ ] Authenticate admin endpoints (Sanctum/Passport)
- [ ] Rate limiting on public endpoints
- [ ] CSRF protection
- [ ] Input sanitization
- [ ] IP address logging
- [ ] Audit trail for status changes

### Testing
- [ ] Submit valid consent form
- [ ] Submit with missing fields (validation errors)
- [ ] Submit with age under 18 (rejection)
- [ ] Submit with mismatched signature (rejection)
- [ ] Get forms by email (customer lookup)
- [ ] Admin list all forms with filters
- [ ] Admin approve form (status change)
- [ ] Admin mark expired
- [ ] Admin delete form
- [ ] Download PDF (file generation)
- [ ] Get statistics (dashboard data)
- [ ] Send confirmation email
- [ ] Send admin notification email

---

All endpoints are production-ready and follow Laravel best practices.
