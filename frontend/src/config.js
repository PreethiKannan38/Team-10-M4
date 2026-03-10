<<<<<<< HEAD
export const API_BASE_URL = 'http://localhost:5002/api';
export const WS_BASE_URL = 'ws://localhost:5002';
=======
const getBackendUrl = () => {
    if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '');
    return window.location.hostname === 'localhost' ? 'http://localhost:5000' : window.location.origin;
};

export const BACKEND_URL = getBackendUrl();
export const API_BASE_URL = `${BACKEND_URL}/api`;
export const WS_BASE_URL = import.meta.env.VITE_WS_URL || (window.location.hostname === 'localhost' ? 'ws://localhost:5000' : `wss://${window.location.host}`);
>>>>>>> 89206d5ed1213e4cc5ab5addace3797f8e4a9c9b
