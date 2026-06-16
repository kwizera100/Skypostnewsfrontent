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

// Many admin pages call the GLOBAL axios instance directly. Make sure those
// requests also carry the latest token from storage.
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('skypostnews_token');
  if (token && config.headers && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// When the backend rejects the token (expired or signed with an old secret),
// clear the stale credentials and bounce the admin back to the login screen so
// a fresh, valid token is issued. Public pages are unaffected.
function handleAuthError(error: any) {
  const status = error?.response?.status;
  if (status === 401) {
    const hadToken = localStorage.getItem('skypostnews_token');
    if (hadToken) {
      localStorage.removeItem('skypostnews_token');
      localStorage.removeItem('skypostnews_user');
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin';
      }
    }
  }
  return Promise.reject(error);
}

apiClient.interceptors.response.use((r) => r, handleAuthError);
axios.interceptors.response.use((r) => r, handleAuthError);

export default apiClient;
