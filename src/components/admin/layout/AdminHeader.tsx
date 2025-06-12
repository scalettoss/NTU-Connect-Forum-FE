"use client";
import React, { useState } from 'react';
import { Menu, LogOut, User, Settings, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { removeAdminAccessToken } from '@/helper/AdminTokenHelper';
import { useAdminUser } from '@/hooks/useAdminUser';
import { toast } from 'react-hot-toast';
import { getImagesFromUrl } from '@/helper/GetImagesHelper';

interface AdminHeaderProps {
    onToggleSidebar: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ onToggleSidebar }) => {
    const router = useRouter();
    const userInfo = useAdminUser();
    const [showUserMenu, setShowUserMenu] = useState(false);

    const handleLogout = () => {
        // Remove admin token
        removeAdminAccessToken();

        // Redirect to login page
        router.push('/admin/login');

        // Show success message
        toast.success('Đăng xuất thành công!', {
            duration: 3000,
            position: 'top-center',
        });
    };

    // Format role for display
    const displayRole = () => {
        if (!userInfo.role) return 'Admin';

        switch (userInfo.role.toLowerCase()) {
            case 'admin':
                return 'Quản trị viên';
            case 'moderator':
                return 'Điều hành viên';
            default:
                return userInfo.role;
        }
    };

    return (
        <header className="bg-white shadow-sm z-10">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <button
                            className="lg:hidden text-gray-500 hover:text-gray-600 focus:outline-none"
                            onClick={onToggleSidebar}
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                        <h1 className="ml-3 text-xl font-semibold text-gray-800">Dashboard Admin</h1>
                    </div>

                    <div className="flex items-center">
                        <div className="relative">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center space-x-2 focus:outline-none"
                            >
                                <div className="relative h-8 w-8 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center text-blue-700">
                                    {userInfo.isLoading ? (
                                        <div className="animate-pulse w-full h-full bg-blue-200"></div>
                                    ) : userInfo.avatarUrl ? (
                                        <Image
                                            src={getImagesFromUrl(userInfo.avatarUrl)}
                                            alt={userInfo.fullName || 'Admin'}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <span className="font-medium">
                                            {userInfo.fullName?.charAt(0) || 'A'}
                                        </span>
                                    )}
                                </div>
                                <div className="hidden md:block text-left">
                                    <p className="text-sm font-medium text-gray-700">
                                        {userInfo.isLoading ? 'Đang tải...' : userInfo.fullName || 'Admin User'}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {userInfo.isLoading ? '' : displayRole()}
                                    </p>
                                </div>
                                <ChevronDown className="h-4 w-4 text-gray-500" />
                            </button>

                            {showUserMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                                    <div className="px-4 py-2 border-b border-gray-100">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {userInfo.fullName || 'Admin User'}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">
                                            {userInfo.email}
                                        </p>
                                    </div>
                                    <a
                                        href="#"
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                    >
                                        <User className="h-4 w-4 mr-2" />
                                        Thông tin cá nhân
                                    </a>
                                    <a
                                        href="#"
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                    >
                                        <Settings className="h-4 w-4 mr-2" />
                                        Cài đặt tài khoản
                                    </a>
                                    <button
                                        onClick={handleLogout}
                                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                                    >
                                        <LogOut className="h-4 w-4 mr-2" />
                                        Đăng xuất
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default AdminHeader; 