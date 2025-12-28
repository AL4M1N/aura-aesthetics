/**
 * API Configuration and Utilities
 * 
 * For Laravel API integration:
 * 1. Set VITE_API_URL in .env file
 * 2. Example: VITE_API_URL=https://api.yoursite.com
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface FetchOptions extends RequestInit {
    params?: Record<string, string>;
}

/**
 * Generic API fetch wrapper with error handling
 */
async function apiFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options;

    let url = `${API_URL}/api${endpoint}`;

    // Add query parameters if provided
    if (params) {
        const searchParams = new URLSearchParams(params);
        url += `?${searchParams.toString()}`;
    }

    const response = await fetch(url, {
        ...fetchOptions,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...fetchOptions.headers,
        },
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
}

// =============================================================================
// SERVICES API
// =============================================================================

export interface Service {
    id: number;
    title: string;
    description: string;
    price: string;
    image: string;
    popular?: boolean;
}

export async function getServices(): Promise<Service[]> {
    // For now, return static data
    // When Laravel API is ready, uncomment:
    // return apiFetch<Service[]>('/services');

    return [
        {
            id: 1,
            title: 'Lip Enhancement',
            description: 'Achieve perfectly sculpted, natural-looking lips',
            price: 'from £120',
            image: 'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=800',
            popular: true,
        },
        // Add more services...
    ];
}

export async function getService(id: number): Promise<Service> {
    return apiFetch<Service>(`/services/${id}`);
}

// =============================================================================
// BOOKINGS API
// =============================================================================

export interface BookingData {
    name: string;
    email: string;
    phone: string;
    service: string;
    date: string;
    time: string;
    message?: string;
}

export interface BookingResponse {
    success: boolean;
    message: string;
    booking_id?: number;
}

export async function createBooking(data: BookingData): Promise<BookingResponse> {
    // For now, simulate API call
    console.log('Booking data:', data);
    return { success: true, message: 'Booking created successfully' };

    // When Laravel API is ready, uncomment:
    // return apiFetch<BookingResponse>('/bookings', {
    //   method: 'POST',
    //   body: JSON.stringify(data),
    // });
}

// =============================================================================
// CONTACT/CONSENT API
// =============================================================================

export interface ContactData {
    name: string;
    email: string;
    phone: string;
    message: string;
}

export async function submitContact(data: ContactData): Promise<{ success: boolean; message: string }> {
    return apiFetch('/contact', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export interface ConsentData {
    client_name: string;
    email: string;
    signature: string;
    agreed_terms: boolean;
    medical_history: Record<string, any>;
}

export async function submitConsent(data: ConsentData): Promise<{ success: boolean; message: string }> {
    return apiFetch('/consents', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

// =============================================================================
// TESTIMONIALS API
// =============================================================================

export interface Testimonial {
    id: number;
    client_name: string;
    rating: number;
    comment: string;
    service: string;
    date: string;
    image?: string;
}

export async function getTestimonials(): Promise<Testimonial[]> {
    return apiFetch<Testimonial[]>('/testimonials');
}

// =============================================================================
// GALLERY API
// =============================================================================

export interface GalleryImage {
    id: number;
    url: string;
    title: string;
    description: string;
    service: string;
}

export async function getGalleryImages(): Promise<GalleryImage[]> {
    return apiFetch<GalleryImage[]>('/gallery');
}
