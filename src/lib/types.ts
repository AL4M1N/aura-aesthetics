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
export interface LoginLogUserSummary {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    role_id?: number;
    status?: 'active' | 'inactive';
    last_login_at?: string | null;
    last_login_ip?: string | null;
    avatar?: string | null;
}

export interface LoginLog {
    id: number;
    admin_user_id?: number | null;
    email: string;
    ip_address: string;
    user_agent?: string;
    device: 'desktop' | 'mobile' | 'tablet' | string;
    browser: string;
    os?: string | null;
    location?: string | null;
    latitude?: string | null;
    longitude?: string | null;
    status: 'success' | 'failed';
    failure_reason?: string | null;
    attempted_at: string;
    created_at?: string;
    updated_at?: string;
    admin_user?: LoginLogUserSummary | null;
}

export interface LoginLogStats {
    total: number;
    successful: number;
    failed: number;
    today: number;
}

export interface LoginLogPagination {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
}

export interface LoginLogsResponse {
    logs: LoginLog[];
    pagination: LoginLogPagination;
    stats: LoginLogStats;
}

// Visitor Logs
export interface VisitorLogPageView {
    id: number;
    visitor_log_id: number;
    page_url: string;
    page_title?: string | null;
    viewed_at?: string | null;
    time_spent_seconds?: number | null;
    created_at: string;
    updated_at: string;
}

export interface VisitorLog {
    id: number;
    session_id: string;
    ip_address: string;
    user_agent: string;
    device: 'desktop' | 'mobile' | 'tablet' | string;
    browser: string;
    os: string;
    location?: string | null;
    country_code?: string | null;
    city?: string | null;
    referrer: string;
    referrer_source?: string | null;
    landing_page?: string | null;
    current_page?: string | null;
    visited_at: string;
    session_start?: string | null;
    session_end?: string | null;
    duration_seconds?: number | null;
    duration?: string | null;
    pages_visited?: string[];
    page_views?: VisitorLogPageView[];
    created_at?: string;
    updated_at?: string;
}

export interface VisitorLogStats {
    total_visitors: number;
    avg_duration: string;
    bounce_rate: string;
    unique_ips: number;
}

export interface VisitorLogPagination {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
}

export interface VisitorLogsResponse {
    visitors: VisitorLog[];
    pagination: VisitorLogPagination;
    stats: VisitorLogStats;
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
    description?: string;
    color: string;
    permissions: number[];
}

export interface UpdateRoleRequest {
    name?: string;
    description?: string;
    color?: string;
    permissions?: number[];
}

// Website Settings / CMS
export interface WebsiteSocialLinks {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    whatsapp?: string;
    youtube?: string;
    threads?: string;
}

export interface WebsiteBasicInfo {
    site_title?: string;
    site_subtitle?: string;
    header_cta_label?: string;
    header_cta_link?: string;
    footer_disclaimer?: string;
    footer_subtext?: string;
    logo_url?: string;
}

export interface WebsiteLocationInfo {
    map_embed_url?: string;
    address_notes?: string;
}

export interface WebsiteSettingsMeta {
    last_updated_by?: string;
    last_updated_at?: string;
    last_published_at?: string;
}

export interface WebsiteSettings {
    branding: WebsiteBasicInfo;
    social: WebsiteSocialLinks;
    location: WebsiteLocationInfo;
    meta?: WebsiteSettingsMeta;
}

// Page Builder Content
export interface HomeSlider {
    id: number;
    title: string;
    subtitle?: string | null;
    description?: string | null;
    cta_label?: string | null;
    cta_link?: string | null;
    media_url?: string | null;
    sort_order?: number | null;
    order?: number;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface HomeSliderPayload {
    title: string;
    subtitle?: string | null;
    description?: string | null;
    cta_label?: string | null;
    cta_link?: string | null;
    media_url?: string | null;
    order?: number;
    is_active?: boolean;
}
