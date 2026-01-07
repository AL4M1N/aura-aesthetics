/**
 * BOOKING SERVICE
 * Handles all booking-related API operations
 */

import apiClient from '../lib/axios';
import type { ApiResponse } from '../lib/types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface Booking {
    id: number;
    service_id: number;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    booking_date: string; // YYYY-MM-DD
    booking_time: string; // HH:mm
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    payment_status: 'unpaid' | 'deposit_paid' | 'paid';
    payment_method: 'deposit' | 'clinic';
    deposit_amount?: number;
    total_amount?: number;
    notes?: string;
    cancellation_reason?: string;
    created_at: string;
    updated_at: string;
    service?: {
        id: number;
        title: string;
        price_range: string;
        duration: string;
    };
}

export interface BookingPayload {
    service_id: number;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    booking_date: string; // YYYY-MM-DD
    booking_time: string; // HH:mm
    payment_method: 'deposit' | 'clinic';
    notes?: string;
}

export interface TimeSlot {
    time: string;
    available: boolean;
}

export interface BookingAvailability {
    date: string;
    slots: TimeSlot[];
}

// ============================================================================
// PUBLIC ENDPOINTS (No Authentication Required)
// ============================================================================

export const bookingService = {
    /**
     * Create a new booking (Public)
     */
    createBooking: async (payload: BookingPayload): Promise<ApiResponse<Booking>> => {
        return await apiClient.post('/bookings', payload);
    },

    /**
     * Get available time slots for a specific date
     */
    getAvailableSlots: async (date: string): Promise<ApiResponse<BookingAvailability>> => {
        return await apiClient.get(`/bookings/availability/${date}`);
    },

    /**
     * Check if a specific time slot is available
     */
    checkSlotAvailability: async (
        date: string,
        time: string
    ): Promise<ApiResponse<{ available: boolean }>> => {
        return await apiClient.get('/bookings/check-availability', {
            params: { date, time },
        });
    },

    // ========================================================================
    // ADMIN ENDPOINTS (Requires Authentication)
    // ========================================================================

    /**
     * Get all bookings (Admin)
     */
    getAllBookings: async (filters?: {
        status?: string;
        date_from?: string;
        date_to?: string;
        service_id?: number;
    }): Promise<ApiResponse<Booking[]>> => {
        return await apiClient.get('/admin/bookings', { params: filters });
    },

    /**
     * Get a single booking by ID (Admin)
     */
    getBooking: async (id: number): Promise<ApiResponse<Booking>> => {
        return await apiClient.get(`/admin/bookings/${id}`);
    },

    /**
     * Update booking status (Admin)
     */
    updateBookingStatus: async (
        id: number,
        status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
    ): Promise<ApiResponse<Booking>> => {
        return await apiClient.put(`/admin/bookings/${id}/status`, { status });
    },

    /**
     * Update payment status (Admin)
     */
    updatePaymentStatus: async (
        id: number,
        paymentStatus: 'unpaid' | 'deposit_paid' | 'paid'
    ): Promise<ApiResponse<Booking>> => {
        return await apiClient.put(`/admin/bookings/${id}/payment-status`, {
            payment_status: paymentStatus,
        });
    },

    /**
     * Cancel a booking (Admin)
     */
    cancelBooking: async (
        id: number,
        reason?: string
    ): Promise<ApiResponse<Booking>> => {
        return await apiClient.put(`/admin/bookings/${id}/cancel`, {
            cancellation_reason: reason,
        });
    },

    /**
     * Delete a booking (Admin)
     */
    deleteBooking: async (id: number): Promise<ApiResponse<null>> => {
        return await apiClient.delete(`/admin/bookings/${id}`);
    },

    /**
     * Get booking statistics (Admin)
     */
    getBookingStats: async (
        dateFrom?: string,
        dateTo?: string
    ): Promise<
        ApiResponse<{
            total_bookings: number;
            pending: number;
            confirmed: number;
            cancelled: number;
            completed: number;
            total_revenue: number;
        }>
    > => {
        return await apiClient.get('/admin/bookings/stats', {
            params: { date_from: dateFrom, date_to: dateTo },
        });
    },

    /**
     * Get bookings for a specific date (Admin - Calendar view)
     */
    getBookingsByDate: async (date: string): Promise<ApiResponse<Booking[]>> => {
        return await apiClient.get(`/admin/bookings/date/${date}`);
    },

    /**
     * Reschedule a booking (Admin)
     */
    rescheduleBooking: async (
        id: number,
        newDate: string,
        newTime: string
    ): Promise<ApiResponse<Booking>> => {
        return await apiClient.put(`/admin/bookings/${id}/reschedule`, {
            booking_date: newDate,
            booking_time: newTime,
        });
    },
};
