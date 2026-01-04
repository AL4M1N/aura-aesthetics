/**
 * AUTHENTICATION SERVICE
 * Handles login, OTP verification, and logout
 */

import apiClient from '../lib/axios';
import type {
    ApiResponse,
    LoginRequest,
    LoginResponse,
    VerifyOtpRequest,
    AuthResponse,
    User,
} from '../lib/types';

export const authService = {
    /**
     * Login with email and password
     * Returns temp_token for OTP verification
     */
    login: async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
        return await apiClient.post('/admin/login', data);
    },

    /**
     * Verify OTP code
     * Returns auth token and user data
     */
    verifyOtp: async (
        data: VerifyOtpRequest,
        tempToken: string
    ): Promise<ApiResponse<AuthResponse>> => {
        const response = await apiClient.post<any, ApiResponse<AuthResponse>>(
            '/admin/verify-otp',
            data,
            {
                headers: { Authorization: `Bearer ${tempToken}` },
            }
        );

        // Store token and user in localStorage
        if (response.success) {
            localStorage.setItem('auth_token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }

        return response;
    },

    /**
     * Resend OTP code
     */
    resendOtp: async (email: string): Promise<ApiResponse<LoginResponse>> => {
        return await apiClient.post('/admin/resend-otp', { email });
    },

    /**
     * Logout current user
     */
    logout: async (): Promise<ApiResponse<null>> => {
        const response = await apiClient.post<any, ApiResponse<null>>('/admin/logout', {});

        // Clear local storage
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        localStorage.removeItem('temp_token');
        localStorage.removeItem('temp_email');

        return response;
    },

    /**
     * Get current authenticated user from localStorage
     */
    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    /**
     * Fetch the current user's profile from the API and keep local cache in sync.
     */
    getProfile: async (): Promise<ApiResponse<{ user: User }>> => {
        return await apiClient.get<any, ApiResponse<{ user: User }>>('/admin/profile');
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated: (): boolean => {
        return !!localStorage.getItem('auth_token');
    },

    /**
     * Update current user profile
     */
    updateProfile: async (data: {
        name?: string;
        email?: string;
        phone?: string;
    }): Promise<ApiResponse<any>> => {
        const response = await apiClient.put<any, ApiResponse<any>>('/admin/profile', data);

        // Update user in localStorage if successful
        if (response && (response as any).success !== false) {
            const currentUser = authService.getCurrentUser();
            if (currentUser) {
                const updatedUser = { ...currentUser, ...data };
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }
        }

        return response;
    },

    /**
     * Change user password
     */
    changePassword: async (data: {
        current_password: string;
        new_password: string;
        new_password_confirmation: string;
    }): Promise<ApiResponse<any>> => {
        return await apiClient.put<any, ApiResponse<any>>('/admin/change-password', data);
    },
};
