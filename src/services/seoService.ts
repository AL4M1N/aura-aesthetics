import apiClient from '../lib/axios';
import type { ApiResponse } from '../lib/types';

export interface SEOData {
    id: number;
    page_type: 'home' | 'about' | 'services' | 'consent' | 'booking';
    page_identifier?: string; // For service-specific SEO, this would be the service slug
    title: string;
    description: string;
    keywords: string;
    og_title: string;
    og_description: string;
    og_image?: string;
    created_at: string;
    updated_at: string;
}

export interface SEODataPayload {
    page_type: 'home' | 'about' | 'services' | 'consent' | 'booking';
    page_identifier?: string;
    title: string;
    description: string;
    keywords: string;
    og_title: string;
    og_description: string;
    og_image?: File | string;
}

class SEOService {
    async getSEOData(): Promise<{ success: boolean; data?: SEOData[]; message?: string }> {
        try {
            const response = await apiClient.get('/admin/seo');
            console.log('Raw API Response (getSEOData):', response);

            // Handle different response structures
            if (response.data?.data) {
                return response.data; // Standard { success, data, message }
            } else if (Array.isArray(response.data)) {
                return { success: true, data: response.data };
            } else {
                console.warn('Unexpected response structure:', response.data);
                return { success: false, message: 'Unexpected response structure from server' };
            }
        } catch (error: any) {
            console.error('API Error (getSEOData):', error);
            const message = error?.response?.data?.message || error?.message || 'Failed to fetch SEO data';
            return { success: false, message };
        }
    }

    async getSEOByPageType(pageType: string, pageIdentifier?: string): Promise<{ success: boolean; data?: SEOData; message?: string }> {
        try {
            const params = new URLSearchParams({ page_type: pageType });
            if (pageIdentifier) {
                params.append('page_identifier', pageIdentifier);
            }
            const response = await apiClient.get(`/admin/seo/page?${params.toString()}`);
            console.log('Raw API Response (getSEOByPageType):', response);

            if (response.data?.data) {
                return response.data;
            } else if (response.data?.id) {
                return { success: true, data: response.data };
            } else {
                return { success: false, message: 'Unexpected response structure from server' };
            }
        } catch (error: any) {
            console.error('API Error (getSEOByPageType):', error);
            const message = error?.response?.data?.message || error?.message || 'Failed to fetch SEO data';
            return { success: false, message };
        }
    }

    async createSEOData(payload: SEODataPayload): Promise<{ success: boolean; data?: SEOData; message?: string }> {
        try {
            const formData = new FormData();
            Object.entries(payload).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    if (key === 'og_image' && value instanceof File) {
                        formData.append(key, value);
                    } else {
                        formData.append(key, String(value));
                    }
                }
            });

            const response = await apiClient.post('/admin/seo', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            console.log('Raw API Response (createSEOData):', response);
            return response.data;
        } catch (error: any) {
            console.error('API Error (createSEOData):', error);
            const message = error?.response?.data?.message || error?.message || 'Failed to create SEO data';
            return { success: false, message };
        }
    }

    async updateSEOData(id: number, payload: SEODataPayload): Promise<{ success: boolean; data?: SEOData; message?: string }> {
        try {
            const formData = new FormData();
            Object.entries(payload).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    if (key === 'og_image' && value instanceof File) {
                        formData.append(key, value);
                    } else {
                        formData.append(key, String(value));
                    }
                }
            });

            const response = await apiClient.post(`/admin/seo/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            console.log('Raw API Response (updateSEOData):', response);
            return response.data;
        } catch (error: any) {
            console.error('API Error (updateSEOData):', error);
            const message = error?.response?.data?.message || error?.message || 'Failed to update SEO data';
            return { success: false, message };
        }
    }

    async deleteSEOData(id: number): Promise<{ success: boolean; message?: string }> {
        try {
            const response = await apiClient.delete(`/admin/seo/${id}`);
            console.log('Raw API Response (deleteSEOData):', response);
            return response.data;
        } catch (error: any) {
            console.error('API Error (deleteSEOData):', error);
            const message = error?.response?.data?.message || error?.message || 'Failed to delete SEO data';
            return { success: false, message };
        }
    }

    // Public endpoint for frontend to get SEO data
    async getPublicSEOData(pageType: string, pageIdentifier?: string): Promise<{ success: boolean; data?: SEOData; message?: string }> {
        try {
            const params = new URLSearchParams({ page_type: pageType });
            if (pageIdentifier) {
                params.append('page_identifier', pageIdentifier);
            }
            const response = await apiClient.get(`/seo?${params.toString()}`);
            console.log('Raw API Response (getPublicSEOData):', response);

            if (response.data?.data) {
                return response.data;
            } else if (response.data?.id) {
                return { success: true, data: response.data };
            } else {
                return { success: false, message: 'Unexpected response structure from server' };
            }
        } catch (error: any) {
            console.error('API Error (getPublicSEOData):', error);
            const message = error?.response?.data?.message || error?.message || 'Failed to fetch SEO data';
            return { success: false, message };
        }
    }
}

export const seoService = new SEOService();