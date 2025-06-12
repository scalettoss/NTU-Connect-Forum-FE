import { getUserProfile } from "@/services/UserService";
// import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";
import Cookies from 'js-cookie';



// // Lấy token từ cookie (server-side)
// export const getAccessTokenServer = async (): Promise<string | null> => {
//     try {
//         const cookieStore = await cookies();
//         return cookieStore.get("accessToken")?.value || null;
//     } catch (error) {
//         console.error("Lỗi khi lấy accessToken:", error);
//         return null;
//     }
// };

// Lấy token từ cookie (client-side)
export const getAccessTokenClient = (): string | null => {
    try {
        return Cookies.get('accessToken') || null;
    } catch (error) {
        console.error("Lỗi khi lấy accessToken:", error);
        return null;
    }
};

// Thêm token vào cookie (client-side)
export const setAccessTokenClient = (token: string, expiresInDays: number = 7): void => {
    try {
        Cookies.set('accessToken', token, { expires: expiresInDays, path: '/' });
    } catch (error) {
        console.error("Lỗi khi lưu accessToken:", error);
    }
};

// Xóa token khỏi cookie (client-side)
export const removeAccessTokenClient = (): void => {
    try {
        Cookies.remove('accessToken', { path: '/' });
    } catch (error) {
        console.error("Lỗi khi xóa accessToken:", error);
    }
};

// Decode token
export const decodeToken = (token: string): JwtPayload | null => {
    try {
        return jwtDecode<JwtPayload>(token);
    } catch (error) {
        console.error("Lỗi khi decode token:", error);
        return null;
    }
};

// Kiểm tra token còn hạn hay không
export const isTokenValid = (token: string): boolean => {
    try {
        const decodedToken = decodeToken(token);
        if (!decodedToken) return false;

        // Kiểm tra thời gian hết hạn
        const currentTime = Math.floor(Date.now() / 1000);
        return decodedToken.exp > currentTime;
    } catch (error) {
        return false;
    }
};

// Lấy thông tin user từ token (server-side)
// export const getUserFromTokenServer = async () => {
//     try {
//         const token = await getAccessTokenServer();
//         if (!token || !isTokenValid(token)) {
//             return null;
//         }

//         const decodedToken = decodeToken(token);
//         if (!decodedToken) {
//             return null;
//         }

//         // Lấy thông tin chi tiết của user từ API
//         const userProfile = await getUserProfile(decodedToken.userId);
//         console.log("Lấy thông tin user thành công: ", userProfile);
//         return userProfile;
//     } catch (error) {
//         console.error("Lỗi khi lấy thông tin user:", error);
//         return null;
//     }
// };

// Lấy thông tin user từ token mà không gọi API (client-side)
export const getUserInfoFromTokenClient = (): { id: number; email: string; role: string } | null => {
    try {
        const token = getAccessTokenClient();
        if (!token || !isTokenValid(token)) {
            return null;
        }

        const decodedToken = decodeToken(token);
        if (!decodedToken) {
            return null;
        }
        return {
            //@ts-ignore
            id: decodedToken.UserId,
            //@ts-ignore
            email: decodedToken.Email,
            //@ts-ignore
            role: decodedToken.RoleName
        };
    } catch (error) {
        console.error("Lỗi khi lấy thông tin user từ token:", error);
        return null;
    }
};

// Lấy thông tin user từ API bằng userId từ token (client-side)
export const getUserFromTokenClient = async () => {
    try {
        const token = getAccessTokenClient();
        if (!token || !isTokenValid(token)) {
            return null;
        }

        const decodedToken = decodeToken(token);
        if (!decodedToken) {
            return null;
        }
        // Lấy thông tin chi tiết của user từ API
        // @ts-ignore
        const userProfile = await getUserProfile(decodedToken.UserId);
        console.log("Thông tin user: ", userProfile)
        return userProfile;
    } catch (error) {
        console.error("Lỗi khi lấy thông tin user:", error);
        return null;
    }
};

type JwtPayload = {
    userId: number;
    email: string;
    roleName: string;
    exp: number;
    iat: number;
};