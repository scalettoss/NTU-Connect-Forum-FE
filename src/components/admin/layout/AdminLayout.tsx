"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';
import { getAdminAccessToken, hasAdminAccess, isAdminTokenValid } from '@/helper/AdminTokenHelper';

interface AdminLayoutProps {
    children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if admin is logged in
        const token = getAdminAccessToken();

        if (!token) {
            router.push('/admin/login');
            return;
        }

        // Check if token is valid
        if (!isAdminTokenValid(token)) {
            router.push('/admin/login');
            return;
        }

        // Check if user has admin/moderator role
        if (!hasAdminAccess(token)) {
            router.push('/admin/unauthorized');
            return;
        }

        // Check if login success message should be shown
        const loginSuccess = localStorage.getItem('admin_login_success');
        if (loginSuccess) {
            localStorage.removeItem('admin_login_success');
        }

        setIsLoading(false);
    }, [router]);

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-100">
                <div className="flex flex-col items-center">
                    <svg className="animate-spin h-12 w-12 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="mt-4 text-lg font-medium text-gray-700">Đang tải...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            <Toaster position="top-center" />

            {/* Sidebar */}
            <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <AdminHeader onToggleSidebar={() => setIsSidebarOpen(true)} />

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto bg-gray-100 p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout; 