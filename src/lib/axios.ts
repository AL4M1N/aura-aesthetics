/**
 * AXIOS API CLIENT CONFIGURATION
 * Configures axios instance with base URL, interceptors, and error handling
 */

import axios, {
    AxiosError,
    InternalAxiosRequestConfig,
    AxiosResponse,
    AxiosRequestConfig,
} from 'axios';

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
    timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Request interceptor - Add auth token to requests
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle responses and errors globally
apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        // Return the data directly for successful responses
        return response.data;
    },
    (error: AxiosError) => {
        const isLoginRequest = (config?: AxiosRequestConfig) => {
            const requestUrl = config?.url ?? '';
            return requestUrl.includes('/admin/login') || requestUrl.includes('admin/login');
        };

        // Handle 401 Unauthorized - redirect to login
        if (error.response?.status === 401 && !isLoginRequest(error.config)) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            window.location.href = '/admin/login';
        }

        // Handle 403 Forbidden - insufficient permissions
        if (error.response?.status === 403) {
            console.error('Insufficient permissions:', error.response.data);
        }

        // Handle 429 Too Many Requests - rate limiting
        if (error.response?.status === 429) {
            console.error('Rate limit exceeded. Please try again later.');
        }

        // Return error data or original error
        return Promise.reject(error.response?.data || error);
    }
);

export default apiClient;
