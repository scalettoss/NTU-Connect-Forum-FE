import { LoginRequestType, LoginResponseType, RegisterRequestType, RegisterResponseType } from '@/types/user';
import api from './apiservice';
import { ENDPOINT } from './endpoint';

export const login = async (credentials: LoginRequestType): Promise<LoginResponseType> => {
    try {
        const response = await api.post<LoginResponseType>(ENDPOINT.login, credentials);
        if (response.data.accessToken) {
            localStorage.setItem('token', response.data.accessToken);

            if (response.data.expires) {
                localStorage.setItem('tokenExpires', response.data.expires.toString());
            }
        }
        return response.data;
    } catch (error: any) {
        if (error.response && error.response.status === 401) {
            throw Error('Sai tài khoản hoặc mật khẩu');
        }
        console.error('Lỗi server:', error);
        throw error;
    }
};

export const register = async (userData: RegisterRequestType): Promise<RegisterResponseType> => {
    try {
        const response = await api.post<RegisterResponseType>(ENDPOINT.register, userData);
        return response.data;
    } catch (error: any) {
        if (error.response.status === 409) {
            throw new Error("Vui lòng thử lại với email khác!");
        }
        throw new Error("Đăng ký thất bại");
    }
};