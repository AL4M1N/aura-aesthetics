import apiClient from '../lib/axios';
import type {
    ApiResponse,
    ServiceInstruction,
    ServiceInstructionPayload
} from '../lib/types';

export const serviceInstructionsService = {
    // ==========================================
    // ADMIN ENDPOINTS (Requires Authentication)
    // ==========================================

    /**
     * Get all service instructions (Admin)
     */
    getServiceInstructions: async (): Promise<ApiResponse<ServiceInstruction[]>> => {
        return await apiClient.get('/admin/service-instructions');
    },

    /**
     * Update service instruction
     * Note: Only title, content, icon, and is_active can be updated
     * The 'type' field is fixed (only 2 instructions exist by design)
     */
    updateServiceInstruction: async (
        id: number,
        payload: ServiceInstructionPayload
    ): Promise<ApiResponse<ServiceInstruction>> => {
        return await apiClient.put(`/admin/service-instructions/${id}`, payload);
    },

    // ==========================================
    // PUBLIC ENDPOINTS (No Authentication)
    // ==========================================

    /**
     * Get all active service instructions (Public)
     */
    getPublicServiceInstructions: async (): Promise<ApiResponse<ServiceInstruction[]>> => {
        return await apiClient.get('/service-instructions');
    },
};
