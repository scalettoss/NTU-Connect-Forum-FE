"use client";
import React from 'react';
import { Shield, Users, FileText, Tag, Bell, Settings, LogOut, X, AlertTriangle } from 'lucide-react';
import { LogoWithText } from '@/components/common/Logo';
import { useAdminUser } from '@/hooks/useAdminUser';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { removeAdminAccessToken } from '@/helper/AdminTokenHelper';
import ToastService from '@/services/ToastService';

interface AdminSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
    const router = useRouter();
    const pathname = usePathname();
    const userInfo = useAdminUser();

    const handleLogout = () => {
        // Remove admin token
        removeAdminAccessToken();

        // Redirect to login page
        router.push('/admin/login');

        // Show success message
        ToastService.success('Đăng xuất thành công!');
    };

    const isActive = (path: string) => {
        if (path === '/admin/dashboard') {
            return pathname === path;
        }
        return pathname.startsWith(path);
    };

    return (
        <div
            className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${isOpen ? 'translate-x-0' : '-translate-x-full'
                } transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0`}
        >
            <div className="flex flex-col h-full">
                {/* Sidebar Header */}
                <div className="flex items-center justify-between px-4 py-5 border-b">
                    <div className="flex items-center">
                        <LogoWithText width={36} height={36} />
                    </div>
                    <button
                        className="lg:hidden"
                        onClick={onClose}
                    >
                        <X className="h-6 w-6 text-gray-500" />
                    </button>
                </div>

                {/* Sidebar Content */}
                <div className="flex-1 overflow-y-auto py-4">
                    <nav className="space-y-1 px-3">
                        <Link
                            href="/admin/dashboard"
                            className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg ${isActive('/admin/dashboard')
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            <Shield className="h-5 w-5 mr-3" />
                            Tổng quan
                        </Link>
                        <Link
                            href="/admin/users"
                            className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg ${isActive('/admin/users')
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            <Users className="h-5 w-5 mr-3" />
                            Quản lý người dùng
                        </Link>
                        <Link
                            href="/admin/posts"
                            className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg ${isActive('/admin/posts')
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            <FileText className="h-5 w-5 mr-3" />
                            Quản lý bài viết
                        </Link>
                        <Link
                            href="/admin/categories"
                            className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg ${isActive('/admin/categories')
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            <Tag className="h-5 w-5 mr-3" />
                            Quản lý danh mục
                        </Link>
                        <Link
                            href="/admin/reports"
                            className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg ${isActive('/admin/reports')
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            <AlertTriangle className="h-5 w-5 mr-3" />
                            Quản lý báo cáo
                        </Link>
                        <Link
                            href="/admin/notifications"
                            className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg ${isActive('/admin/notifications')
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            <Bell className="h-5 w-5 mr-3" />
                            Thông báo
                        </Link>
                        <Link
                            href="/admin/settings"
                            className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg ${isActive('/admin/settings')
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            <Settings className="h-5 w-5 mr-3" />
                            Cài đặt hệ thống
                        </Link>
                    </nav>
                </div>

                {/* Sidebar Footer */}
                <div className="p-4 border-t">
                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                    >
                        <LogOut className="h-4 w-4 mr-2" />
                        Đăng xuất
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminSidebar; 