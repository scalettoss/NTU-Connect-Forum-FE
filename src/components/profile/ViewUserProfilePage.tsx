"use client";
import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Briefcase } from 'lucide-react';
import { getUserInformation } from '@/services/UserService';
import { UserInformationResponseType } from '@/types/UserType';
import { getImagesFromUrl } from '@/helper/GetImagesHelper';
import { Toaster } from 'react-hot-toast';

// Interface for component props
interface ViewUserProfilePageProps {
    userId: number;
}

const ViewUserProfilePage = ({ userId }: ViewUserProfilePageProps) => {
    const [user, setUser] = useState<UserInformationResponseType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await getUserInformation(userId);
                //@ts-ignore
                const userData = response;
                setUser(userData);
            } catch (err: any) {
                console.error("Error fetching user data:", err);
                // Check if this is a 404 error (user not found)
                if (err.response && err.response.status === 404) {
                    setError("Không tìm thấy người dùng.");
                } else {
                    setError("Không thể tải thông tin người dùng. Vui lòng thử lại sau.");
                }
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchUserData();
        }
    }, [userId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    if (error || !user) {
        const isUserNotFound = error && error.includes("Không tìm thấy người dùng");

        return (
            <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 px-4">
                <div className={`text-center p-8 rounded-xl shadow-md border ${isUserNotFound ? 'bg-orange-50 border-orange-200' : 'bg-red-50 border-red-200'} max-w-md w-full`}>
                    <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${isUserNotFound ? 'bg-orange-100 text-orange-500' : 'bg-red-100 text-red-500'}`}>
                        {isUserNotFound ? (
                            <User size={32} />
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        )}
                    </div>
                    <h3 className={`text-xl font-bold mb-2 ${isUserNotFound ? 'text-orange-700' : 'text-red-700'}`}>
                        {isUserNotFound ? 'Người dùng không tồn tại' : 'Lỗi khi tải dữ liệu'}
                    </h3>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <div className="flex justify-center gap-3">
                        <button
                            onClick={() => window.history.back()}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                        >
                            Quay lại
                        </button>
                        <button
                            onClick={() => window.location.href = '/'}
                            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
                        >
                            Trang chủ
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Check if the profile is set to private
    if (!user.isProfilePublic) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 px-4">
                <div className="text-center p-8 rounded-xl shadow-md border bg-blue-50 border-blue-200 max-w-md w-full">
                    <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 bg-blue-100 text-blue-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-blue-700">
                        Hồ sơ riêng tư
                    </h3>
                    <p className="text-gray-600 mb-6">
                        Người dùng này đã chọn không công khai thông tin cá nhân của họ.
                    </p>
                    <div className="flex justify-center gap-3">
                        <button
                            onClick={() => window.history.back()}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                        >
                            Quay lại
                        </button>
                        <button
                            onClick={() => window.location.href = '/'}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                        >
                            Trang chủ
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // If user profile is not public and doesn't have required data, show limited view
    if (!user.isProfilePublic && (!user.phoneNumber && !user.address && !user.dateOfBirth && !user.bio)) {
        return (
            <div className="min-h-screen w-full bg-gradient-to-br from-orange-100 via-white to-blue-100">
                <Toaster />
                <div className="w-full max-w-7xl mx-auto p-4 md:p-8">
                    <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100 w-full">
                        {/* Header with gradient */}
                        <div className="relative h-48 md:h-64 bg-gradient-to-r from-orange-600 via-orange-500 to-orange-700">
                            {/* Decorative elements */}
                            <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20">
                                <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-white"></div>
                                <div className="absolute top-20 right-20 w-32 h-32 rounded-full bg-white"></div>
                                <div className="absolute bottom-10 left-1/4 w-16 h-16 rounded-full bg-white"></div>
                                <div className="absolute -top-5 right-1/3 w-24 h-24 rounded-full bg-white"></div>
                                <div className="absolute bottom-5 right-1/4 w-12 h-12 rounded-full bg-white"></div>
                            </div>

                            <div className="absolute bottom-0 left-0 w-full transform translate-y-1/2 flex justify-center">
                                <div className="relative">
                                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white overflow-hidden bg-white shadow-xl">
                                        {user.avatarUrl ? (
                                            <img
                                                src={getImagesFromUrl(user.avatarUrl)}
                                                alt={user.fullName}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                                                <User size={40} className="text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Profile Content */}
                        <div className="pt-16 md:pt-20 px-4 md:px-8 pb-8">
                            <div className="text-center mb-6">
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{user.fullName}</h1>
                                {user.roleName && (
                                    <div className="mt-2 flex justify-center">
                                        <div className={`
                                            px-4 py-1 rounded-full text-sm font-medium shadow-sm
                                            ${user.roleName === 'admin' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                                                user.roleName === 'moderator' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                                                    'bg-green-100 text-green-800 border border-green-200'}
                                        `}>
                                            <div className="flex items-center">
                                                <span className={`
                                                    h-2 w-2 rounded-full mr-2
                                                    ${user.roleName === 'admin' ? 'bg-purple-500' :
                                                        user.roleName === 'moderator' ? 'bg-blue-500' :
                                                            'bg-green-500'}
                                                `}></span>
                                                {user.roleName === 'admin' ? 'Quản trị viên' :
                                                    user.roleName === 'moderator' ? 'Kiểm duyệt viên' :
                                                        'Người dùng'}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="text-center mt-10 p-6 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="text-gray-500 mb-2">
                                    <Mail className="inline-block mr-2 text-orange-500" size={18} />
                                    <span>{user.email}</span>
                                </div>
                                <p className="mt-6 text-gray-600">
                                    Người dùng đã chọn không công khai thông tin cá nhân.
                                </p>
                            </div>

                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4 bg-gradient-to-br from-white to-blue-50 p-5 rounded-xl shadow-md border border-blue-100">
                                    <h2 className="text-xl font-semibold text-gray-800 border-b border-blue-100 pb-2">Thống kê hoạt động</h2>

                                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-50">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="text-center bg-orange-50 rounded-lg p-3 shadow-sm border border-orange-100">
                                                <p className="text-2xl font-bold text-orange-600">{user.postCount || 0}</p>
                                                <p className="text-sm text-gray-600">Bài viết</p>
                                            </div>
                                            <div className="text-center bg-blue-50 rounded-lg p-3 shadow-sm border border-blue-100">
                                                <p className="text-2xl font-bold text-blue-600">{user.commentCount || 0}</p>
                                                <p className="text-sm text-gray-600">Bình luận</p>
                                            </div>
                                            <div className="text-center bg-pink-50 rounded-lg p-3 shadow-sm border border-pink-100">
                                                <p className="text-2xl font-bold text-pink-600">{user.likeCount || 0}</p>
                                                <p className="text-sm text-gray-600">Lượt thích</p>
                                            </div>
                                            <div className="text-center bg-purple-50 rounded-lg p-3 shadow-sm border border-purple-100">
                                                <p className="text-2xl font-bold text-purple-600">{0}</p>
                                                <p className="text-sm text-gray-600">Lượt xem</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-orange-100 via-white to-blue-100">
            <Toaster />
            <div className="w-full max-w-7xl mx-auto p-4 md:p-8">
                <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100 w-full">
                    {/* Header with gradient */}
                    <div className="relative h-48 md:h-64 bg-gradient-to-r from-orange-600 via-orange-500 to-orange-700">
                        {/* Decorative elements */}
                        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20">
                            <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-white"></div>
                            <div className="absolute top-20 right-20 w-32 h-32 rounded-full bg-white"></div>
                            <div className="absolute bottom-10 left-1/4 w-16 h-16 rounded-full bg-white"></div>
                            <div className="absolute -top-5 right-1/3 w-24 h-24 rounded-full bg-white"></div>
                            <div className="absolute bottom-5 right-1/4 w-12 h-12 rounded-full bg-white"></div>
                        </div>

                        <div className="absolute bottom-0 left-0 w-full transform translate-y-1/2 flex justify-center">
                            <div className="relative">
                                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white overflow-hidden bg-white shadow-xl">
                                    {user.avatarUrl ? (
                                        <img
                                            src={getImagesFromUrl(user.avatarUrl)}
                                            alt={user.fullName}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                                            <User size={40} className="text-gray-400" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Profile Content */}
                    <div className="pt-16 md:pt-20 px-4 md:px-8 pb-8">
                        <div className="text-center mb-6">
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{user.fullName}</h1>
                            {user.roleName && (
                                <div className="mt-2 flex justify-center">
                                    <div className={`
                                        px-4 py-1 rounded-full text-sm font-medium shadow-sm
                                        ${user.roleName === 'admin' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                                            user.roleName === 'moderator' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                                                'bg-green-100 text-green-800 border border-green-200'}
                                    `}>
                                        <div className="flex items-center">
                                            <span className={`
                                                h-2 w-2 rounded-full mr-2
                                                ${user.roleName === 'admin' ? 'bg-purple-500' :
                                                    user.roleName === 'moderator' ? 'bg-blue-500' :
                                                        'bg-green-500'}
                                            `}></span>
                                            {user.roleName === 'admin' ? 'Quản trị viên' :
                                                user.roleName === 'moderator' ? 'Kiểm duyệt viên' :
                                                    'Người dùng'}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4 bg-gradient-to-br from-white to-orange-50 p-5 rounded-xl shadow-md border border-orange-100">
                                <h2 className="text-xl font-semibold text-gray-800 border-b border-orange-100 pb-2">Thông tin cá nhân</h2>

                                <div className="flex items-start">
                                    <Mail className="w-5 h-5 text-orange-500 mr-3 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p className="text-gray-800">{user.email || ''}</p>
                                    </div>
                                </div>

                                {user.isProfilePublic && (
                                    <>
                                        <div className="flex items-start">
                                            <Phone className="w-5 h-5 text-orange-500 mr-3 mt-0.5" />
                                            <div>
                                                <p className="text-sm text-gray-500">Số điện thoại</p>
                                                <p className="text-gray-800">{user.phoneNumber || 'Chưa cập nhật'}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start">
                                            <MapPin className="w-5 h-5 text-orange-500 mr-3 mt-0.5" />
                                            <div>
                                                <p className="text-sm text-gray-500">Địa chỉ</p>
                                                <p className="text-gray-800">{user.address || 'Chưa cập nhật'}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start">
                                            <Calendar className="w-5 h-5 text-orange-500 mr-3 mt-0.5" />
                                            <div>
                                                <p className="text-sm text-gray-500">Ngày sinh</p>
                                                <p className="text-gray-800">
                                                    {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Chưa cập nhật'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start">
                                            <User className="w-5 h-5 text-orange-500 mr-3 mt-0.5" />
                                            <div>
                                                <p className="text-sm text-gray-500">Giới tính</p>
                                                <p className="text-gray-800">{user.gender || 'Chưa cập nhật'}</p>
                                            </div>
                                        </div>

                                        {user.bio && (
                                            <div className="pt-3 mt-3 border-t border-orange-100">
                                                <h3 className="text-md font-semibold text-gray-700 mb-2">Giới thiệu</h3>
                                                <p className="text-gray-600 bg-white p-4 rounded-lg shadow-sm border border-gray-50">
                                                    {user.bio || 'Chưa có thông tin giới thiệu.'}
                                                </p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            <div className="space-y-4 bg-gradient-to-br from-white to-blue-50 p-5 rounded-xl shadow-md border border-blue-100">
                                <h2 className="text-xl font-semibold text-gray-800 border-b border-blue-100 pb-2">Thống kê hoạt động</h2>

                                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-50">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="text-center bg-orange-50 rounded-lg p-3 shadow-sm border border-orange-100">
                                            <p className="text-2xl font-bold text-orange-600">{user.postCount || 0}</p>
                                            <p className="text-sm text-gray-600">Bài viết</p>
                                        </div>
                                        <div className="text-center bg-blue-50 rounded-lg p-3 shadow-sm border border-blue-100">
                                            <p className="text-2xl font-bold text-blue-600">{user.commentCount || 0}</p>
                                            <p className="text-sm text-gray-600">Bình luận</p>
                                        </div>
                                        <div className="text-center bg-pink-50 rounded-lg p-3 shadow-sm border border-pink-100">
                                            <p className="text-2xl font-bold text-pink-600">{user.likeCount || 0}</p>
                                            <p className="text-sm text-gray-600">Lượt thích</p>
                                        </div>
                                        <div className="text-center bg-purple-50 rounded-lg p-3 shadow-sm border border-purple-100">
                                            <p className="text-2xl font-bold text-purple-600">{0}</p>
                                            <p className="text-sm text-gray-600">Lượt xem</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-50">
                                    <h3 className="text-md font-semibold text-gray-700 mb-3">Thành viên từ</h3>
                                    <div className="flex items-center">
                                        <Calendar className="w-5 h-5 text-blue-500 mr-2" />
                                        <p className="text-gray-600">
                                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Không có thông tin'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewUserProfilePage; 