import axiosInstance from './AxiosInstance';
import Cookies from 'js-cookie';

const getAuthHeaders = (isFormData = false) => {
    const token = Cookies.get('accessToken');
    return {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
};

const clientApi = {
    get: async <T = any>(url: string, params?: Record<string, any>): Promise<T> => {
        const res = await axiosInstance.get<T>(url, {
            headers: getAuthHeaders(),
            params: params
        });
        return res.data;
    },
    post: async <T = any>(url: string, data: any, isFormData = false): Promise<T> => {
        const config = {
            headers: getAuthHeaders(isFormData)
        };
        const res = await axiosInstance.post<T>(url, data, config);
        return res.data;
    },
    put: async <T = any>(url: string, data: any, isFormData = false): Promise<T> => {
        const config = {
            headers: getAuthHeaders(isFormData)
        };
        const res = await axiosInstance.put<T>(url, data, config);
        return res.data;
    },
    delete: async <T = any>(url: string, config?: { params?: Record<string, any> }): Promise<T> => {
        const res = await axiosInstance.delete<T>(url, {
            headers: getAuthHeaders(),
            ...config
        });
        return res.data;
    }
};

export default clientApi;
