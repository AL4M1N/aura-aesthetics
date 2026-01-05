/**
 * LOGIN LOGS SERVICE
 * Track and retrieve admin login activities
 */

import apiClient from '../lib/axios';
import type { ApiResponse, LoginLogsResponse } from '../lib/types';

export const loginLogService = {
    /**
     * Get paginated login logs with filters
     */
    getLogs: async (
        page: number = 1,
        perPage: number = 15,
        filters?: {
            search?: string;
            status?: 'all' | 'success' | 'failed';
            device?: 'all' | 'desktop' | 'mobile' | 'tablet';
            date_from?: string;
            date_to?: string;
        }
    ): Promise<ApiResponse<LoginLogsResponse>> => {
        return await apiClient.get('/admin/login-logs', {
            params: {
                page,
                per_page: perPage,
                ...filters,
            },
        });
    },
};
