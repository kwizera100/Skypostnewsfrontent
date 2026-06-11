import axios from 'axios';

// Origin of the API server (no trailing /api). Used both for the dedicated
// apiClient and as the global axios default, so admin pages that call the
// global `axios` with absolute `/api/...` paths resolve to the API server
// instead of the SPA host (which returns index.html on Vercel).
export const API_ORIGIN = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL
  : import.meta.env.PROD
    ? 'https://api.skypostnews.com'
    : '';

// Make the GLOBAL default axios instance target the API server too.
axios.defaults.baseURL = API_ORIGIN;

const API_BASE = `${API_ORIGIN}/api`;

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Attach JWT token to every request if present
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('skypostnews_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
