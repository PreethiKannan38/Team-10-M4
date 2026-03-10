const getBackendUrl = () => {
    let url = '';
    // Use the backend URL provided in environment (Vercel Setting), or default to localhost
    if (import.meta.env.VITE_API_URL) {
        url = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '');
    } else {
        url = window.location.hostname === 'localhost' ? 'http://localhost:5002' : window.location.origin;
    }
    return url;
};

export const BACKEND_URL = getBackendUrl();
export const API_BASE_URL = `${BACKEND_URL}/api`;
export const WS_BASE_URL = import.meta.env.VITE_WS_URL || (window.location.hostname === 'localhost' ? 'ws://localhost:5002' : `wss://${window.location.host}`);
