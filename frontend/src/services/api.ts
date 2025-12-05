import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { message } from 'antd';

// 支援環境變數配置 API URL
// 開發環境：使用 /api（透過 Vite proxy）
// 生產環境：使用 VITE_API_URL 環境變數
const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? (import.meta.env.VITE_API_URL.endsWith('/api') 
      ? import.meta.env.VITE_API_URL 
      : `${import.meta.env.VITE_API_URL}/api`)
  : '/api';

// Create axios instance with UTF-8 encoding
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Accept': 'application/json; charset=utf-8',
  },
  responseType: 'json',
  responseEncoding: 'utf8',
});

// Request interceptor - Add JWT token to requests
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_info');
          message.error('登入已過期，請重新登入');
          window.location.href = '/login';
          break;
        case 403:
          message.error('您沒有權限執行此操作');
          break;
        case 404:
          message.error('請求的資源不存在');
          break;
        case 500:
          message.error('伺服器錯誤，請稍後再試');
          break;
        default:
          const errorMessage = (data as any)?.error?.message || '操作失敗';
          message.error(errorMessage);
      }
    } else if (error.request) {
      message.error('網路連線失敗，請檢查您的網路');
    } else {
      message.error('請求發生錯誤');
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
