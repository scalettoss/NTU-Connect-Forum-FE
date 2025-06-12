import { jwtDecode } from "jwt-decode";
import Cookies from 'js-cookie';

// Lấy admin token từ cookie (client-side)
export const getAdminAccessToken = (): string | null => {
    try {
        return Cookies.get('adminAccessToken') || null;
    } catch (error) {
        console.error("Lỗi khi lấy adminAccessToken:", error);
        return null;
    }
};

// Thêm admin token vào cookie (client-side)
export const setAdminAccessToken = (token: string, expiresInDays: number = 1): void => {
    try {
        Cookies.set('adminAccessToken', token, { expires: expiresInDays, path: '/' });
    } catch (error) {
        console.error("Lỗi khi lưu adminAccessToken:", error);
    }
};

// Xóa admin token khỏi cookie (client-side)
export const removeAdminAccessToken = (): void => {
    try {
        Cookies.remove('adminAccessToken', { path: '/' });
    } catch (error) {
        console.error("Lỗi khi xóa adminAccessToken:", error);
    }
};

// Decode token
export const decodeAdminToken = (token: string): AdminJwtPayload | null => {
    try {
        return jwtDecode<AdminJwtPayload>(token);
    } catch (error) {
        console.error("Lỗi khi decode admin token:", error);
        return null;
    }
};

// Kiểm tra token còn hạn hay không
export const isAdminTokenValid = (token: string): boolean => {
    try {
        const decodedToken = decodeAdminToken(token);
        if (!decodedToken) return false;

        // Kiểm tra thời gian hết hạn
        const currentTime = Math.floor(Date.now() / 1000);
        return decodedToken.exp > currentTime;
    } catch (error) {
        return false;
    }
};

// Kiểm tra xem user có quyền admin hoặc moderator không
export const hasAdminAccess = (token: string): boolean => {
    try {
        const decodedToken = decodeAdminToken(token);
        if (!decodedToken) return false;

        // @ts-ignore - Do cấu trúc token có thể khác với định nghĩa type
        const roleName = decodedToken.RoleName || decodedToken.roleName;

        return roleName === 'admin' || roleName === 'moderator';
    } catch (error) {
        console.error("Lỗi khi kiểm tra quyền admin:", error);
        return false;
    }
};

// Lấy thông tin admin từ token
export const getAdminInfoFromToken = (): { id: number; email: string; role: string } | null => {
    try {
        const token = getAdminAccessToken();
        if (!token || !isAdminTokenValid(token)) {
            return null;
        }

        const decodedToken = decodeAdminToken(token);
        if (!decodedToken) {
            return null;
        }

        return {
            // @ts-ignore - Do cấu trúc token có thể khác với định nghĩa type
            id: decodedToken.UserId || decodedToken.userId,
            // @ts-ignore
            email: decodedToken.Email || decodedToken.email,
            // @ts-ignore
            role: decodedToken.RoleName || decodedToken.roleName
        };
    } catch (error) {
        console.error("Lỗi khi lấy thông tin admin từ token:", error);
        return null;
    }
};

type AdminJwtPayload = {
    userId: number;
    email: string;
    roleName: string;
    exp: number;
    iat: number;
}; 