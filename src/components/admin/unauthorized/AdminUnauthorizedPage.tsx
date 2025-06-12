"use client";
import React from 'react';
import { Shield, AlertTriangle, ArrowLeft, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { LogoWithText } from '@/components/common/Logo';
import { removeAdminAccessToken } from '@/helper/AdminTokenHelper';

const AdminUnauthorizedPage: React.FC = () => {
    const router = useRouter();

    const handleLogout = () => {
        removeAdminAccessToken();
        router.push('/admin/login');
    };

    const handleBackToHome = () => {
        router.push('/home');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50 flex items-center justify-center p-4">
            <div className="max-w-lg w-full bg-white rounded-xl shadow-xl p-8 text-center">
                <div className="flex justify-center mb-6">
                    <div className="bg-red-100 p-4 rounded-full">
                        <AlertTriangle className="h-16 w-16 text-red-500" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-gray-800 mb-4">Không có quyền truy cập</h1>

                <div className="flex items-center justify-center gap-2 mb-4">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <span className="text-blue-600 font-medium">Khu vực quản trị</span>
                </div>

                <p className="text-gray-600 mb-8">
                    Bạn không có quyền truy cập vào khu vực quản trị.
                    Chỉ tài khoản có quyền <span className="font-semibold">Admin</span> hoặc <span className="font-semibold">Moderator</span> mới có thể đăng nhập.
                </p>

                <div className="flex flex-col md:flex-row gap-4 justify-center">
                    <button
                        onClick={handleBackToHome}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        Về trang chủ
                    </button>

                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors"
                    >
                        <LogOut className="h-5 w-5" />
                        Đăng xuất
                    </button>
                </div>

                <div className="mt-12 flex justify-center">
                    <LogoWithText width={40} height={40} />
                </div>
            </div>
        </div>
    );
};

export default AdminUnauthorizedPage; 