# CONSENT FORM API - BACKEND IMPLEMENTATION CHECKLIST

This checklist guides Laravel backend developers through implementing the consent form API. Check off each item as you complete it.

---

## 📋 PHASE 1: Database Setup

### Step 1: Create Migration
- [ ] Run: `php artisan make:migration create_consent_forms_table`
- [ ] Copy database schema from [CONSENT_FORM_API_DOCUMENTATION.md](CONSENT_FORM_API_DOCUMENTATION.md#database-schema)
- [ ] Add all fields with correct types
- [ ] Set up indexes (email, date_signed, status, booking_id)
- [ ] Add foreign key constraint to bookings table
- [ ] Run migration: `php artisan migrate`
- [ ] Verify table created: Check phpMyAdmin/database

**Expected Result:**
```sql
Table: consent_forms
- 23 columns including id, timestamps
- Indexes on email, date_signed, status, booking_id
- Foreign key to bookings(id)
```

---

## 📋 PHASE 2: Model Setup

### Step 2: Create Model
- [ ] Run: `php artisan make:model ConsentForm`
- [ ] Add `$fillable` array (all 20+ fields)
- [ ] Add `$casts` array:
  - [ ] `date_of_birth` → `date`
  - [ ] `date_signed` → `datetime`
  - [ ] `consent_declaration_1-4` → `boolean`
  - [ ] `medical_conditions` → `array` (JSON)
- [ ] Add `booking()` relationship method:
  ```php
  public function booking() {
      return $this->belongsTo(Booking::class);
  }
  ```
- [ ] Test model in tinker: `php artisan tinker`

**Test Commands:**
```php
ConsentForm::count()  // Should return 0 initially
ConsentForm::first()  // Should return null initially
```

---

## 📋 PHASE 3: Controller - Public Endpoints

### Step 3: Create Controller
- [ ] Run: `php artisan make:controller ConsentFormController`
- [ ] Add `use` statements:
  ```php
  use App\Models\ConsentForm;
  use Illuminate\Http\Request;
  use Illuminate\Support\Facades\Validator;
  use Illuminate\Support\Facades\Mail;
  use Carbon\Carbon;
  ```

### Step 4: Implement `store()` Method (Submit Form)
- [ ] Create validation rules:
  - [ ] `full_name` - required, string, max:255
  - [ ] `date_of_birth` - required, date, before:-18 years
  - [ ] `email` - required, email, max:255
  - [ ] `phone` - required, string, max:20
  - [ ] `medical_conditions` - required, array
  - [ ] `consent_information_accuracy` - required, boolean
  - [ ] `consent_treatment_information` - required, boolean
  - [ ] `consent_risks` - required, boolean
  - [ ] `consent_authorization` - required, boolean
  - [ ] `signature` - required, string, max:255
  - [ ] `booking_id` - nullable, exists:bookings,id
- [ ] Add signature validation (normalize and compare with name)
- [ ] Create consent form record
- [ ] Set `date_signed` to `now()`
- [ ] Capture IP address: `$request->ip()`
- [ ] Set status to `'pending'`
- [ ] Return 201 response with created form
- [ ] Handle validation errors (422 response)

**Test Endpoint:**
```bash
POST http://localhost:8000/api/consent-forms
Content-Type: application/json

{
  "full_name": "Test Customer",
  "date_of_birth": "1990-01-01",
  "email": "test@example.com",
  "phone": "+1-555-0123",
  "address": "123 Test St",
  "medical_conditions": ["None of the above"],
  "consent_information_accuracy": true,
  "consent_treatment_information": true,
  "consent_risks": true,
  "consent_authorization": true,
  "signature": "Test Customer"
}
```

Expected: 201 response with consent form data

### Step 5: Implement `getByEmail()` Method
- [ ] Validate email parameter
- [ ] Query by email address
- [ ] Return only: id, full_name, date_signed, status, created_at
- [ ] Order by created_at DESC
- [ ] Return 200 response

**Test Endpoint:**
```bash
GET http://localhost:8000/api/consent-forms/customer?email=test@example.com
```

Expected: 200 response with array of forms

---

## 📋 PHASE 4: Controller - Admin Endpoints

### Step 6: Implement `index()` Method (List All)
- [ ] Accept query parameters:
  - [ ] `status` - filter by status
  - [ ] `date_from` - filter by date range start
  - [ ] `date_to` - filter by date range end
  - [ ] `search` - search name/email/phone
- [ ] Build query with filters
- [ ] Paginate results (50 per page)
- [ ] Return 200 response

**Test Endpoint:**
```bash
GET http://localhost:8000/api/admin/consent-forms
GET http://localhost:8000/api/admin/consent-forms?status=pending
GET http://localhost:8000/api/admin/consent-forms?search=test
```

### Step 7: Implement `show()` Method (Get Single)
- [ ] Find consent form by ID
- [ ] Load booking relationship: `->load('booking')`
- [ ] Return 200 response with full details
- [ ] Handle 404 if not found

**Test Endpoint:**
```bash
GET http://localhost:8000/api/admin/consent-forms/1
```

### Step 8: Implement `updateStatus()` Method
- [ ] Validate status parameter (pending/approved/expired)
- [ ] Find consent form by ID
- [ ] Update status field
- [ ] Save record
- [ ] Return 200 response
- [ ] Handle 404 if not found

**Test Endpoint:**
```bash
PUT http://localhost:8000/api/admin/consent-forms/1/status
Content-Type: application/json

{
  "status": "approved"
}
```

### Step 9: Implement `destroy()` Method
- [ ] Find consent form by ID
- [ ] Delete record
- [ ] Return 200 response
- [ ] Handle 404 if not found
- [ ] Consider soft deletes for legal compliance

**Test Endpoint:**
```bash
DELETE http://localhost:8000/api/admin/consent-forms/1
```

### Step 10: Implement `getByBooking()` Method
- [ ] Find all consent forms where `booking_id = {bookingId}`
- [ ] Return basic info (id, full_name, email, date_signed, status)
- [ ] Return 200 response

**Test Endpoint:**
```bash
GET http://localhost:8000/api/admin/consent-forms/booking/42
```

### Step 11: Implement `getStats()` Method
- [ ] Count total forms
- [ ] Count by status (pending, approved, expired)
- [ ] Calculate completion rate
- [ ] Group by month (last 3 months)
- [ ] Get most common medical conditions
- [ ] Return 200 response

**Test Endpoint:**
```bash
GET http://localhost:8000/api/admin/consent-forms/stats
GET http://localhost:8000/api/admin/consent-forms/stats?date_from=2025-01-01&date_to=2025-01-31
```

---

## 📋 PHASE 5: PDF Generation

### Step 12: Install DomPDF
- [ ] Run: `composer require barryvdh/laravel-dompdf`
- [ ] Publish config: `php artisan vendor:publish --provider="Barryvdh\DomPDF\ServiceProvider"`

### Step 13: Create PDF Template
- [ ] Create blade view: `resources/views/pdf/consent-form.blade.php`
- [ ] Add clinic logo (place in `public/images/logo.png`)
- [ ] Add header: "Medical Consent Form"
- [ ] Add all personal information sections
- [ ] Add medical history with conditions
- [ ] Add all 4 consent declarations with checkmarks
- [ ] Add digital signature (large font, Cormorant Garamond style)
- [ ] Add footer with date, time, IP address
- [ ] Add clinic contact information

### Step 14: Implement `exportPDF()` Method
- [ ] Import PDF facade: `use Barryvdh\DomPDF\Facade\Pdf;`
- [ ] Find consent form by ID
- [ ] Load booking relationship
- [ ] Generate PDF: `Pdf::loadView('pdf.consent-form', ['form' => $form])`
- [ ] Set options (A4 paper, portrait)
- [ ] Return PDF download response
- [ ] Set filename: `consent-form-{id}-{name}.pdf`

**Test Endpoint:**
```bash
GET http://localhost:8000/api/admin/consent-forms/1/pdf
```

Expected: PDF file download

---

## 📋 PHASE 6: Email Notifications

### Step 15: Configure Email Settings
- [ ] Set up `.env` file:
  ```
  MAIL_MAILER=smtp
  MAIL_HOST=smtp.mailtrap.io
  MAIL_PORT=2525
  MAIL_USERNAME=your_username
  MAIL_PASSWORD=your_password
  MAIL_ENCRYPTION=tls
  MAIL_FROM_ADDRESS=hello@aura-aesthetics.com
  MAIL_FROM_NAME="Aura Aesthetics"
  ADMIN_EMAIL=admin@aura-aesthetics.com
  ```
- [ ] Test email config: `php artisan tinker`
  ```php
  Mail::raw('Test email', function($msg) {
      $msg->to('test@example.com')->subject('Test');
  });
  ```

### Step 16: Create Customer Confirmation Email
- [ ] Run: `php artisan make:mail ConsentFormConfirmation`
- [ ] Create blade view: `resources/views/emails/consent-confirmation.blade.php`
- [ ] Add email content (see documentation)
- [ ] Attach PDF:
  ```php
  $pdf = Pdf::loadView('pdf.consent-form', ['form' => $this->form]);
  $this->attachData($pdf->output(), 'consent-form.pdf');
  ```
- [ ] Set subject: "Consent Form Received - Aura Aesthetics"

### Step 17: Create Admin Notification Email
- [ ] Run: `php artisan make:mail ConsentFormAdminNotification`
- [ ] Create blade view: `resources/views/emails/consent-admin-notification.blade.php`
- [ ] Add email content (see documentation)
- [ ] Set subject: "New Consent Form Submitted - Review Required"
- [ ] Add link to admin panel

### Step 18: Send Emails in `store()` Method
- [ ] After creating consent form, send customer email:
  ```php
  Mail::to($consentForm->email)->send(new ConsentFormConfirmation($consentForm));
  ```
- [ ] Send admin email:
  ```php
  Mail::to(config('mail.admin_email'))->send(new ConsentFormAdminNotification($consentForm));
  ```
- [ ] Wrap in try-catch to handle email failures gracefully

**Test:**
- [ ] Submit form via API
- [ ] Check Mailtrap inbox for both emails
- [ ] Verify PDF attachment in customer email

---

## 📋 PHASE 7: Routes Configuration

### Step 19: Define Public Routes
- [ ] Open `routes/api.php`
- [ ] Add public routes:
  ```php
  Route::post('/consent-forms', [ConsentFormController::class, 'store']);
  Route::get('/consent-forms/customer', [ConsentFormController::class, 'getByEmail']);
  ```

### Step 20: Define Admin Routes
- [ ] Add admin routes with authentication middleware:
  ```php
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

**Test All Routes:**
- [ ] Public routes work without auth
- [ ] Admin routes require authentication
- [ ] Admin routes check admin role

---

## 📋 PHASE 8: Security Implementation

### Step 21: Add Rate Limiting
- [ ] Add rate limiting to public endpoint:
  ```php
  Route::post('/consent-forms', [ConsentFormController::class, 'store'])
      ->middleware('throttle:10,1'); // 10 requests per minute
  ```

### Step 22: Add CSRF Protection
- [ ] Ensure CSRF middleware active (default in Laravel)
- [ ] Exclude API routes if using token auth (already done by default)

### Step 23: Sanitize Inputs
- [ ] Add input sanitization in controller
- [ ] Strip HTML tags from text fields:
  ```php
  'full_name' => strip_tags($request->full_name),
  'address' => strip_tags($request->address),
  ```
- [ ] Validate and sanitize medical_conditions array

### Step 24: Implement Audit Trail
- [ ] Create `consent_form_audit_logs` table (optional but recommended)
- [ ] Log status changes with admin user ID
- [ ] Log PDF downloads
- [ ] Log deletions

---

## 📋 PHASE 9: Testing

### Step 25: Public Endpoint Tests
- [ ] Submit valid form → 201 response
- [ ] Submit without full_name → 422 error
- [ ] Submit with age under 18 → 422 error
- [ ] Submit with invalid email → 422 error
- [ ] Submit without consents → 422 error
- [ ] Submit with mismatched signature → 422 error
- [ ] Submit with invalid booking_id → 422 error
- [ ] Get forms by valid email → 200 response
- [ ] Get forms by non-existent email → 200 empty array

### Step 26: Admin Endpoint Tests
- [ ] List all forms without auth → 401 error
- [ ] List all forms with auth → 200 response
- [ ] List with status filter → 200 filtered response
- [ ] List with search → 200 filtered response
- [ ] Get single form → 200 response
- [ ] Get non-existent form → 404 error
- [ ] Update status to approved → 200 response
- [ ] Update status to expired → 200 response
- [ ] Update with invalid status → 422 error
- [ ] Delete form → 200 response
- [ ] Delete non-existent form → 404 error
- [ ] Get forms by booking ID → 200 response
- [ ] Get stats → 200 response with correct counts

### Step 27: PDF Tests
- [ ] Generate PDF for existing form → PDF file
- [ ] PDF contains all form data
- [ ] PDF has correct filename
- [ ] PDF has clinic logo
- [ ] PDF has signature styled correctly

### Step 28: Email Tests
- [ ] Customer confirmation email sent
- [ ] Customer email has PDF attachment
- [ ] Admin notification email sent
- [ ] Email links work correctly
- [ ] Email templates render properly

---

## 📋 PHASE 10: Integration with Frontend

### Step 29: Enable CORS
- [ ] Configure CORS in `config/cors.php`:
  ```php
  'paths' => ['api/*'],
  'allowed_origins' => ['http://localhost:5173'], // Vite dev server
  'allowed_methods' => ['*'],
  'allowed_headers' => ['*'],
  ```

### Step 30: Test with React Frontend
- [ ] Start Laravel: `php artisan serve` (http://localhost:8000)
- [ ] Start React: `npm run dev` (http://localhost:5173)
- [ ] Submit form from `/consent` page
- [ ] Verify form appears in admin panel
- [ ] Test all admin actions (approve, download PDF, delete)
- [ ] Verify statistics update correctly

---

## 📋 PHASE 11: Production Preparation

### Step 31: Environment Configuration
- [ ] Set production database credentials
- [ ] Set production mail credentials
- [ ] Set `APP_ENV=production`
- [ ] Set `APP_DEBUG=false`
- [ ] Generate app key: `php artisan key:generate`

### Step 32: Security Hardening
- [ ] Enable HTTPS only
- [ ] Set secure cookie flags
- [ ] Configure rate limiting for production
- [ ] Set up database backups
- [ ] Enable query logging for audit

### Step 33: Performance Optimization
- [ ] Add database indexes (already in migration)
- [ ] Enable query caching
- [ ] Optimize PDF generation (cache templates)
- [ ] Set up queue for emails (optional):
  ```php
  Mail::to($email)->queue(new ConsentFormConfirmation($form));
  ```

### Step 34: Documentation
- [ ] Update API documentation with actual URLs
- [ ] Document any deviations from spec
- [ ] Create admin user guide
- [ ] Document backup procedures

---

## 📋 PHASE 12: Final Checks

### Step 35: Complete System Test
- [ ] Customer submits form → Success
- [ ] Customer receives email → Success
- [ ] Admin receives email → Success
- [ ] Admin logs in → Success
- [ ] Admin sees form in list → Success
- [ ] Admin views details → Success
- [ ] Admin approves form → Success
- [ ] Admin downloads PDF → Success
- [ ] Admin views linked booking → Success
- [ ] Statistics display correctly → Success

### Step 36: Error Handling Check
- [ ] Submit invalid form → Proper 422 errors
- [ ] Access admin without auth → 401 error
- [ ] Try to approve non-existent form → 404 error
- [ ] Server error returns 500 with message
- [ ] All errors logged properly

### Step 37: Legal Compliance Check
- [ ] Forms stored with timestamps → ✓
- [ ] IP addresses captured → ✓
- [ ] Digital signatures recorded → ✓
- [ ] 7-year retention policy documented → ✓
- [ ] GDPR compliance met → ✓
- [ ] Data export available → ✓
- [ ] Deletion process defined → ✓

---

## ✅ COMPLETION CHECKLIST

Mark each phase complete:

- [ ] Phase 1: Database Setup (Steps 1)
- [ ] Phase 2: Model Setup (Steps 2)
- [ ] Phase 3: Controller - Public Endpoints (Steps 3-5)
- [ ] Phase 4: Controller - Admin Endpoints (Steps 6-11)
- [ ] Phase 5: PDF Generation (Steps 12-14)
- [ ] Phase 6: Email Notifications (Steps 15-18)
- [ ] Phase 7: Routes Configuration (Steps 19-20)
- [ ] Phase 8: Security Implementation (Steps 21-24)
- [ ] Phase 9: Testing (Steps 25-28)
- [ ] Phase 10: Integration with Frontend (Steps 29-30)
- [ ] Phase 11: Production Preparation (Steps 31-34)
- [ ] Phase 12: Final Checks (Steps 35-37)

---

## 🎉 IMPLEMENTATION COMPLETE!

When all phases are checked off, the consent form system is fully implemented and ready for production use.

**Next Steps:**
1. Deploy to production server
2. Train admin staff on using the system
3. Monitor for issues in first week
4. Collect user feedback
5. Iterate and improve

**Support:**
- Frontend code: `src/app/pages/Consent.tsx`
- Frontend admin: `src/app/admin/pages/ConsentFormsManagement.tsx`
- API service: `src/services/consentService.ts`
- Full documentation: `CONSENT_FORM_API_DOCUMENTATION.md`

---

**Good luck with implementation!** 🚀
