/**
 * CONSENT FORM SERVICE
 * Handles all consent form-related API operations
 */

import apiClient from '../lib/axios';
import type { ApiResponse } from '../lib/types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface ConsentForm {
    id: number;
    full_name: string;
    date_of_birth: string; // YYYY-MM-DD
    email: string;
    phone: string;
    address?: string;
    emergency_contact?: string;
    emergency_phone?: string;
    medical_conditions: string[]; // Array of selected conditions
    medications?: string;
    allergies?: string;
    medical_history?: string;
    consent_information_accuracy: boolean;
    consent_treatment_information: boolean;
    consent_risks: boolean;
    consent_authorization: boolean;
    signature: string;
    date_signed: string; // ISO timestamp
    ip_address?: string;
    booking_id?: number; // Optional link to booking
    status: 'pending' | 'approved' | 'expired';
    created_at: string;
    updated_at: string;
}

export interface ConsentFormPayload {
    full_name: string;
    date_of_birth: string;
    email: string;
    phone: string;
    address?: string;
    emergency_contact?: string;
    emergency_phone?: string;
    medical_conditions: string[];
    medications?: string;
    allergies?: string;
    medical_history?: string;
    consent_information_accuracy: boolean;
    consent_treatment_information: boolean;
    consent_risks: boolean;
    consent_authorization: boolean;
    signature: string;
    booking_id?: number;
}

// ============================================================================
// PUBLIC ENDPOINTS (No Authentication Required)
// ============================================================================

export const consentService = {
    /**
     * Submit a new consent form (Public)
     * Maps frontend field names to backend field names:
     * - consent_information_accuracy → consent1
     * - consent_treatment_information → consent2
     * - consent_risks → consent3
     * - consent_authorization → consent4
     */
    submitConsentForm: async (payload: ConsentFormPayload): Promise<ApiResponse<ConsentForm>> => {
        // Transform payload to match backend expectations
        const transformedPayload = {
            full_name: payload.full_name,
            date_of_birth: payload.date_of_birth,
            email: payload.email,
            phone: payload.phone,
            address: payload.address,
            emergency_contact: payload.emergency_contact,
            emergency_phone: payload.emergency_phone,
            medical_conditions: payload.medical_conditions,
            medications: payload.medications,
            allergies: payload.allergies,
            medical_history: payload.medical_history,
            consent1: payload.consent_information_accuracy,
            consent2: payload.consent_treatment_information,
            consent3: payload.consent_risks,
            consent4: payload.consent_authorization,
            signature: payload.signature,
            booking_id: payload.booking_id,
        };
        return await apiClient.post('/consent-forms', transformedPayload);
    },

    /**
     * Get consent form by email (Public - for customer to view their own)
     */
    getConsentFormByEmail: async (email: string): Promise<ApiResponse<ConsentForm[]>> => {
        return await apiClient.get('/consent-forms/customer', {
            params: { email },
        });
    },

    // ========================================================================
    // ADMIN ENDPOINTS (Requires Authentication)
    // ========================================================================

    /**
     * Get all consent forms (Admin)
     */
    getAllConsentForms: async (filters?: {
        status?: string;
        date_from?: string;
        date_to?: string;
        search?: string;
    }): Promise<ApiResponse<ConsentForm[]>> => {
        return await apiClient.get('/admin/consent-forms', { params: filters });
    },

    /**
     * Get a single consent form by ID (Admin)
     */
    getConsentForm: async (id: number): Promise<ApiResponse<ConsentForm>> => {
        return await apiClient.get(`/admin/consent-forms/${id}`);
    },

    /**
     * Update consent form status (Admin)
     */
    updateConsentFormStatus: async (
        id: number,
        status: 'pending' | 'approved' | 'expired'
    ): Promise<ApiResponse<ConsentForm>> => {
        return await apiClient.put(`/admin/consent-forms/${id}/status`, { status });
    },

    /**
     * Delete a consent form (Admin)
     */
    deleteConsentForm: async (id: number): Promise<ApiResponse<null>> => {
        return await apiClient.delete(`/admin/consent-forms/${id}`);
    },

    /**
     * Get consent forms by booking ID (Admin)
     */
    getConsentFormsByBooking: async (bookingId: number): Promise<ApiResponse<ConsentForm[]>> => {
        return await apiClient.get(`/admin/consent-forms/booking/${bookingId}`);
    },

    /**
     * Export consent form as PDF
     * Can be used by admin (for any form) or customer (for their own form)
     */
    exportConsentFormPDF: async (id: number): Promise<Blob> => {
        const response = await apiClient.get(`/admin/consent-forms/${id}/export-pdf`, {
            responseType: 'blob',
        });
        return response as unknown as Blob;
    },

    /**
     * Get consent form statistics (Admin)
     */
    getConsentFormStats: async (
        dateFrom?: string,
        dateTo?: string
    ): Promise<
        ApiResponse<{
            total_forms: number;
            pending: number;
            approved: number;
            expired: number;
            completion_rate: number;
        }>
    > => {
        return await apiClient.get('/admin/consent-forms/stats', {
            params: { date_from: dateFrom, date_to: dateTo },
        });
    },
};
