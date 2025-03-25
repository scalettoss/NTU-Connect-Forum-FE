import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

const api: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor xử lý request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token'); // Lấy token từ localStorage (hoặc context/state...)
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);
export default api;

api.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            console.error('Unauthorized! Redirecting to login...');
        } else if (error.response?.status === 403) {
            console.error('Forbidden: You do not have permission to access this resource');
        } else if (error.response?.status === 404) {
            console.error('Resource not found');
        } else if (error.response?.status === 500) {
            console.error('Server error');
        } else if (error.code === 'ECONNABORTED') {
            console.error('Request timeout');
        } else if (!error.response) {
            console.error('Network error - please check your connection');
        }
        return Promise.reject(error);
    }
);
