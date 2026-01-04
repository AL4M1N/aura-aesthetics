/**
 * DASHBOARD STATISTICS SERVICE
 * Get dashboard analytics and statistics
 */

import apiClient from '../lib/axios';
import type { ApiResponse, DashboardStats } from '../lib/types';

export const dashboardService = {
    /**
     * Get all dashboard statistics
     */
    getStats: async (): Promise<ApiResponse<DashboardStats>> => {
        return await apiClient.get('/admin/dashboard-stats');
    },
};
