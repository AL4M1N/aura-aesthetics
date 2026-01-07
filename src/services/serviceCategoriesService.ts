import apiClient from '../lib/axios';
import type {
    ApiResponse,
    ServiceCategory,
    ServiceCategoryPayload
} from '../lib/types';

export const serviceCategoriesService = {
    // ==========================================
    // ADMIN ENDPOINTS (Requires Authentication)
    // ==========================================

    /**
     * Get all service categories (Admin)
     */
    getServiceCategories: async (): Promise<ApiResponse<ServiceCategory[]>> => {
        return await apiClient.get('/admin/service-categories');
    },

    /**
     * Get single service category by ID (Admin)
     */
    getServiceCategory: async (id: number): Promise<ApiResponse<ServiceCategory>> => {
        return await apiClient.get(`/admin/service-categories/${id}`);
    },

    /**
     * Create new service category
     */
    createServiceCategory: async (payload: ServiceCategoryPayload): Promise<ApiResponse<ServiceCategory>> => {
        return await apiClient.post('/admin/service-categories', payload);
    },

    /**
     * Update service category
     */
    updateServiceCategory: async (
        id: number,
        payload: ServiceCategoryPayload
    ): Promise<ApiResponse<ServiceCategory>> => {
        return await apiClient.put(`/admin/service-categories/${id}`, payload);
    },

    /**
     * Delete service category
     */
    deleteServiceCategory: async (id: number): Promise<ApiResponse<null>> => {
        return await apiClient.delete(`/admin/service-categories/${id}`);
    },

    /**
     * Toggle service category status (active/inactive)
     */
    toggleServiceCategoryStatus: async (
        id: number,
        isActive: boolean
    ): Promise<ApiResponse<ServiceCategory>> => {
        return await apiClient.put(`/admin/service-categories/${id}/status`, {
            status: isActive,
        });
    },

    // ==========================================
    // PUBLIC ENDPOINTS (No Authentication)
    // ==========================================

    /**
     * Get all active service categories (Public)
     */
    getPublicServiceCategories: async (): Promise<ApiResponse<ServiceCategory[]>> => {
        return await apiClient.get('/service-categories');
    },

    /**
     * Get service category by slug with its services (Public)
     */
    getPublicServiceCategoryBySlug: async (slug: string): Promise<ApiResponse<ServiceCategory>> => {
        return await apiClient.get(`/service-categories/${slug}`);
    },
};
