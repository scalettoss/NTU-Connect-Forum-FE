import axiosInstance from './AxiosInstance';
import Cookies from 'js-cookie';

const getAdminAuthHeaders = (isFormData = false) => {
    const token = Cookies.get('adminAccessToken');
    return {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
};

const adminApi = {
    get: async <T = any>(url: string, params?: Record<string, any>): Promise<T> => {
        const res = await axiosInstance.get<T>(url, {
            headers: getAdminAuthHeaders(),
            params: params
        });
        return res.data;
    },
    post: async <T = any>(
        url: string,
        data: any,
        params?: Record<string, any>,
        isFormData = false
    ): Promise<T> => {
        const config = {
            headers: getAdminAuthHeaders(isFormData),
            params: params
        };
        const res = await axiosInstance.post<T>(url, data, config);
        return res.data;
    },
    put: async <T = any>(url: string, data: any, isFormData = false): Promise<T> => {
        const config = {
            headers: getAdminAuthHeaders(isFormData)
        };
        const res = await axiosInstance.put<T>(url, data, config);
        return res.data;
    },
    delete: async <T = any>(url: string, config?: { params?: Record<string, any> }): Promise<T> => {
        const res = await axiosInstance.delete<T>(url, {
            headers: getAdminAuthHeaders(),
            ...config
        });
        return res.data;
    }
};

export default adminApi; 