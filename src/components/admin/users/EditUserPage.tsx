"use client";
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import AdminLayout from '@/components/admin/layout/AdminLayout';
import { ArrowLeft, Mail, Shield, Lock, Power, Trash2 } from 'lucide-react';
import { getUserInformation, updateUserChangesByAdmin, deleteUser } from '@/services/UserService';
import { UserInformationResponseType, UserChangesByAdminRequestType } from '@/types/UserType';
import { getImagesFromUrl } from '@/helper/GetImagesHelper';
import { useRouter } from 'next/navigation';
import ToastService from '@/services/ToastService';
import DeleteUserModal from './DeleteUserModal';

const EditUserPage: React.FC<EditUserPageProps> = ({ userId }) => {
    const router = useRouter();
    const [user, setUser] = useState<UserInformationResponseType | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [initialRoleId, setInitialRoleId] = useState<number | null>(null);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors }
    } = useForm<FormData>({
        defaultValues: {
            email: '',
            roleId: '',
            password: '',
            isActive: true
        }
    });

    const isActive = watch('isActive');
    const currentRoleId = watch('roleId');

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                setIsLoading(true);
                const response = await getUserInformation(userId);
                setUser(response);
                setValue('email', response.email);
                const roleId = ROLE_MAPPING[response.roleName as keyof typeof ROLE_MAPPING] || 1;
                setInitialRoleId(roleId);
                setValue('roleId', ''); // Set empty string as default to show "Giữ nguyên vai trò hiện tại"
                setValue('isActive', response.isActive);
            } catch (err) {
                console.error('Error fetching user details:', err);
                setError('Không thể tải thông tin người dùng. Vui lòng thử lại sau.');
                ToastService.error('Không thể tải thông tin người dùng');
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserDetails();
    }, [userId, setValue]);

    const onSubmit = async (data: FormData) => {
        if (!user) return;

        try {
            setIsSubmitting(true);
            const updateData: Partial<UserChangesByAdminRequestType> = {
                userId: userId,
                email: data.email,
                isActive: data.isActive
            };

            // Only include password if it's not empty
            if (data.password) {
                updateData.password = data.password;
            }

            // Only include roleId if a new role is explicitly selected
            if (data.roleId && data.roleId !== '') {
                updateData.roleId = parseInt(data.roleId);
            }

            await updateUserChangesByAdmin(updateData as UserChangesByAdminRequestType);
            ToastService.success('Cập nhật thông tin người dùng thành công');
            router.push('/admin/users');
        } catch (err) {
            console.error('Error updating user:', err);
            ToastService.error('Không thể cập nhật thông tin người dùng');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        try {
            setIsDeleting(true);
            await deleteUser(userId);
            ToastService.success('Xóa người dùng thành công');
            router.push('/admin/users');
        } catch (err) {
            console.error('Error deleting user:', err);
            ToastService.error('Không thể xóa người dùng');
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="space-y-4">
                            <div className="h-32 bg-gray-200 rounded"></div>
                            <div className="space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    if (error) {
        return (
            <AdminLayout>
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            </AdminLayout>
        );
    }

    if (!user) {
        return (
            <AdminLayout>
                <div className="text-center py-12">
                    <p className="text-gray-500">Không tìm thấy thông tin người dùng</p>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => router.back()}
                                className="p-3 hover:bg-white hover:shadow-md rounded-xl transition-all duration-200 bg-white/70 border border-blue-200"
                            >
                                <ArrowLeft className="h-5 w-5 text-blue-600" />
                            </button>
                            <div>
                                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                    Chỉnh sửa thông tin người dùng
                                </h2>
                                <p className="text-sm text-blue-600/70 mt-1">Cập nhật và quản lý thông tin người dùng trong hệ thống</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="inline-flex items-center px-4 py-2.5 rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 transform hover:scale-105"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Xóa người dùng
                        </button>
                    </div>
                </div>

                {/* User Profile Card */}
                <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-lg border border-blue-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-20 relative">
                        <div className="absolute inset-0 bg-black/10"></div>
                        <div className="absolute -bottom-8 left-6">
                            {user.avatarUrl ? (
                                <img
                                    src={getImagesFromUrl(user.avatarUrl)}
                                    alt={user.fullName}
                                    className="h-16 w-16 rounded-full object-cover border-4 border-white shadow-lg"
                                />
                            ) : (
                                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center border-4 border-white shadow-lg">
                                    <span className="text-lg font-bold text-white">
                                        {user.fullName.split(' ').map(n => n[0]).join('')}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="pt-12 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">{user.fullName}</h3>
                                <div className="flex items-center space-x-4 mt-2">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        ID: {userId}
                                    </span>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.isActive
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                        }`}>
                                        {user.isActive ? '● Hoạt động' : '● Đã khóa'}
                                    </span>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                        {user.roleName}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Edit Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800">Thông tin chi tiết</h3>
                        <p className="text-sm text-gray-600 mt-1">Cập nhật các thông tin cần thiết của người dùng</p>
                    </div>
                    <div className="p-6 space-y-8">
                        {/* Email Field */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-2">
                                Địa chỉ Email
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-blue-500" />
                                </div>
                                <input
                                    type="email"
                                    id="email"
                                    {...register('email', {
                                        required: 'Email là bắt buộc',
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: 'Email không hợp lệ'
                                        }
                                    })}
                                    className={`block w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 bg-white/70 ${errors.email ? 'border-red-300 focus:ring-2 focus:ring-red-200 focus:border-red-500' : 'border-blue-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-400'}`}
                                    placeholder="example@email.com"
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-2 text-sm text-red-600 flex items-center">
                                    <span className="w-4 h-4 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs mr-2">!</span>
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        {/* Role Field */}
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
                            <label htmlFor="roleId" className="block text-sm font-semibold text-gray-800 mb-2">
                                Vai trò người dùng
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Shield className="h-5 w-5 text-purple-500" />
                                </div>
                                <select
                                    id="roleId"
                                    {...register('roleId')}
                                    className={`block w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 bg-white/70 appearance-none ${errors.roleId ? 'border-red-300 focus:ring-2 focus:ring-red-200 focus:border-red-500' : 'border-purple-200 focus:ring-2 focus:ring-purple-200 focus:border-purple-400'}`}
                                >
                                    <option value="">Giữ nguyên vai trò hiện tại</option>
                                    <option value="1">👤 User</option>
                                    <option value="2">🛡️ Moderator</option>
                                    <option value="3">👑 Admin</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                    <svg className="h-4 w-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                            <div className="mt-2 flex items-center">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                    Hiện tại: {initialRoleId ? ROLE_NAMES[initialRoleId as keyof typeof ROLE_NAMES] : 'User'}
                                </span>
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-xl border border-orange-200">
                            <label htmlFor="password" className="block text-sm font-semibold text-gray-800 mb-2">
                                Mật khẩu mới
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-orange-500" />
                                </div>
                                <input
                                    type="password"
                                    id="password"
                                    {...register('password', {
                                        minLength: {
                                            value: 6,
                                            message: 'Mật khẩu phải có ít nhất 6 ký tự'
                                        }
                                    })}
                                    className={`block w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 bg-white/70 ${errors.password ? 'border-red-300 focus:ring-2 focus:ring-red-200 focus:border-red-500' : 'border-orange-200 focus:ring-2 focus:ring-orange-200 focus:border-orange-400'}`}
                                    placeholder="Để trống nếu không muốn thay đổi mật khẩu"
                                />
                            </div>
                            {errors.password && (
                                <p className="mt-2 text-sm text-red-600 flex items-center">
                                    <span className="w-4 h-4 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs mr-2">!</span>
                                    {errors.password.message}
                                </p>
                            )}
                            <p className="mt-2 text-xs text-orange-600 flex items-center">
                                <span className="w-4 h-4 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs mr-2">i</span>
                                Chỉ điền nếu muốn thay đổi mật khẩu hiện tại
                            </p>
                        </div>

                        {/* Activation Status Toggle */}
                        <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className={`p-2 rounded-lg ${isActive ? 'bg-green-100' : 'bg-red-100'}`}>
                                        <Power className={`h-5 w-5 ${isActive ? 'text-green-600' : 'text-red-600'}`} />
                                    </div>
                                    <div>
                                        <label htmlFor="isActive" className="text-sm font-semibold text-gray-800 cursor-pointer">
                                            Trạng thái tài khoản
                                        </label>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {isActive ? 'Tài khoản có thể truy cập hệ thống' : 'Tài khoản bị hạn chế truy cập'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <span className={`px-3 py-1.5 text-xs font-semibold rounded-full border-2 transition-all duration-300 ${isActive
                                        ? 'bg-green-50 text-green-700 border-green-200 shadow-green-100 shadow-sm'
                                        : 'bg-red-50 text-red-700 border-red-200 shadow-red-100 shadow-sm'
                                        }`}>
                                        {isActive ? '✓ Hoạt động' : '✕ Đã khóa'}
                                    </span>

                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            id="isActive"
                                            {...register('isActive')}
                                            className="sr-only peer"
                                        />
                                        <label
                                            htmlFor="isActive"
                                            className={`relative flex items-center w-14 h-7 rounded-full cursor-pointer transition-all duration-300 ${isActive
                                                ? 'bg-gradient-to-r from-green-400 to-green-500 shadow-lg shadow-green-200'
                                                : 'bg-gradient-to-r from-gray-300 to-gray-400 shadow-md'
                                                }`}
                                        >
                                            <div
                                                className={`absolute w-5 h-5 rounded-full bg-white shadow-lg transform transition-all duration-300 ease-in-out ${isActive
                                                    ? 'translate-x-7 shadow-green-200'
                                                    : 'translate-x-1 shadow-gray-300'
                                                    }`}
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="px-6 py-6 bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-600">
                                <span className="flex items-center">
                                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                                    Thay đổi sẽ có hiệu lực ngay lập tức
                                </span>
                            </div>
                            <div className="flex space-x-3">
                                <button
                                    type="button"
                                    onClick={() => router.back()}
                                    className="px-6 py-2.5 border-2 border-gray-300 rounded-xl shadow-sm text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-6 py-2.5 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center">
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Đang lưu...
                                        </span>
                                    ) : (
                                        '💾 Lưu thay đổi'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>

                {/* Delete Modal */}
                <DeleteUserModal
                    userId={userId}
                    isOpen={showDeleteConfirm}
                    onClose={() => setShowDeleteConfirm(false)}
                    userName={user?.fullName}
                />
            </div>
        </AdminLayout>
    );
};

export default EditUserPage;

// Role mapping
const ROLE_MAPPING = {
    'User': 1,
    'Moderator': 2,
    'Admin': 3
} as const;

const ROLE_NAMES = {
    1: 'User',
    2: 'Moderator',
    3: 'Admin'
} as const;

interface EditUserPageProps {
    userId: number;
}

interface FormData {
    email: string;
    roleId: string;
    password: string;
    isActive: boolean;
}