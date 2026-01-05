/**
 * VISITOR LOGS SERVICE
 * Track and retrieve website visitor analytics
 */

import apiClient from '../lib/axios';
import type { ApiResponse, VisitorLogsResponse } from '../lib/types';

export const visitorLogService = {
    /**
     * Get paginated visitor logs with filters
     */
    getLogs: async (
        page: number = 1,
        perPage: number = 15,
        filters?: {
            search?: string;
            device?: 'all' | 'desktop' | 'mobile' | 'tablet';
            date_range?: 'today' | 'yesterday' | '7days' | '30days' | 'custom';
            date_from?: string;
            date_to?: string;
        }
    ): Promise<ApiResponse<VisitorLogsResponse>> => {
        return await apiClient.get('/admin/visitor-logs', {
            params: {
                page,
                per_page: perPage,
                ...filters,
            },
        });
    },
};
