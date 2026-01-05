/**
 * USER MANAGEMENT SERVICE
 * CRUD operations for admin users
 */

import apiClient from '../lib/axios';
import type {
    ApiResponse,
    User,
    UsersResponse,
    CreateUserRequest,
    UpdateUserRequest,
} from '../lib/types';

export const userService = {
    /**
     * Get paginated list of users
     */
    getUsers: async (
        page: number = 1,
        perPage: number = 15,
        search: string = '',
        role?: string,
        status?: string
    ): Promise<ApiResponse<UsersResponse>> => {
        return await apiClient.get('/admin/users', {
            params: {
                page,
                per_page: perPage,
                search: search || undefined,
                role: role || undefined,
                status: status || undefined,
            },
        });
    },

    /**
     * Get single user by ID
     */
    getUser: async (id: number): Promise<ApiResponse<User>> => {
        return await apiClient.get(`/admin/users/${id}`);
    },

    /**
     * Create new user
     */
    createUser: async (userData: CreateUserRequest): Promise<ApiResponse<User>> => {
        return await apiClient.post('/admin/users', userData);
    },

    /**
     * Update existing user
     */
    updateUser: async (
        id: number,
        userData: UpdateUserRequest
    ): Promise<ApiResponse<User>> => {
        return await apiClient.put(`/admin/users/${id}`, userData);
    },

    /**
     * Delete user
     */
    deleteUser: async (id: number): Promise<ApiResponse<null>> => {
        return await apiClient.delete(`/admin/users/${id}`);
    },
};
