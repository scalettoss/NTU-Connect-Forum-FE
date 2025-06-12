"use client";
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import AdminLayout from '@/components/admin/layout/AdminLayout';
import { ArrowLeft, FileText, Tag, Save, X, AlertCircle } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import ToastService from '@/services/ToastService';
import { PostDetailResponseType, UpdatePostByAdminRequestType } from '@/types/PostType';
import { getPostDetailByAdmin, updatePostByAdmin } from '@/services/PostService';
import { getImagesFromUrl } from '@/helper/GetImagesHelper';

interface EditPostFormData {
    title: string;
    content: string;
    status: 'pending' | 'approved' | 'rejected';
}

const STATUS_OPTIONS = [
    { value: 'pending', label: 'Chờ duyệt', color: 'yellow', icon: '⏳' },
    { value: 'approved', label: 'Chấp nhận', color: 'green', icon: '✅' },
    { value: 'rejected', label: 'Từ chối', color: 'red', icon: '❌' }
] as const;

const EditPostPage: React.FC = () => {
    const router = useRouter();
    const params = useParams();
    const postId = Number(params.id);

    const [post, setPost] = useState<PostDetailResponseType | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isDirty }
    } = useForm<EditPostFormData>({
        defaultValues: {
            title: '',
            content: '',
            status: 'pending'
        }
    });

    const currentStatus = watch('status');

    useEffect(() => {
        const fetchPostDetails = async () => {
            try {
                setIsLoading(true);
                const response = await getPostDetailByAdmin(postId);
                setPost(response);

                setValue('title', response.title);
                setValue('content', response.content);
                setValue('status', response.status as any);
            } catch (err) {
                console.error('Error fetching post details:', err);
                setError('Không thể tải thông tin bài viết. Vui lòng thử lại sau.');
                ToastService.error('Không thể tải thông tin bài viết');
            } finally {
                setIsLoading(false);
            }
        };

        if (postId) {
            fetchPostDetails();
        }
    }, [postId, setValue]);

    const onSubmit = async (data: EditPostFormData) => {
        try {
            setIsSubmitting(true);

            // Prepare request data
            const requestData: UpdatePostByAdminRequestType = {
                title: data.title,
                content: data.content,
                status: data.status
            };

            // Call API to update post
            await updatePostByAdmin(postId, requestData);

            ToastService.success('Cập nhật bài viết thành công');
            router.push('/admin/posts');
        } catch (err) {
            console.error('Error updating post:', err);
            ToastService.error('Không thể cập nhật bài viết. Vui lòng thử lại sau.');
        } finally {
            setIsSubmitting(false);
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

    if (error || !post) {
        return (
            <AdminLayout>
                <div className="flex flex-col justify-center items-center min-h-screen">
                    <div className="text-red-500 mb-4">{error || "Không tìm thấy bài viết."}</div>
                    <button
                        onClick={() => router.back()}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                        Quay lại
                    </button>
                </div>
            </AdminLayout>
        );
    }

    const currentStatusOption = STATUS_OPTIONS.find(option => option.value === currentStatus);

    return (
        <AdminLayout>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 shadow-sm mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                className="p-3 hover:bg-white hover:shadow-md rounded-xl transition-all duration-200 bg-white/70 border border-blue-200"
                            >
                                <ArrowLeft className="h-5 w-5 text-blue-600" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                    Chỉnh sửa bài viết
                                </h1>
                                <p className="text-sm text-blue-600/70 mt-1">Cập nhật thông tin và trạng thái bài viết</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            {isDirty && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    Có thay đổi chưa lưu
                                </span>
                            )}
                            {currentStatusOption && (
                                <span className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 shadow-sm
                                        ${currentStatusOption.color === 'yellow' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                        currentStatusOption.color === 'green' ? 'bg-green-100 text-green-800 border-green-200' :
                                            'bg-red-100 text-red-800 border-red-200'}`}>
                                    {currentStatusOption.icon} {currentStatusOption.label}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Post Preview Card */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-8">
                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800">Thông tin bài viết gốc</h3>
                        <p className="text-sm text-gray-600 mt-1">Xem thông tin hiện tại của bài viết</p>
                    </div>
                    <div className="p-6">
                        <div className="flex items-start space-x-4">
                            <img
                                src={getImagesFromUrl(post.avatarUrl)}
                                alt={post.fullName}
                                className="h-12 w-12 rounded-full object-cover border-2 border-blue-200"
                            />
                            <div className="flex-1">
                                <h4 className="text-lg font-bold text-gray-900">{post.title}</h4>
                                <p className="text-sm text-gray-600 mt-1">Tác giả: {post.fullName}</p>
                                <p className="text-sm text-gray-500">Ngày tạo: {new Date(post.createdAt).toLocaleDateString('vi-VN')}</p>
                                <span className="inline-block mt-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                    {post.categoryName}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Edit Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800">Chỉnh sửa thông tin</h3>
                        <p className="text-sm text-gray-600 mt-1">Cập nhật tiêu đề, nội dung và trạng thái bài viết</p>
                    </div>

                    <div className="p-6 space-y-8">
                        {/* Title Field */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                            <label htmlFor="title" className="block text-sm font-semibold text-gray-800 mb-2">
                                Tiêu đề bài viết
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <FileText className="h-5 w-5 text-blue-500" />
                                </div>
                                <input
                                    type="text"
                                    id="title"
                                    {...register('title', {
                                        required: 'Tiêu đề là bắt buộc',
                                        minLength: {
                                            value: 5,
                                            message: 'Tiêu đề phải có ít nhất 5 ký tự'
                                        },
                                        maxLength: {
                                            value: 200,
                                            message: 'Tiêu đề không được vượt quá 200 ký tự'
                                        }
                                    })}
                                    className={`block w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 bg-white/70 ${errors.title ? 'border-red-300 focus:ring-2 focus:ring-red-200 focus:border-red-500' : 'border-blue-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-400'
                                        }`}
                                    placeholder="Nhập tiêu đề bài viết..."
                                />
                            </div>
                            {errors.title && (
                                <p className="mt-2 text-sm text-red-600 flex items-center">
                                    <span className="w-4 h-4 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs mr-2">!</span>
                                    {errors.title.message}
                                </p>
                            )}
                        </div>

                        {/* Content Field */}
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
                            <label htmlFor="content" className="block text-sm font-semibold text-gray-800 mb-2">
                                Nội dung bài viết
                            </label>
                            <div className="relative">
                                <textarea
                                    id="content"
                                    rows={8}
                                    {...register('content', {
                                        required: 'Nội dung là bắt buộc',
                                        minLength: {
                                            value: 10,
                                            message: 'Nội dung phải có ít nhất 10 ký tự'
                                        }
                                    })}
                                    className={`block w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 bg-white/70 resize-none ${errors.content ? 'border-red-300 focus:ring-2 focus:ring-red-200 focus:border-red-500' : 'border-purple-200 focus:ring-2 focus:ring-purple-200 focus:border-purple-400'
                                        }`}
                                    placeholder="Nhập nội dung bài viết..."
                                />
                            </div>
                            {errors.content && (
                                <p className="mt-2 text-sm text-red-600 flex items-center">
                                    <span className="w-4 h-4 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs mr-2">!</span>
                                    {errors.content.message}
                                </p>
                            )}
                        </div>

                        {/* Status Field */}
                        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-xl border border-orange-200">
                            <label htmlFor="status" className="block text-sm font-semibold text-gray-800 mb-2">
                                Trạng thái bài viết
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Tag className="h-5 w-5 text-orange-500" />
                                </div>
                                <select
                                    id="status"
                                    {...register('status', { required: 'Trạng thái là bắt buộc' })}
                                    className={`block w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 bg-white/70 appearance-none ${errors.status ? 'border-red-300 focus:ring-2 focus:ring-red-200 focus:border-red-500' : 'border-orange-200 focus:ring-2 focus:ring-orange-200 focus:border-orange-400'
                                        }`}
                                >
                                    {STATUS_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.icon} {option.label}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                    <svg className="h-4 w-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                            {errors.status && (
                                <p className="mt-2 text-sm text-red-600 flex items-center">
                                    <span className="w-4 h-4 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs mr-2">!</span>
                                    {errors.status.message}
                                </p>
                            )}
                            <p className="mt-2 text-xs text-orange-600 flex items-center">
                                <span className="w-4 h-4 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs mr-2">i</span>
                                Thay đổi trạng thái sẽ ảnh hưởng đến việc hiển thị bài viết
                            </p>
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
                                    onClick={() => router.back()}
                                    type="button"
                                    className="px-6 py-2.5 border-2 border-gray-300 rounded-xl shadow-sm text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
                                >
                                    <X className="h-4 w-4 mr-2 inline" />
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
                                        <span className="flex items-center">
                                            <Save className="h-4 w-4 mr-2" />
                                            Lưu thay đổi
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
};

export default EditPostPage; 