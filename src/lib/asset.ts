const RAW_API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:8000';
const API_BASE_URL = RAW_API_URL.replace(/\/api\/?$/, '').replace(/\/$/, '');
const CMS_RELATIVE_PREFIXES = ['/uploads/', '/storage/'];

const isAbsoluteAsset = (value?: string | null) => {
    if (!value) return false;
    return /^(?:https?:)?\/\//i.test(value) || value.startsWith('data:');
};

const shouldPrefixWithApi = (value?: string | null) => {
    if (!value) return false;
    return CMS_RELATIVE_PREFIXES.some((prefix) => value.startsWith(prefix));
};

export const resolveCmsAssetUrl = (value?: string | null) => {
    if (!value) return undefined;
    if (isAbsoluteAsset(value) || !API_BASE_URL || !shouldPrefixWithApi(value)) {
        return value;
    }
    return `${API_BASE_URL}${value.startsWith('/') ? value : `/${value}`}`;
};
