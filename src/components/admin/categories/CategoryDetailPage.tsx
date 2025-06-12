"use client";
import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/layout/AdminLayout';
import { ArrowLeft, Calendar, Hash, FileText, Book, Pencil } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ToastService from '@/services/ToastService';
import { getCategoryById } from '@/services/CategoryService';

const CategoryDetailPage: React.FC<CategoryDetailPageProps> = ({ params }) => {
    const router = useRouter();
    const [category, setCategory] = useState<CategoryDetailType | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCategoryDetail = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const response = await getCategoryById(params.id);
                //@ts-ignore
                setCategory(response.data);
            } catch (err) {
                console.error('Error fetching category details:', err);
                setError('Không thể tải thông tin danh mục. Vui lòng thử lại sau.');
                ToastService.error('Không thể tải thông tin danh mục');
            } finally {
                setIsLoading(false);
            }
        };

        if (params.id) {
            fetchCategoryDetail();
        }
    }, [params.id]);

    const handleBack = () => {
        router.back();
    };

    const handleEdit = () => {
        router.push(`/admin/categories/${params.id}/edit`);
    };

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-gray-500">Đang tải thông tin...</div>
                </div>
            </AdminLayout>
        );
    }

    if (error || !category) {
        return (
            <AdminLayout>
                <div className="flex flex-col items-center justify-center min-h-screen">
                    <div className="text-red-500 mb-4">{error || 'Không tìm thấy danh mục'}</div>
                    <button
                        onClick={handleBack}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
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
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={handleBack}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Quay lại
                        </button>
                        <h1 className="text-2xl font-bold text-gray-800">Chi tiết danh mục</h1>
                    </div>
                    <button
                        onClick={handleEdit}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                        <Pencil className="h-4 w-4 mr-2" />
                        Chỉnh sửa
                    </button>
                </div>

                {/* Main Content */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="p-6">
                        {/* Category Name */}
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-gray-900">{category.name}</h2>
                            <div className="mt-2 flex items-center text-sm text-gray-500">
                                <Calendar className="h-4 w-4 mr-1" />
                                Ngày tạo: {new Date(category.createdAt).toLocaleDateString('vi-VN', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </div>
                        </div>

                        {/* Category Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left Column */}
                            <div className="space-y-6">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                        <Hash className="h-4 w-4 mr-2" />
                                        Slug
                                    </div>
                                    <div className="text-sm text-gray-900 font-mono bg-gray-100 p-2 rounded">
                                        {category.slug}
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                        <Book className="h-4 w-4 mr-2" />
                                        Số bài viết
                                    </div>
                                    <div className="text-2xl font-semibold text-blue-600">
                                        {category.countTotalPost}
                                        <span className="text-sm text-gray-500 ml-1">bài viết</span>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                    <FileText className="h-4 w-4 mr-2" />
                                    Mô tả
                                </div>
                                <div className="text-sm text-gray-600">
                                    {category.description || 'Chưa có mô tả'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* TODO: Add related posts section here */}
            </div>
        </AdminLayout>
    );
};

export default CategoryDetailPage;


interface CategoryDetailType {
    id: number;
    name: string;
    slug: string;
    description: string;
    countTotalPost: number;
    createdAt: string;
}

interface CategoryDetailPageProps {
    params: {
        id: string;
    };
}