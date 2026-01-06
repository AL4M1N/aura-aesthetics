import apiClient from '../lib/axios';
import type { ApiResponse, HomeSlider, HomeSliderPayload, HomeAboutContent, HomeAboutPayload, HomeFeature, HomeFeaturePayload, HomeCta, HomeCtaPayload, HomeTestimonial, HomeTestimonialPayload } from '../lib/types';

export const pagesService = {
    // Slider endpoints
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
        return await apiClient.put(`/admin/pages/home/sliders/${sliderId}/status`, {
            status: isActive,
        });
    },

    // About section endpoints
    getHomeAbout: async (): Promise<ApiResponse<{ about: HomeAboutContent }>> => {
        return await apiClient.get<any, ApiResponse<{ about: HomeAboutContent }>>('/admin/pages/home/about');
    },
    updateHomeAbout: async (payload: HomeAboutPayload): Promise<ApiResponse<{ about: HomeAboutContent }>> => {
        return await apiClient.put<any, ApiResponse<{ about: HomeAboutContent }>>('/admin/pages/home/about', payload);
    },
    getPublicHomeAbout: async (): Promise<ApiResponse<{ about: HomeAboutContent }>> => {
        return await apiClient.get<any, ApiResponse<{ about: HomeAboutContent }>>('/pages/home/about');
    },

    // Features endpoints
    getHomeFeatures: async (): Promise<ApiResponse<HomeFeature[]>> => {
        return await apiClient.get('/admin/pages/home/features');
    },
    getPublicHomeFeatures: async (): Promise<ApiResponse<HomeFeature[]>> => {
        return await apiClient.get('/pages/home/features');
    },
    createHomeFeature: async (payload: HomeFeaturePayload): Promise<ApiResponse<HomeFeature>> => {
        return await apiClient.post('/admin/pages/home/features', payload);
    },
    updateHomeFeature: async (
        featureId: number,
        payload: HomeFeaturePayload,
    ): Promise<ApiResponse<HomeFeature>> => {
        return await apiClient.put(`/admin/pages/home/features/${featureId}`, payload);
    },
    deleteHomeFeature: async (featureId: number): Promise<ApiResponse<null>> => {
        return await apiClient.delete(`/admin/pages/home/features/${featureId}`);
    },
    toggleHomeFeatureStatus: async (
        featureId: number,
        isActive: boolean,
    ): Promise<ApiResponse<HomeFeature>> => {
        return await apiClient.put(`/admin/pages/home/features/${featureId}/status`, {
            status: isActive,
        });
    },

    // CTA section endpoints
    getHomeCta: async (): Promise<ApiResponse<{ cta: HomeCta }>> => {
        return await apiClient.get<any, ApiResponse<{ cta: HomeCta }>>('/admin/pages/home/cta');
    },
    updateHomeCta: async (payload: HomeCtaPayload): Promise<ApiResponse<{ cta: HomeCta }>> => {
        return await apiClient.put<any, ApiResponse<{ cta: HomeCta }>>('/admin/pages/home/cta', payload);
    },
    getPublicHomeCta: async (): Promise<ApiResponse<{ cta: HomeCta }>> => {
        return await apiClient.get<any, ApiResponse<{ cta: HomeCta }>>('/pages/home/cta');
    },

    // Testimonials endpoints
    getHomeTestimonials: async (): Promise<ApiResponse<HomeTestimonial[]>> => {
        return await apiClient.get('/admin/pages/home/testimonials');
    },
    getPublicHomeTestimonials: async (): Promise<ApiResponse<HomeTestimonial[]>> => {
        return await apiClient.get('/pages/home/testimonials');
    },
    createHomeTestimonial: async (payload: HomeTestimonialPayload): Promise<ApiResponse<HomeTestimonial>> => {
        return await apiClient.post('/admin/pages/home/testimonials', payload);
    },
    updateHomeTestimonial: async (
        testimonialId: number,
        payload: HomeTestimonialPayload,
    ): Promise<ApiResponse<HomeTestimonial>> => {
        return await apiClient.put(`/admin/pages/home/testimonials/${testimonialId}`, payload);
    },
    deleteHomeTestimonial: async (testimonialId: number): Promise<ApiResponse<null>> => {
        return await apiClient.delete(`/admin/pages/home/testimonials/${testimonialId}`);
    },
    toggleHomeTestimonialStatus: async (
        testimonialId: number,
        isActive: boolean,
    ): Promise<ApiResponse<HomeTestimonial>> => {
        return await apiClient.put(`/admin/pages/home/testimonials/${testimonialId}/status`, {
            status: isActive,
        });
    },
};
