import apiClient from '../lib/axios';
import type { ApiResponse, Service, ServicePayload } from '../lib/types';

export const servicesService = {
    // Admin endpoints
    getServices: async (): Promise<ApiResponse<Service[]>> => {
        return await apiClient.get('/admin/services');
    },
    getService: async (id: number): Promise<ApiResponse<Service>> => {
        return await apiClient.get(`/admin/services/${id}`);
    },
    createService: async (payload: ServicePayload): Promise<ApiResponse<Service>> => {
        return await apiClient.post('/admin/services', payload);
    },
    updateService: async (
        id: number,
        payload: ServicePayload,
    ): Promise<ApiResponse<Service>> => {
        return await apiClient.put(`/admin/services/${id}`, payload);
    },
    deleteService: async (id: number): Promise<ApiResponse<null>> => {
        return await apiClient.delete(`/admin/services/${id}`);
    },
    toggleServiceStatus: async (
        id: number,
        isActive: boolean,
    ): Promise<ApiResponse<Service>> => {
        return await apiClient.put(`/admin/services/${id}/status`, {
            status: isActive,
        });
    },

    // Public endpoints
    getPublicServices: async (): Promise<ApiResponse<Service[]>> => {
        return await apiClient.get('/services');
    },
    getPublicServiceBySlug: async (slug: string): Promise<ApiResponse<Service>> => {
        return await apiClient.get(`/services/${slug}`);
    },
    getFeaturedServices: async (): Promise<ApiResponse<Service[]>> => {
        return await apiClient.get('/services/featured');
    },
};
