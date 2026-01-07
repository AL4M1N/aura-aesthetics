import apiClient from '../lib/axios';
import type {
    ApiResponse,
    HomeSlider, HomeSliderPayload,
    HomeAboutContent, HomeAboutPayload,
    HomeFeature, HomeFeaturePayload,
    HomeCta, HomeCtaPayload,
    HomeTestimonial, HomeTestimonialPayload,
    AboutHero, AboutHeroPayload,
    AboutBio, AboutBioPayload,
    AboutQualification, AboutQualificationPayload,
    AboutValue, AboutValuePayload,
    AboutCertificate, AboutCertificatePayload
} from '../lib/types';

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

    // ============================================
    // ABOUT PAGE ENDPOINTS
    // ============================================

    // About Hero Section
    getAboutHero: async (): Promise<ApiResponse<{ hero: AboutHero }>> => {
        return await apiClient.get('/admin/pages/about/hero');
    },
    updateAboutHero: async (payload: AboutHeroPayload): Promise<ApiResponse<{ hero: AboutHero }>> => {
        return await apiClient.put('/admin/pages/about/hero', payload);
    },
    getPublicAboutHero: async (): Promise<ApiResponse<{ hero: AboutHero }>> => {
        return await apiClient.get('/pages/about/hero');
    },

    // About Bio Section
    getAboutBio: async (): Promise<ApiResponse<{ bio: AboutBio }>> => {
        return await apiClient.get('/admin/pages/about/bio');
    },
    updateAboutBio: async (payload: AboutBioPayload): Promise<ApiResponse<{ bio: AboutBio }>> => {
        return await apiClient.put('/admin/pages/about/bio', payload);
    },
    getPublicAboutBio: async (): Promise<ApiResponse<{ bio: AboutBio }>> => {
        return await apiClient.get('/pages/about/bio');
    },

    // About Qualifications
    getAboutQualifications: async (): Promise<ApiResponse<AboutQualification[]>> => {
        return await apiClient.get('/admin/pages/about/qualifications');
    },
    getPublicAboutQualifications: async (): Promise<ApiResponse<AboutQualification[]>> => {
        return await apiClient.get('/pages/about/qualifications');
    },
    createAboutQualification: async (payload: AboutQualificationPayload): Promise<ApiResponse<AboutQualification>> => {
        return await apiClient.post('/admin/pages/about/qualifications', payload);
    },
    updateAboutQualification: async (
        qualificationId: number,
        payload: AboutQualificationPayload,
    ): Promise<ApiResponse<AboutQualification>> => {
        return await apiClient.put(`/admin/pages/about/qualifications/${qualificationId}`, payload);
    },
    deleteAboutQualification: async (qualificationId: number): Promise<ApiResponse<null>> => {
        return await apiClient.delete(`/admin/pages/about/qualifications/${qualificationId}`);
    },
    toggleAboutQualificationStatus: async (
        qualificationId: number,
        isActive: boolean,
    ): Promise<ApiResponse<AboutQualification>> => {
        return await apiClient.put(`/admin/pages/about/qualifications/${qualificationId}/status`, {
            status: isActive,
        });
    },

    // About Values
    getAboutValues: async (): Promise<ApiResponse<AboutValue[]>> => {
        return await apiClient.get('/admin/pages/about/values');
    },
    getPublicAboutValues: async (): Promise<ApiResponse<AboutValue[]>> => {
        return await apiClient.get('/pages/about/values');
    },
    createAboutValue: async (payload: AboutValuePayload): Promise<ApiResponse<AboutValue>> => {
        return await apiClient.post('/admin/pages/about/values', payload);
    },
    updateAboutValue: async (
        valueId: number,
        payload: AboutValuePayload,
    ): Promise<ApiResponse<AboutValue>> => {
        return await apiClient.put(`/admin/pages/about/values/${valueId}`, payload);
    },
    deleteAboutValue: async (valueId: number): Promise<ApiResponse<null>> => {
        return await apiClient.delete(`/admin/pages/about/values/${valueId}`);
    },
    toggleAboutValueStatus: async (
        valueId: number,
        isActive: boolean,
    ): Promise<ApiResponse<AboutValue>> => {
        return await apiClient.put(`/admin/pages/about/values/${valueId}/status`, {
            status: isActive,
        });
    },

    // About Certificates
    getAboutCertificates: async (): Promise<ApiResponse<AboutCertificate[]>> => {
        return await apiClient.get('/admin/pages/about/certificates');
    },
    getPublicAboutCertificates: async (): Promise<ApiResponse<AboutCertificate[]>> => {
        return await apiClient.get('/pages/about/certificates');
    },
    createAboutCertificate: async (payload: AboutCertificatePayload): Promise<ApiResponse<AboutCertificate>> => {
        return await apiClient.post('/admin/pages/about/certificates', payload);
    },
    updateAboutCertificate: async (
        certificateId: number,
        payload: AboutCertificatePayload,
    ): Promise<ApiResponse<AboutCertificate>> => {
        return await apiClient.put(`/admin/pages/about/certificates/${certificateId}`, payload);
    },
    deleteAboutCertificate: async (certificateId: number): Promise<ApiResponse<null>> => {
        return await apiClient.delete(`/admin/pages/about/certificates/${certificateId}`);
    },
    toggleAboutCertificateStatus: async (
        certificateId: number,
        isActive: boolean,
    ): Promise<ApiResponse<AboutCertificate>> => {
        return await apiClient.put(`/admin/pages/about/certificates/${certificateId}/status`, {
            status: isActive,
        });
    },
};
