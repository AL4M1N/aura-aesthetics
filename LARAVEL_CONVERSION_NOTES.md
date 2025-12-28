# Aura Aesthetics - Laravel Blade Conversion Guide

## Project Overview
This is a 5-page premium medical aesthetic clinic website built with React and Tailwind CSS, designed to be converted to Laravel Blade templates.

## Design System

### Colors
- **Primary Background**: `#FAFAFA` (Ivory White)
- **Secondary**: `#D6CEC3` (Warm Stone Beige)
- **Accent/CTA**: `#C9B27C` (Champagne Gold)
- **Text Primary**: `#2B2B2B` (Deep Charcoal)
- **Text Secondary**: `#B8B8B8` (Soft Medical Grey)

### Typography
- **Headings**: Playfair Display (Serif) - Weight: 500, 600
- **Body**: Montserrat (Sans-serif) - Weight: 300, 400, 500
- **Medical Notes**: Lato - Weight: 400

### Font Sizes
- H1: 3.5rem (Desktop) / 2.5rem (Mobile)
- H2: 2.5rem / 2rem
- Body: 1.125rem / 1rem
- Small: 0.875rem

## Page Structure

### Current React Structure
```
/src/app/
├── components/
│   ├── Header.tsx       - Navigation with mobile menu
│   ├── Footer.tsx       - Footer with contact info
│   └── ui/              - Reusable UI components
└── pages/
    ├── Home.tsx         - Landing page with hero & trust elements
    ├── About.tsx        - Practitioner bio & qualifications
    ├── Services.tsx     - Treatment pricing with tabs
    ├── Consent.tsx      - Multi-step consent form
    └── Booking.tsx      - Appointment booking system
```

### Recommended Laravel Blade Structure
```
resources/views/
├── layouts/
│   ├── app.blade.php           # Master layout
│   └── partials/
│       ├── header.blade.php    # Navigation
│       ├── footer.blade.php    # Footer
│       └── navigation.blade.php
├── pages/
│   ├── home.blade.php
│   ├── about.blade.php
│   ├── services.blade.php
│   ├── consent.blade.php
│   └── booking.blade.php
└── components/
    ├── treatment-card.blade.php
    ├── certification-card.blade.php
    └── trust-badge.blade.php
```

## Laravel Conversion Steps

### 1. Convert Header Component
**From**: `/src/app/components/Header.tsx`
**To**: `resources/views/partials/header.blade.php`

Example conversion:
```blade
{{-- Header Navigation --}}
<header class="sticky top-0 z-50 w-full border-b border-[var(--aura-stone)] bg-white/95 backdrop-blur">
    <div class="container mx-auto flex h-20 items-center justify-between px-4 lg:px-8">
        <a href="{{ route('home') }}" class="font-['Playfair_Display'] text-3xl font-semibold text-[var(--aura-charcoal)]">
            Aura Aesthetics
        </a>
        
        <nav class="hidden md:flex items-center gap-8">
            <a href="{{ route('home') }}" class="{{ request()->routeIs('home') ? 'text-[var(--aura-gold)]' : 'text-[var(--aura-charcoal)]' }}">
                Home
            </a>
            {{-- Add other nav items --}}
        </nav>
    </div>
</header>
```

### 2. Create Master Layout
`resources/views/layouts/app.blade.php`:
```blade
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title', 'Aura Aesthetics')</title>
    
    {{-- Google Fonts --}}
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600&family=Montserrat:wght@300;400;500&family=Lato:wght@400&display=swap" rel="stylesheet">
    
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body>
    @include('partials.header')
    
    <main>
        @yield('content')
    </main>
    
    @include('partials.footer')
</body>
</html>
```

### 3. Convert Pages

#### Home Page
`resources/views/pages/home.blade.php`:
```blade
@extends('layouts.app')

@section('title', 'Home - Aura Aesthetics')

@section('content')
    {{-- Hero Section --}}
    <section class="relative bg-gradient-to-b from-[#FAFAFA] to-[#F5F5F5] py-20 lg:py-32">
        <div class="container mx-auto px-4 lg:px-8">
            {{-- Content from Home.tsx --}}
        </div>
    </section>
    
    {{-- Other sections --}}
@endsection
```

### 4. Forms & Interactivity

For the multi-step consent form (`Consent.tsx`), use Alpine.js:

```blade
<div x-data="{ step: 1 }" class="max-w-4xl mx-auto">
    {{-- Progress Bar --}}
    <div class="w-full h-2 bg-gray-200 rounded-full">
        <div class="h-full bg-[var(--aura-gold)] transition-all" 
             :style="{ width: (step / 5 * 100) + '%' }">
        </div>
    </div>
    
    {{-- Step 1 --}}
    <div x-show="step === 1">
        {{-- Personal Details Form --}}
    </div>
    
    {{-- Navigation --}}
    <button @click="step = Math.max(1, step - 1)">Previous</button>
    <button @click="step = Math.min(5, step + 1)">Next</button>
</div>
```

### 5. Services Tabs
Use Alpine.js for tab functionality:

```blade
<div x-data="{ activeTab: 'lip-fillers' }">
    <div class="grid grid-cols-3">
        <button @click="activeTab = 'lip-fillers'" 
                :class="{ 'bg-[var(--aura-gold)]': activeTab === 'lip-fillers' }">
            Lip Fillers
        </button>
        {{-- Other tabs --}}
    </div>
    
    <div x-show="activeTab === 'lip-fillers'">
        {{-- Lip fillers content --}}
    </div>
</div>
```

### 6. Booking Calendar
For the calendar in `Booking.tsx`, integrate a Laravel package like:
- `spatie/laravel-booking` for booking system
- Use a JavaScript calendar library like FullCalendar or create custom with Alpine.js

### 7. Routes
`routes/web.php`:
```php
Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/about', [AboutController::class, 'index'])->name('about');
Route::get('/services', [ServicesController::class, 'index'])->name('services');
Route::get('/consent', [ConsentController::class, 'index'])->name('consent');
Route::post('/consent', [ConsentController::class, 'store'])->name('consent.store');
Route::get('/booking', [BookingController::class, 'index'])->name('booking');
Route::post('/booking', [BookingController::class, 'store'])->name('booking.store');
```

## Key Features to Implement

### Trust Elements
- CPD badge component (create as Blade component)
- Certification display (loop through certificates array)
- Medical disclaimers (include in footer)

### Forms
1. **Consent Form** - Multi-step with validation
2. **Booking Form** - Calendar integration + payment

### Payment Integration
- Integrate Stripe for deposits
- Create payment controller for processing

### Email Notifications
- Booking confirmations
- Appointment reminders
- Consent form submissions

## Component Examples

### Treatment Card Component
`resources/views/components/treatment-card.blade.php`:
```blade
{{--
    COMPONENT: Treatment Price Card
    USAGE: Displays treatment with price and CTA
    PROPS:
      - title: string
      - price: string
      - description: string (optional)
      - ctaText: string (default: "Book Now")
--}}

<div class="bg-white border-2 border-[var(--aura-stone)] rounded-lg p-8 hover:border-[var(--aura-gold)] transition-all">
    <h3 class="font-['Montserrat'] font-semibold text-2xl text-[var(--aura-charcoal)]">
        {{ $title }}
    </h3>
    
    @if(isset($description))
        <p class="font-['Lato'] text-[var(--aura-grey)] my-4">{{ $description }}</p>
    @endif
    
    <p class="font-['Montserrat'] font-semibold text-3xl text-[var(--aura-gold)] mb-4">
        {{ $price }}
    </p>
    
    {{-- Medical disclaimer for all treatments --}}
    <p class="text-xs text-[var(--aura-grey)] mb-4">*Consultation required prior to treatment</p>
    
    <a href="{{ route('booking') }}" class="inline-block bg-[var(--aura-gold)] text-[var(--aura-charcoal)] px-8 py-4 rounded-md font-['Montserrat'] font-medium">
        {{ $ctaText ?? 'Book Now' }}
    </a>
</div>
```

Usage:
```blade
<x-treatment-card 
    title="0.5ml Lip Filler" 
    price="£120 – £150" 
    description="Subtle enhancement for natural-looking fullness"
/>
```

## CSS/Tailwind Setup

The project uses Tailwind CSS v4.0 with custom theme variables. Ensure your `tailwind.config.js` includes:

```javascript
export default {
  content: [
    './resources/**/*.blade.php',
    './resources/**/*.js',
  ],
  theme: {
    extend: {
      colors: {
        'aura-ivory': '#FAFAFA',
        'aura-stone': '#D6CEC3',
        'aura-gold': '#C9B27C',
        'aura-charcoal': '#2B2B2B',
        'aura-grey': '#B8B8B8',
      },
      fontFamily: {
        'playfair': ['Playfair Display', 'serif'],
        'montserrat': ['Montserrat', 'sans-serif'],
        'lato': ['Lato', 'sans-serif'],
      },
    },
  },
}
```

## Medical Compliance Notes

### GDPR Compliance
- Add cookie consent banner
- Create privacy policy page
- Implement data protection measures

### Medical Disclaimers
All pages must include:
```blade
<p class="text-xs text-gray-400">
    <strong>Medical Disclaimer:</strong> Results vary per individual. 
    All treatments require a consultation. This website is not intended 
    for collecting PII or securing sensitive data.
</p>
```

### Consent Form Requirements
- Digital signature capture
- PDF export functionality
- Secure storage with encryption
- HIPAA/GDPR compliance

## Responsive Breakpoints

```css
/* Tailwind breakpoints */
sm: 640px   /* Mobile */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large Desktop */
```

## Color Contrast Compliance

Ensure WCAG AA compliance:
- Text on Ivory: Use Charcoal (#2B2B2B)
- Text on Gold: Use Charcoal (#2B2B2B)
- Links: Gold with hover underline

## Next Steps

1. Set up Laravel project
2. Install Tailwind CSS
3. Install Alpine.js for interactivity
4. Convert React components to Blade templates
5. Set up routes and controllers
6. Implement form validation
7. Add payment gateway integration
8. Set up email notifications
9. Add Google Maps API for location
10. Implement booking system
11. Add SSL certificate for security
12. Deploy and test

## Support & Maintenance

### Regular Updates Required
- CPD certificate renewals
- Treatment pricing updates
- Photo gallery updates
- Blog/news section (optional)

### Technical Maintenance
- Database backups
- Security updates
- SSL renewal
- Form spam protection
