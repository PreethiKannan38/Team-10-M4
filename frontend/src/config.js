const getBackendUrl = () => {
    const envUrl = import.meta.env.VITE_API_URL;
    if (envUrl) {
        // Remove /api suffix if present to get the root origin
        return envUrl.replace(/\/api\/?$/, '');
    }
    if (window.location.hostname === 'localhost') return 'http://localhost:5000';

    // Default to current origin for production if no env var is set
    return window.location.origin;
};

export const BACKEND_URL = getBackendUrl();
export const API_BASE_URL = `${BACKEND_URL}/api`;
export const WS_BASE_URL = import.meta.env.VITE_WS_URL || (BACKEND_URL.replace(/^http/, 'ws'));
