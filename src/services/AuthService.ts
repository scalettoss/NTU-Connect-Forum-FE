import serverApi from '@/lib/ServerApi';
import clientApi from '@/lib/ClientApi';
import { ChangePasswordRequestType, LoginRequestType, LoginResponseType, RegisterRequestType } from '@/types/AuthType';

export const login = async (data: LoginRequestType) => {
    try {
        const response = await serverApi.post<LoginResponseType>('/auth/login', data);
        return response;
    } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Đăng nhập thất bại';
        console.log('Error during login:', errorMessage);
        return errorMessage;
    }
};

export const register = async (data: RegisterRequestType) => {
    try {
        const response = await serverApi.post<string>('/auth/register', data);
        return response;
    } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Đăng kí thất bại';
        console.log('Error during register:', errorMessage);
        return errorMessage;
    }
};

export const changePassword = async (data: ChangePasswordRequestType) => {
    try {
        const response = await clientApi.post<string>('/user/change-password', data);
        return response;
    } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Đổi mật khẩu thất bại';
        console.log('Error during change password:', errorMessage);
        return errorMessage;
    }
};

