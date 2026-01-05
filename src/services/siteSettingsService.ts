/**
 * WEBSITE SETTINGS SERVICE
 * Provides helper methods for fetching and updating CMS content.
 */

import apiClient from '../lib/axios';
import type { ApiResponse, WebsiteSettings } from '../lib/types';

export const siteSettingsService = {
    /**
     * Load the current website configuration for the CMS form.
     */
    getWebsiteSettings: async (): Promise<ApiResponse<WebsiteSettings>> => {
        return await apiClient.get('/admin/settings/website');
    },

    /**
     * Public endpoint used by the marketing site.
     */
    getPublicWebsiteSettings: async (): Promise<ApiResponse<WebsiteSettings>> => {
        return await apiClient.get('/settings/website');
    },

    /**
     * Persist website content updates to the backend.
     */
    updateWebsiteSettings: async (
        payload: WebsiteSettings
    ): Promise<ApiResponse<WebsiteSettings>> => {
        return await apiClient.put('/admin/settings/website', payload);
    },
};
