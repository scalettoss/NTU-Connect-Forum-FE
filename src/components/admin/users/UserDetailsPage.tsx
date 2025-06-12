"use client";
import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/layout/AdminLayout';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, User, Shield } from 'lucide-react';
import { getUserInformation } from '@/services/UserService';
import { UserInformationResponseType } from '@/types/UserType';
import { getImagesFromUrl } from '@/helper/GetImagesHelper';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface UserDetailsPageProps {
    userId: number;
}

const UserDetailsPage: React.FC<UserDetailsPageProps> = ({ userId }) => {
    const router = useRouter();
    const [user, setUser] = useState<UserInformationResponseType | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                setIsLoading(true);
                const response = await getUserInformation(userId);
                setUser(response);
            } catch (err) {
                console.error('Error fetching user details:', err);
                setError('Không thể tải thông tin người dùng. Vui lòng thử lại sau.');
                toast.error('Không thể tải thông tin người dùng');
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserDetails();
    }, [userId]);

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
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <ArrowLeft className="h-6 w-6 text-gray-600" />
                        </button>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Thông tin chi tiết người dùng</h2>
                            <p className="text-sm text-gray-600">Xem thông tin chi tiết của người dùng</p>
                        </div>
                    </div>
                </div>

                {/* User Profile Card */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6">
                        <div className="flex items-start space-x-6">
                            {/* Avatar */}
                            <div className="flex-shrink-0">
                                {user.avatarUrl ? (
                                    <img
                                        src={getImagesFromUrl(user.avatarUrl)}
                                        alt={user.fullName}
                                        className="h-24 w-24 rounded-full object-cover border-4 border-white shadow"
                                    />
                                ) : (
                                    <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center border-4 border-white shadow">
                                        <span className="text-2xl font-medium text-blue-600">
                                            {user.fullName.split(' ').map(n => n[0]).join('')}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* User Info */}
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">{user.fullName}</h3>
                                        <div className="mt-1 flex items-center space-x-2">
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium
                                                ${user.roleName === 'Admin' ? 'bg-purple-100 text-purple-800' :
                                                    user.roleName === 'Moderator' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-green-100 text-green-800'}`}>
                                                {user.roleName}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                ID: {userId}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Info */}
                                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center space-x-3">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                        <span className="text-gray-600">{user.email}</span>
                                    </div>
                                    {user.phoneNumber && (
                                        <div className="flex items-center space-x-3">
                                            <Phone className="h-5 w-5 text-gray-400" />
                                            <span className="text-gray-600">{user.phoneNumber}</span>
                                        </div>
                                    )}
                                    {user.address && (
                                        <div className="flex items-center space-x-3">
                                            <MapPin className="h-5 w-5 text-gray-400" />
                                            <span className="text-gray-600">{user.address}</span>
                                        </div>
                                    )}
                                    {user.dateOfBirth && (
                                        <div className="flex items-center space-x-3">
                                            <Calendar className="h-5 w-5 text-gray-400" />
                                            <span className="text-gray-600">
                                                {new Date(user.dateOfBirth).toLocaleDateString('vi-VN')}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Statistics Card */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <User className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Bài viết</p>
                                <p className="text-2xl font-bold text-gray-900">{user.postCount}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <Shield className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Bình luận</p>
                                <p className="text-2xl font-bold text-gray-900">{user.commentCount}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <Shield className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Lượt thích</p>
                                <p className="text-2xl font-bold text-gray-900">{user.likeCount}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Info */}
                {user.bio && (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h4 className="text-lg font-medium text-gray-900 mb-4">Giới thiệu</h4>
                        <p className="text-gray-600 whitespace-pre-wrap">{user.bio}</p>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default UserDetailsPage; 