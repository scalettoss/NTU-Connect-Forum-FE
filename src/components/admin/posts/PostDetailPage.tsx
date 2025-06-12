"use client"
import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/layout/AdminLayout';
import { getPostDetailByAdmin } from '@/services/PostService';
import { useParams, useRouter } from 'next/navigation';
import ToastService from '@/services/ToastService';
import { ArrowLeft, Calendar, MessageCircle, ThumbsUp, User, Edit } from 'lucide-react';
import { PostDetailResponseType } from '@/types/PostType';
import { getImagesFromUrl } from '@/helper/GetImagesHelper';

const STATUS_STYLES = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    approved: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
} as const;

const STATUS_LABELS = {
    pending: 'Chờ duyệt',
    approved: 'Đã duyệt',
    rejected: 'Từ chối',
} as const;

const PostDetailPage: React.FC = () => {
    const [post, setPost] = useState<PostDetailResponseType | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const params = useParams();
    const router = useRouter();
    const postId = Number(params.id);

    useEffect(() => {
        const fetchPostDetail = async () => {
            try {
                setIsLoading(true);
                const response = await getPostDetailByAdmin(postId);
                setPost(response);
            } catch (error) {
                console.error('Error fetching post details:', error);
                ToastService.error('Không thể tải thông tin bài viết');
            } finally {
                setIsLoading(false);
            }
        };

        if (postId) {
            fetchPostDetail();
        }
    }, [postId]);

    const handleBack = () => {
        router.back();
    };

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </AdminLayout>
        );
    }

    if (!post) {
        return (
            <AdminLayout>
                <div className="text-center py-12">
                    <h2 className="text-2xl font-semibold text-gray-900">Không tìm thấy bài viết</h2>
                    <button
                        onClick={handleBack}
                        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Quay lại
                    </button>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 shadow-sm mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={handleBack}
                                className="p-3 hover:bg-white hover:shadow-md rounded-xl transition-all duration-200 bg-white/70 border border-blue-200"
                            >
                                <ArrowLeft className="h-5 w-5 text-blue-600" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                    Chi tiết bài viết
                                </h1>
                                <p className="text-sm text-blue-600/70 mt-1">Xem và quản lý thông tin bài viết</p>
                            </div>
                        </div>
                        <span className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 ${STATUS_STYLES[post.status as keyof typeof STATUS_STYLES]} shadow-sm`}>
                            {STATUS_LABELS[post.status as keyof typeof STATUS_LABELS]}
                        </span>
                    </div>
                </div>

                {/* Post Content Card */}
                <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden mb-8">
                    {/* Post Header */}
                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">{post.title}</h2>

                        {/* Author & Date Info */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-6 text-sm text-gray-600">
                                <div className="flex items-center bg-white px-3 py-1.5 rounded-lg shadow-sm">
                                    <User className="h-4 w-4 mr-2 text-blue-500" />
                                    <span className="font-medium">{post.fullName}</span>
                                </div>
                                <div className="flex items-center bg-white px-3 py-1.5 rounded-lg shadow-sm">
                                    <Calendar className="h-4 w-4 mr-2 text-green-500" />
                                    <span>{new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                                </div>
                            </div>

                            {/* Category Badge */}
                            <span className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-md">
                                {post.categoryName}
                            </span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <div className="prose max-w-none bg-gradient-to-r from-blue-50/30 to-indigo-50/30 p-4 rounded-xl border border-blue-100">
                            <div dangerouslySetInnerHTML={{ __html: post.content }} />
                        </div>

                        {/* Files */}
                        {post.fileUrls && post.fileUrls.length > 0 && (
                            <div className="mt-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                    Hình ảnh đính kèm ({post.fileUrls.length})
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {post.fileUrls.map((url, index) => (
                                        <div key={index} className="relative aspect-video group">
                                            <img
                                                src={getImagesFromUrl(url)}
                                                alt={`Post image ${index + 1}`}
                                                className="rounded-xl object-cover w-full h-full shadow-lg border border-gray-200 group-hover:shadow-xl transition-all duration-200"
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-200 rounded-xl"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Scam Warning/Safety Notice */}
                    <div className="px-6 pb-6">
                        {post.isScam ? (
                            <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-xl shadow-lg">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 p-2 bg-red-100 rounded-full">
                                        <svg className="h-6 w-6 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-bold text-red-800 flex items-center">
                                            🚨 Cảnh báo lừa đảo
                                        </h3>
                                        <div className="mt-2 text-sm text-red-700">
                                            <p className="font-medium">Bài viết này có dấu hiệu lừa đảo với độ tin cậy {(post.confidenceScore * 100).toFixed(1)}%</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl shadow-lg">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 p-2 bg-green-100 rounded-full">
                                        <svg className="h-6 w-6 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-bold text-green-800 flex items-center">
                                            ✅ Bài viết an toàn
                                        </h3>
                                        <div className="mt-2 text-sm text-green-700">
                                            <p className="font-medium">Bài viết này không có dấu hiệu lừa đảo</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action buttons */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            <span className="flex items-center">
                                <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                                Quản lý và chỉnh sửa bài viết
                            </span>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => router.push(`/admin/posts/${post.postId}/edit`)}
                                className="inline-flex items-center px-6 py-2.5 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105"
                            >
                                <Edit className="h-4 w-4 mr-2" />
                                Chỉnh sửa bài viết
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default PostDetailPage; 