const getApiBaseUrl = () => {
    if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
    if (window.location.hostname === 'localhost') return 'http://localhost:5000/api';
    return `${window.location.origin}/api`;
};

export const API_BASE_URL = getApiBaseUrl();
export const WS_BASE_URL = import.meta.env.VITE_WS_URL || (window.location.hostname === 'localhost' ? 'ws://localhost:5000' : `wss://${window.location.host}`);
