/**
 * TYPESCRIPT INTERFACES FOR API RESPONSES
 */

// Common API Response wrapper
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data: T;
}

export interface ApiError {
    success: false;
    message: string;
    errors?: Record<string, string[]>;
}

// Authentication
export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    temp_token: string;
    email: string;
    otp_expires_in: number;
    otp_code?: string; // Only in development
}

export interface VerifyOtpRequest {
    email: string;
    otp: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    status: 'active' | 'inactive';
    role: Role;
    last_login_at?: string;
    created_at: string;
    updated_at: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}

// Roles & Permissions
export interface Role {
    id: number;
    name: string;
    slug: string;
    description?: string;
    color: string;
    is_system: boolean;
    user_count?: number;
    permissions: Permission[];
    created_at: string;
    updated_at: string;
}

export interface Permission {
    id: number;
    name: string;
    slug: string;
    group: string;
    description?: string;
}

export interface PermissionGroup {
    group: string;
    permissions: Permission[];
}

// Dashboard Stats
export interface DashboardStats {
    total_visitors: number;
    visitors_change: number;
    total_users: number;
    users_change: number;
    total_logins: number;
    logins_change: number;
    active_sessions: number;
    sessions_change: number;
    monthly_visitors: Array<{
        date: string;
        visitors: number;
    }>;
    device_stats: Array<{
        name: string;
        value: number;
        color: string;
    }>;
    page_views: Array<{
        page: string;
        views: number;
    }>;
    top_locations: Array<{
        country: string;
        visitors: number;
        percentage: number;
    }>;
}

// Login Logs
export interface LoginLog {
    id: number;
    user_name: string;
    email: string;
    ip_address: string;
    location: string;
    device: 'desktop' | 'mobile' | 'tablet';
    browser: string;
    status: 'success' | 'failed';
    reason?: string;
    timestamp: string;
}

export interface LoginLogsResponse {
    data: LoginLog[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

// Visitor Logs
export interface VisitorLog {
    id: number;
    session_id: string;
    ip_address: string;
    location: string;
    device: 'desktop' | 'mobile' | 'tablet';
    browser: string;
    os: string;
    referrer: string;
    duration: string;
    pages_visited: string[];
    timestamp: string;
}

export interface VisitorLogsResponse {
    data: VisitorLog[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

// User Management
export interface CreateUserRequest {
    name: string;
    email: string;
    phone?: string;
    password: string;
    password_confirmation: string;
    role_id: number;
    status: 'active' | 'inactive';
}

export interface UpdateUserRequest {
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
    password_confirmation?: string;
    role_id?: number;
    status?: 'active' | 'inactive';
}

export interface UsersResponse {
    data: User[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

// Role Management
export interface CreateRoleRequest {
    name: string;
    slug: string;
    description?: string;
    color: string;
    permission_ids: number[];
}

export interface UpdateRoleRequest {
    name?: string;
    description?: string;
    color?: string;
    permission_ids?: number[];
}
