import apiClient from '../lib/axios';
import type { ApiResponse, HomeSlider, HomeSliderPayload } from '../lib/types';

export const pagesService = {
    getHomeSliders: async (): Promise<ApiResponse<HomeSlider[]>> => {
        return await apiClient.get('/admin/pages/home/sliders');
    },
    getPublicHomeSliders: async (): Promise<ApiResponse<HomeSlider[]>> => {
        return await apiClient.get('/sliders/public');
    },
    createHomeSlider: async (payload: HomeSliderPayload): Promise<ApiResponse<HomeSlider>> => {
        return await apiClient.post('/admin/pages/home/sliders', payload);
    },
    updateHomeSlider: async (
        sliderId: number,
        payload: HomeSliderPayload,
    ): Promise<ApiResponse<HomeSlider>> => {
        return await apiClient.put(`/admin/pages/home/sliders/${sliderId}`, payload);
    },
    deleteHomeSlider: async (sliderId: number): Promise<ApiResponse<null>> => {
        return await apiClient.delete(`/admin/pages/home/sliders/${sliderId}`);
    },
    toggleHomeSliderStatus: async (
        sliderId: number,
        isActive: boolean,
    ): Promise<ApiResponse<HomeSlider>> => {
        return await apiClient.patch(`/admin/pages/home/sliders/${sliderId}/status`, {
            is_active: isActive,
        });
    },
};
