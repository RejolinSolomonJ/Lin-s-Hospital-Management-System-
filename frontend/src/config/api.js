// Lin's Dental College - Dynamic API & Socket Endpoint Configuration
// Supports desktop localhost as well as real mobile devices connected over LAN / Wi-Fi

export const getBaseUrl = () => {
    // 1. Production environment variable for Vercel -> Render backend connection
    if (import.meta.env?.VITE_BACKEND_URL) {
        return import.meta.env.VITE_BACKEND_URL.replace(/\/$/, '');
    }

    // 2. Cross-device LAN mobile testing
    if (typeof window !== 'undefined' && window.location) {
        const hostname = window.location.hostname;
        if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
            return `http://${hostname}:5000`;
        }
    }

    // 3. Localhost development fallback
    return 'http://localhost:5000';
};

export const API_BASE_URL = getBaseUrl();
export const SOCKET_URL = getBaseUrl();
