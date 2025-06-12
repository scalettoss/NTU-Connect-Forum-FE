"use client";
import React, { useEffect, useState } from 'react';
import { Users, FileText, Tag, Bell, AlertTriangle, MessageSquare, FileImage } from 'lucide-react';
import AdminLayout from '@/components/admin/layout/AdminLayout';
import { getCountAllStatistic, getLastestActivity } from '@/services/StatisticService';
import { CountAllStatisticType, StatisticsResponseType } from '@/types/StatisticType';

const AdminDashboardPage: React.FC = () => {
    const [statistics, setStatistics] = useState<CountAllStatisticType | null>(null);
    const [latestActivities, setLatestActivities] = useState<StatisticsResponseType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [statsResponse, activitiesResponse] = await Promise.all([
                    getCountAllStatistic(),
                    getLastestActivity()
                ]);
                setStatistics(statsResponse);
                setLatestActivities(activitiesResponse);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Loading state for dashboard cards
    const renderLoadingCard = (icon: React.ReactNode, title: string) => (
        <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
                <div className="flex items-center">
                    <div className="flex-shrink-0 bg-gray-200 rounded-md p-3 animate-pulse">
                        {icon}
                    </div>
                    <div className="ml-5 w-0 flex-1">
                        <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
                            <dd className="flex items-baseline">
                                <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                            </dd>
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <AdminLayout>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Chào mừng đến với Trang quản trị NTU Connect</h2>
                <p className="mt-1 text-sm text-gray-600">Tổng quan về hệ thống</p>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                    {error}
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {isLoading ? (
                    <>
                        {renderLoadingCard(<Users className="h-6 w-6 text-gray-400" />, "Tổng người dùng")}
                        {renderLoadingCard(<FileText className="h-6 w-6 text-gray-400" />, "Tổng bài viết")}
                        {renderLoadingCard(<Tag className="h-6 w-6 text-gray-400" />, "Danh mục")}
                        {renderLoadingCard(<AlertTriangle className="h-6 w-6 text-gray-400" />, "Báo cáo lừa đảo")}
                        {renderLoadingCard(<MessageSquare className="h-6 w-6 text-gray-400" />, "Bình luận")}
                        {renderLoadingCard(<FileImage className="h-6 w-6 text-gray-400" />, "Tệp tải lên")}
                    </>
                ) : (
                    <>
                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                                        <Users className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">Tổng người dùng</dt>
                                            <dd className="flex items-baseline">
                                                <div className="text-2xl font-semibold text-gray-900">
                                                    {statistics?.totalUsers?.toLocaleString() || 0}
                                                </div>
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                                        <FileText className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">Tổng bài viết</dt>
                                            <dd className="flex items-baseline">
                                                <div className="text-2xl font-semibold text-gray-900">
                                                    {statistics?.totalPosts?.toLocaleString() || 0}
                                                </div>
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                                        <Tag className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">Danh mục</dt>
                                            <dd className="flex items-baseline">
                                                <div className="text-2xl font-semibold text-gray-900">
                                                    {statistics?.totalCategories?.toLocaleString() || 0}
                                                </div>
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                                        <AlertTriangle className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">Báo cáo lừa đảo</dt>
                                            <dd className="flex items-baseline">
                                                <div className="text-2xl font-semibold text-gray-900">
                                                    {statistics?.totalReports?.toLocaleString() || 0}
                                                </div>
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                                        <MessageSquare className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">Bình luận</dt>
                                            <dd className="flex items-baseline">
                                                <div className="text-2xl font-semibold text-gray-900">
                                                    {statistics?.totalComments?.toLocaleString() || 0}
                                                </div>
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                                        <FileImage className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">Tệp tải lên</dt>
                                            <dd className="flex items-baseline">
                                                <div className="text-2xl font-semibold text-gray-900">
                                                    {statistics?.totalUploadFiles?.toLocaleString() || 0}
                                                </div>
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Recent Activities */}
            <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Hoạt động gần đây</h3>
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <ul className="divide-y divide-gray-200">
                        {isLoading ? (
                            // Loading state for activities
                            Array(3).fill(0).map((_, index) => (
                                <li key={index} className="p-4">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex-shrink-0">
                                            <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                                            <div className="h-3 bg-gray-200 rounded w-1/2 mt-2 animate-pulse"></div>
                                        </div>
                                        <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
                                    </div>
                                </li>
                            ))
                        ) : latestActivities.length > 0 ? (
                            latestActivities.map((activity, index) => (
                                <li key={index} className="p-4 hover:bg-gray-50">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex-shrink-0">
                                            <span className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                                <Users className="h-4 w-4 text-blue-600" />
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {activity.fullName}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {activity.description}
                                            </p>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {new Date(activity.createdAt).toLocaleDateString('vi-VN', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <li className="p-4 text-center text-gray-500">
                                Không có hoạt động nào gần đây
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboardPage; 