import axios from 'axios';

const IS_VERCEL = window.location.hostname.includes('vercel.app');
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_BASE_URL ? `${API_BASE_URL}/api` : '/api',
});

// 請求攔截器
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // On Vercel: rewrite requests through serverless proxy
  // e.g. /auth/login → /api/proxy?p=/auth/login
  if (IS_VERCEL && !API_BASE_URL) {
    const path = config.url || '';
    config.baseURL = '';
    config.url = `/api/proxy?p=${encodeURIComponent(path)}`;
  }

  return config;
});

// 響應攔截器：處理 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
