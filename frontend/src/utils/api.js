import axios from 'axios';

// 從環境變數讀取 API URL，如果沒有則使用本地
const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const baseURL = API_BASE_URL ? `${API_BASE_URL}/api` : '/api';

const api = axios.create({
  baseURL,
});

// 請求攔截器：添加 token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
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
