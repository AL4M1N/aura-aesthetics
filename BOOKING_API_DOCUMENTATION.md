# Booking System API Documentation

## Overview
Complete API documentation for the booking system implementation. This includes all endpoints, request/response formats, and database schema.

---

## Database Schema

### `bookings` Table

```sql
CREATE TABLE bookings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    service_id BIGINT UNSIGNED NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
    payment_status ENUM('unpaid', 'deposit_paid', 'paid') DEFAULT 'unpaid',
    payment_method ENUM('deposit', 'clinic') NOT NULL,
    deposit_amount DECIMAL(10, 2) NULLABLE,
    total_amount DECIMAL(10, 2) NULLABLE,
    notes TEXT NULLABLE,
    cancellation_reason TEXT NULLABLE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    INDEX idx_booking_date (booking_date),
    INDEX idx_status (status),
    INDEX idx_customer_email (customer_email)
);
```

### Field Descriptions
- **id**: Unique booking identifier
- **service_id**: Reference to the service being booked
- **customer_name**: Full name of the customer
- **customer_email**: Customer's email address (for confirmation emails)
- **customer_phone**: Customer's contact number
- **booking_date**: Date of appointment (YYYY-MM-DD)
- **booking_time**: Time of appointment (HH:mm format, 24-hour)
- **status**: Current booking status
- **payment_status**: Payment state
- **payment_method**: How customer chooses to pay
- **deposit_amount**: Amount paid as deposit (if applicable)
- **total_amount**: Total service cost
- **notes**: Additional customer notes/requirements
- **cancellation_reason**: Reason for cancellation (if cancelled)

---

## API Endpoints

### Public Endpoints (No Authentication)

#### 1. Create Booking
**POST** `/api/bookings`

Creates a new booking and sends confirmation email to customer and admin.

**Request Body:**
```json
{
    "service_id": 1,
    "customer_name": "Jane Doe",
    "customer_email": "jane@example.com",
    "customer_phone": "+447123456789",
    "booking_date": "2026-01-15",
    "booking_time": "14:00",
    "payment_method": "deposit",
    "notes": "First time customer, needs consultation"
}
```

**Success Response (201 Created):**
```json
{
    "success": true,
    "message": "Booking created successfully. Confirmation email sent.",
    "data": {
        "id": 45,
        "service_id": 1,
        "customer_name": "Jane Doe",
        "customer_email": "jane@example.com",
        "customer_phone": "+447123456789",
        "booking_date": "2026-01-15",
        "booking_time": "14:00",
        "status": "pending",
        "payment_status": "unpaid",
        "payment_method": "deposit",
        "notes": "First time customer, needs consultation",
        "created_at": "2026-01-07T14:30:00.000000Z",
        "updated_at": "2026-01-07T14:30:00.000000Z",
        "service": {
            "id": 1,
            "title": "Dermal Fillers",
            "price_range": "from £150",
            "duration": "45-60 minutes"
        }
    }
}
```

**Validation Rules:**
- service_id: required, exists in services table
- customer_name: required, string, max:255
- customer_email: required, email
- customer_phone: required, string
- booking_date: required, date, after_or_equal:today
- booking_time: required, time format (HH:mm)
- payment_method: required, in:deposit,clinic
- notes: optional, string

**Email Notifications:**
- Customer receives booking confirmation email
- Admin receives new booking notification email

---

#### 2. Get Available Time Slots
**GET** `/api/bookings/availability/{date}`

Returns available and booked time slots for a specific date.

**Parameters:**
- `date` (path): Date in YYYY-MM-DD format

**Example Request:**
```
GET /api/bookings/availability/2026-01-15
```

**Success Response (200 OK):**
```json
{
    "success": true,
    "message": "Availability retrieved successfully",
    "data": {
        "date": "2026-01-15",
        "slots": [
            { "time": "09:00", "available": true },
            { "time": "10:00", "available": false },
            { "time": "11:00", "available": true },
            { "time": "12:00", "available": true },
            { "time": "14:00", "available": true },
            { "time": "15:00", "available": false },
            { "time": "16:00", "available": true },
            { "time": "17:00", "available": true }
        ]
    }
}
```

---

#### 3. Check Slot Availability
**GET** `/api/bookings/check-availability`

Check if a specific date/time slot is available.

**Query Parameters:**
- `date`: YYYY-MM-DD
- `time`: HH:mm

**Example Request:**
```
GET /api/bookings/check-availability?date=2026-01-15&time=14:00
```

**Success Response (200 OK):**
```json
{
    "success": true,
    "message": "Slot is available",
    "data": {
        "available": true
    }
}
```

---

### Admin Endpoints (Requires Authentication)

#### 4. Get All Bookings
**GET** `/api/admin/bookings`

Retrieve all bookings with optional filters.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Query Parameters (all optional):**
- `status`: pending|confirmed|cancelled|completed
- `date_from`: YYYY-MM-DD
- `date_to`: YYYY-MM-DD
- `service_id`: integer

**Example Request:**
```
GET /api/admin/bookings?status=pending&date_from=2026-01-01
```

**Success Response (200 OK):**
```json
{
    "success": true,
    "message": "Bookings retrieved successfully",
    "data": [
        {
            "id": 45,
            "service_id": 1,
            "customer_name": "Jane Doe",
            "customer_email": "jane@example.com",
            "customer_phone": "+447123456789",
            "booking_date": "2026-01-15",
            "booking_time": "14:00",
            "status": "pending",
            "payment_status": "unpaid",
            "payment_method": "deposit",
            "notes": "First time customer",
            "created_at": "2026-01-07T14:30:00.000000Z",
            "updated_at": "2026-01-07T14:30:00.000000Z",
            "service": {
                "id": 1,
                "title": "Dermal Fillers",
                "price_range": "from £150",
                "duration": "45-60 minutes"
            }
        }
    ]
}
```

---

#### 5. Get Single Booking
**GET** `/api/admin/bookings/{id}`

Get detailed information about a specific booking.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Success Response (200 OK):**
```json
{
    "success": true,
    "message": "Booking retrieved successfully",
    "data": {
        "id": 45,
        "service_id": 1,
        "customer_name": "Jane Doe",
        "customer_email": "jane@example.com",
        "customer_phone": "+447123456789",
        "booking_date": "2026-01-15",
        "booking_time": "14:00",
        "status": "pending",
        "payment_status": "unpaid",
        "payment_method": "deposit",
        "notes": "First time customer",
        "created_at": "2026-01-07T14:30:00.000000Z",
        "updated_at": "2026-01-07T14:30:00.000000Z",
        "service": {
            "id": 1,
            "title": "Dermal Fillers",
            "price_range": "from £150",
            "duration": "45-60 minutes",
            "excerpt": "Restore volume and smooth away wrinkles"
        }
    }
}
```

---

#### 6. Update Booking Status
**PUT** `/api/admin/bookings/{id}/status`

Update the status of a booking.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
    "status": "confirmed"
}
```

**Valid Status Values:**
- `pending`
- `confirmed`
- `cancelled`
- `completed`

**Success Response (200 OK):**
```json
{
    "success": true,
    "message": "Booking status updated successfully",
    "data": {
        "id": 45,
        "status": "confirmed",
        // ... other booking fields
    }
}
```

**Email Notification:**
- Customer receives status update email

---

#### 7. Update Payment Status
**PUT** `/api/admin/bookings/{id}/payment-status`

Update the payment status of a booking.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
    "payment_status": "deposit_paid"
}
```

**Valid Payment Status Values:**
- `unpaid`
- `deposit_paid`
- `paid`

**Success Response (200 OK):**
```json
{
    "success": true,
    "message": "Payment status updated successfully",
    "data": {
        "id": 45,
        "payment_status": "deposit_paid",
        // ... other booking fields
    }
}
```

---

#### 8. Cancel Booking
**PUT** `/api/admin/bookings/{id}/cancel`

Cancel a booking with optional reason.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
    "cancellation_reason": "Customer requested reschedule due to illness"
}
```

**Success Response (200 OK):**
```json
{
    "success": true,
    "message": "Booking cancelled successfully",
    "data": {
        "id": 45,
        "status": "cancelled",
        "cancellation_reason": "Customer requested reschedule due to illness",
        // ... other booking fields
    }
}
```

**Email Notification:**
- Customer receives cancellation email

---

#### 9. Reschedule Booking
**PUT** `/api/admin/bookings/{id}/reschedule`

Reschedule a booking to a new date and time.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
    "booking_date": "2026-01-20",
    "booking_time": "15:00"
}
```

**Validation:**
- New slot must be available
- Date must be in the future

**Success Response (200 OK):**
```json
{
    "success": true,
    "message": "Booking rescheduled successfully",
    "data": {
        "id": 45,
        "booking_date": "2026-01-20",
        "booking_time": "15:00",
        // ... other booking fields
    }
}
```

**Email Notification:**
- Customer receives reschedule confirmation email

---

#### 10. Delete Booking
**DELETE** `/api/admin/bookings/{id}`

Permanently delete a booking.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Success Response (200 OK):**
```json
{
    "success": true,
    "message": "Booking deleted successfully",
    "data": null
}
```

---

#### 11. Get Booking Statistics
**GET** `/api/admin/bookings/stats`

Get booking statistics for a date range.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Query Parameters (optional):**
- `date_from`: YYYY-MM-DD
- `date_to`: YYYY-MM-DD

**Example Request:**
```
GET /api/admin/bookings/stats?date_from=2026-01-01&date_to=2026-01-31
```

**Success Response (200 OK):**
```json
{
    "success": true,
    "message": "Statistics retrieved successfully",
    "data": {
        "total_bookings": 150,
        "pending": 12,
        "confirmed": 45,
        "cancelled": 8,
        "completed": 85,
        "total_revenue": 12450.00
    }
}
```

---

#### 12. Get Bookings by Date
**GET** `/api/admin/bookings/date/{date}`

Get all bookings for a specific date (calendar view).

**Headers:**
```
Authorization: Bearer {access_token}
```

**Example Request:**
```
GET /api/admin/bookings/date/2026-01-15
```

**Success Response (200 OK):**
```json
{
    "success": true,
    "message": "Bookings retrieved successfully",
    "data": [
        {
            "id": 45,
            "booking_time": "14:00",
            "customer_name": "Jane Doe",
            "service": {
                "title": "Dermal Fillers"
            },
            "status": "confirmed"
        },
        {
            "id": 46,
            "booking_time": "16:00",
            "customer_name": "John Smith",
            "service": {
                "title": "Anti-Wrinkle Injections"
            },
            "status": "pending"
        }
    ]
}
```

---

## Email Templates

### 1. Booking Confirmation (Customer)
**Subject:** Booking Confirmation - [Service Name]

**Content:**
- Booking reference number
- Service details
- Date and time
- Location/clinic address
- Payment details
- Cancellation policy link
- Next steps (consent form)

### 2. New Booking Notification (Admin)
**Subject:** New Booking Received

**Content:**
- Customer details
- Service requested
- Date and time
- Payment method
- Action buttons (Confirm/View)

### 3. Booking Confirmation (Admin Action)
**Subject:** Your Booking is Confirmed

**Content:**
- Confirmation message
- Updated booking details
- Preparation instructions
- Contact information

### 4. Booking Cancellation
**Subject:** Booking Cancelled

**Content:**
- Cancellation confirmation
- Reason (if provided)
- Refund information (if applicable)
- Rebooking options

### 5. Booking Rescheduled
**Subject:** Booking Rescheduled

**Content:**
- New date and time
- Updated booking details
- Confirmation required

---

## Error Responses

All endpoints return consistent error responses:

```json
{
    "success": false,
    "message": "Error message here",
    "errors": {
        "field_name": [
            "Validation error message"
        ]
    }
}
```

### Common HTTP Status Codes
- **200**: Success
- **201**: Created
- **400**: Bad Request (validation errors)
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **422**: Unprocessable Entity (validation failed)
- **500**: Internal Server Error

---

## Business Logic

### Time Slot Management
- Default slots: 09:00, 10:00, 11:00, 12:00, 14:00, 15:00, 16:00, 17:00
- Each slot is 1 hour
- Only one booking per time slot
- Check availability before creating booking

### Payment Flow
1. **Deposit Payment:**
   - Redirect to Stripe checkout
   - £20 deposit charged
   - Deposit deducted from final treatment cost
   - Status: `deposit_paid`

2. **Pay at Clinic:**
   - No upfront payment
   - Pay full amount on appointment day
   - Status: `unpaid`

### Booking Status Flow
```
pending → confirmed → completed
   ↓
cancelled
```

### Cancellation Policy
- 24-48 hours notice required
- Late cancellations may incur fees
- Deposits non-refundable but transferable

---

## Implementation Notes

### Frontend Integration
- Use `bookingService.ts` for all API calls
- Handle loading states during API operations
- Display user-friendly error messages
- Show success confirmations
- Implement form validation before submission

### Backend Requirements
- Implement all endpoints in Laravel
- Add authentication middleware for admin routes
- Set up email queue for notifications
- Create booking migration and model
- Add booking policies for authorization
- Implement slot availability checking logic
- Create email templates using Laravel Mailables

### Security Considerations
- Validate all inputs
- Sanitize customer data
- Prevent double bookings (database constraints)
- Rate limit public endpoints
- Secure admin endpoints with proper authentication
- Log all booking actions for audit trail

---

## Testing Checklist

### Public Endpoints
- [ ] Create booking with valid data
- [ ] Create booking with invalid data (validation)
- [ ] Check slot availability
- [ ] Get available slots for date
- [ ] Prevent double booking same slot
- [ ] Email notifications sent correctly

### Admin Endpoints
- [ ] Unauthorized access returns 401
- [ ] Get all bookings with filters
- [ ] Update booking status
- [ ] Update payment status
- [ ] Cancel booking with reason
- [ ] Reschedule booking
- [ ] Delete booking
- [ ] Get booking statistics
- [ ] Get bookings by date

---

## Future Enhancements
1. SMS notifications (Twilio integration)
2. Calendar sync (Google Calendar, iCal)
3. Automated reminders (24h before appointment)
4. Customer booking history
5. Recurring appointments
6. Waitlist functionality
7. Multi-location support
8. Service add-ons during booking
9. Customer reviews post-appointment
10. Advanced analytics dashboard
