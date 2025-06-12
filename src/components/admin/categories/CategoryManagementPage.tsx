"use client";
import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/layout/AdminLayout';
import { Search, Filter, Plus, Download, Eye, Pencil, Trash2 } from 'lucide-react';
import { PaginationRequestType, PaginationResponseType } from '@/types/PaginationType';
import ToastService from '@/services/ToastService';
import AddCategoryModal from './AddCategoryModal';
import { getAllCategoryByAdmin, deleteCategory } from '@/services/CategoryService';
import { useRouter } from 'next/navigation';
import UpdateCategoryModal from './UpdateCategoryModal';
import DeleteCategoryModal from './DeleteCategoryModal';

const CategoryManagementPage: React.FC = () => {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState(DEFAULT_SEARCH_VALUES.searchQuery);
    const [categories, setCategories] = useState<CategoryType[]>([]);
    const [pagination, setPagination] = useState<PaginationResponseType<CategoryType> | null>(null);
    const [currentPage, setCurrentPage] = useState(DEFAULT_SEARCH_VALUES.currentPage);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [allCategories, setAllCategories] = useState<CategoryType[]>([]);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const fetchCategories = async (page: number) => {
        try {
            setIsLoading(true);
            setError(null);

            const paginationRequest: PaginationRequestType = {
                PageNumber: page,
                PageSize: DEFAULT_SEARCH_VALUES.pageSize
            };

            const response = await getAllCategoryByAdmin(paginationRequest);
            setAllCategories(response.items);

            const filteredCategories = filterCategories(response.items, searchQuery);
            setCategories(filteredCategories);

            setPagination({
                ...response,
                items: filteredCategories,
                totalCount: filteredCategories.length,
                totalPages: Math.ceil(filteredCategories.length / DEFAULT_SEARCH_VALUES.pageSize),
                hasNext: page < Math.ceil(filteredCategories.length / DEFAULT_SEARCH_VALUES.pageSize),
                hasPrevious: page > 1
            });
        } catch (err) {
            console.error('Error fetching categories:', err);
            setError('Không thể tải danh sách danh mục. Vui lòng thử lại sau.');
            ToastService.error('Không thể tải danh sách danh mục');
        } finally {
            setIsLoading(false);
        }
    };

    // Filter categories based on search query
    const filterCategories = (categories: CategoryType[], query: string) => {
        if (!query.trim()) return categories;

        const normalizedQuery = query.toLowerCase().trim();
        return categories.filter(category =>
            category.name.toLowerCase().includes(normalizedQuery)
        );
    };

    // Handle search input change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);

        // Filter the categories based on the new search query
        const filteredCategories = filterCategories(allCategories, query);
        setCategories(filteredCategories);

        // Reset to first page when searching
        setCurrentPage(1);

        // Update pagination
        setPagination(prev => prev ? {
            ...prev,
            items: filteredCategories,
            totalCount: filteredCategories.length,
            totalPages: Math.ceil(filteredCategories.length / DEFAULT_SEARCH_VALUES.pageSize),
            currentPage: 1,
            hasNext: filteredCategories.length > DEFAULT_SEARCH_VALUES.pageSize,
            hasPrevious: false
        } : null);
    };

    // Reset search
    const handleResetSearch = () => {
        setSearchQuery('');
        setCategories(allCategories);
        setCurrentPage(1);
        setPagination(prev => prev ? {
            ...prev,
            items: allCategories,
            totalCount: allCategories.length,
            totalPages: Math.ceil(allCategories.length / DEFAULT_SEARCH_VALUES.pageSize),
            currentPage: 1,
            hasNext: allCategories.length > DEFAULT_SEARCH_VALUES.pageSize,
            hasPrevious: false
        } : null);
    };

    useEffect(() => {
        fetchCategories(currentPage);
    }, [currentPage]);

    const handlePageChange = (page: number) => {
        if (page !== currentPage) {
            setCurrentPage(page);
        }
    };

    const handleViewCategory = (categoryId: number) => {
        router.push(`/admin/categories/${categoryId}`);
    };

    const handleEdit = (category: CategoryType) => {
        setSelectedCategory(category);
        setIsUpdateModalOpen(true);
    };

    const handleDeleteCategory = (category: CategoryType) => {
        setSelectedCategory(category);
        setShowDeleteConfirm(true);
    };

    const handleUpdateSuccess = () => {
        fetchCategories(currentPage);
    };

    const handleDeleteSuccess = () => {
        fetchCategories(currentPage);
        setShowDeleteConfirm(false);
        setSelectedCategory(null);
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Quản lý danh mục</h2>
                        <p className="mt-1 text-sm text-gray-600">Quản lý các danh mục bài viết trong hệ thống</p>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={handleResetSearch}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <Filter className="h-4 w-4 mr-2" />
                            Đặt lại bộ lọc
                        </button>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Thêm danh mục
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                {/* Search Section */}
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Search Input */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="Tìm kiếm theo tên danh mục..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                            />
                        </div>

                        {/* Export Button */}
                        <div className="flex justify-end">
                            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                <Download className="h-4 w-4 mr-2" />
                                Xuất dữ liệu
                            </button>
                        </div>
                    </div>
                </div>

                {/* Categories Table */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tên danh mục
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Slug
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Mô tả
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Số bài viết
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Ngày tạo
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                                            Đang tải dữ liệu...
                                        </td>
                                    </tr>
                                ) : categories.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                                            Không có danh mục nào
                                        </td>
                                    </tr>
                                ) : (
                                    categories.map((category) => (
                                        <tr key={category.categoryId} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-blue-600 hover:text-blue-800">
                                                    {category.name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-indigo-500 font-mono">
                                                    {category.slug}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-600 line-clamp-2">
                                                    {category.description || 'Chưa có mô tả'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm">
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                        {category.countTotalPost} bài viết
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">
                                                    {new Date(category.createdAt).toLocaleDateString('vi-VN', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end space-x-3">
                                                    <button
                                                        onClick={() => handleViewCategory(category.categoryId)}
                                                        className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                                                        title="Xem chi tiết"
                                                    >
                                                        <Eye className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(category)}
                                                        className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200"
                                                        title="Chỉnh sửa"
                                                    >
                                                        <Pencil className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteCategory(category)}
                                                        className="text-red-600 hover:text-red-900 transition-colors duration-200"
                                                        title="Xóa"
                                                    >
                                                        <Trash2 className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.totalPages > 1 && (
                        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                            <div className="flex-1 flex justify-between sm:hidden">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={!pagination.hasPrevious}
                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                                >
                                    Trang trước
                                </button>
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={!pagination.hasNext}
                                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                                >
                                    Trang sau
                                </button>
                            </div>
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Hiển thị <span className="font-medium">{((currentPage - 1) * DEFAULT_SEARCH_VALUES.pageSize) + 1}</span> đến{' '}
                                        <span className="font-medium">
                                            {Math.min(currentPage * DEFAULT_SEARCH_VALUES.pageSize, pagination.totalCount)}
                                        </span>{' '}
                                        của <span className="font-medium">{pagination.totalCount}</span> kết quả
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={!pagination.hasPrevious}
                                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                                        >
                                            <span className="sr-only">Trang trước</span>
                                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                                            <button
                                                key={`page-${page}`}
                                                onClick={() => handlePageChange(page)}
                                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${page === currentPage
                                                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={!pagination.hasNext}
                                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                                        >
                                            <span className="sr-only">Trang sau</span>
                                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Add Category Modal */}
                <AddCategoryModal
                    isOpen={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => {
                        fetchCategories(currentPage);
                    }}
                />

                {selectedCategory && (
                    <>
                        <UpdateCategoryModal
                            isOpen={isUpdateModalOpen}
                            onClose={() => setIsUpdateModalOpen(false)}
                            onSuccess={handleUpdateSuccess}
                            category={selectedCategory}
                        />
                        <DeleteCategoryModal
                            categoryId={selectedCategory.categoryId}
                            isOpen={showDeleteConfirm}
                            onClose={() => {
                                setShowDeleteConfirm(false);
                                setSelectedCategory(null);
                            }}
                            categoryName={selectedCategory.name}
                            onSuccess={handleDeleteSuccess}
                        />
                    </>
                )}
            </div>
        </AdminLayout>
    );
};

export default CategoryManagementPage;

interface CategoryType {
    categoryId: number;
    name: string;
    slug: string;
    description: string;
    countTotalPost: number;
    createdAt: string;
}

const DEFAULT_SEARCH_VALUES = {
    searchQuery: '',
    currentPage: 1,
    pageSize: 10
};