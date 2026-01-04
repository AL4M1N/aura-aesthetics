/**
 * ROLE & PERMISSION MANAGEMENT SERVICE
 * Manage admin roles and permissions
 */

import apiClient from '../lib/axios';
import type {
    ApiResponse,
    Role,
    Permission,
    PermissionGroup,
    CreateRoleRequest,
    UpdateRoleRequest,
} from '../lib/types';

export const roleService = {
    /**
     * Get all roles
     */
    getRoles: async (): Promise<ApiResponse<Role[]>> => {
        return await apiClient.get('/admin/roles');
    },

    /**
     * Get single role by ID
     */
    getRole: async (id: number): Promise<ApiResponse<Role>> => {
        return await apiClient.get(`/admin/roles/${id}`);
    },

    /**
     * Create new role
     */
    createRole: async (roleData: CreateRoleRequest): Promise<ApiResponse<Role>> => {
        return await apiClient.post('/admin/roles', roleData);
    },

    /**
     * Update existing role
     */
    updateRole: async (
        id: number,
        roleData: UpdateRoleRequest
    ): Promise<ApiResponse<Role>> => {
        return await apiClient.put(`/admin/roles/${id}`, roleData);
    },

    /**
     * Delete role
     */
    deleteRole: async (id: number): Promise<ApiResponse<null>> => {
        return await apiClient.delete(`/admin/roles/${id}`);
    },

    /**
     * Get all available permissions grouped by category
     */
    getPermissions: async (): Promise<ApiResponse<PermissionGroup[]>> => {
        return await apiClient.get('/admin/permissions');
    },
};
