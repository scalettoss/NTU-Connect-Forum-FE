import { useState, useEffect } from 'react';
import { getAdminAccessToken, getAdminInfoFromToken } from '@/helper/AdminTokenHelper';
import { getUserProfile } from '@/services/UserService';

interface AdminUserInfo {
    id: number;
    email: string;
    role: string;
    fullName: string;
    avatarUrl: string;
    isLoading: boolean;
    error: string | null;
}

const defaultUserInfo: AdminUserInfo = {
    id: 0,
    email: '',
    role: '',
    fullName: '',
    avatarUrl: '',
    isLoading: true,
    error: null
};

export const useAdminUser = (): AdminUserInfo => {
    const [userInfo, setUserInfo] = useState<AdminUserInfo>(defaultUserInfo);

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                // Get token info
                const tokenInfo = getAdminInfoFromToken();

                if (!tokenInfo) {
                    setUserInfo({
                        ...defaultUserInfo,
                        isLoading: false,
                        error: 'Không tìm thấy thông tin đăng nhập'
                    });
                    return;
                }

                // Call API to get detailed user info
                const userProfile = await getUserProfile(tokenInfo.id);

                if (!userProfile) {
                    setUserInfo({
                        ...defaultUserInfo,
                        id: tokenInfo.id,
                        email: tokenInfo.email,
                        role: tokenInfo.role,
                        isLoading: false,
                        error: 'Không thể lấy thông tin chi tiết người dùng'
                    });
                    return;
                }

                // Set user info
                setUserInfo({
                    id: tokenInfo.id,
                    email: tokenInfo.email,
                    role: tokenInfo.role,
                    fullName: userProfile.data.fullName || 'Admin User',
                    avatarUrl: userProfile.data.avatarUrl || '',
                    isLoading: false,
                    error: null
                });
            } catch (error) {
                console.error('Error fetching admin user info:', error);
                setUserInfo({
                    ...defaultUserInfo,
                    isLoading: false,
                    error: 'Lỗi khi lấy thông tin người dùng'
                });
            }
        };

        fetchUserInfo();
    }, []);

    return userInfo;
}; 