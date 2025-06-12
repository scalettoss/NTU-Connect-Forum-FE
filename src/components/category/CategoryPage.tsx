"use client";

import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronRight, Clock, TrendingUp, TrendingDown, Home, Layers } from 'lucide-react';
import { getAllCategory } from '@/services/CategoryService';
import { CategoryResponseType } from '@/types/CategoryType';
import CategoryCard from '@/components/category/CategoryCard';
import '@/styles/animations.css';
import Breadcrumb from '@/components/common/Breadcrumb';

// Skeleton loader for category cards
const CategoryCardSkeleton = () => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse h-full">
        <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-gray-200 mb-4"></div>
        </div>
        <div className="h-5 bg-gray-200 rounded w-2/3 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
        <div className="h-4 bg-gray-100 rounded w-1/2"></div>
    </div>
);

// Error state component
const ErrorMessage = ({ message, onRetry }: { message: string, onRetry: () => void }) => (
    <div className="text-center py-8 bg-red-50 rounded-lg">
        <p className="text-red-600">{message}</p>
        <button
            onClick={onRetry}
            className="mt-2 text-orange-500 hover:text-orange-600 font-medium"
        >
            Thử lại
        </button>
    </div>
);

const CategoryPage = () => {
    const [categories, setCategories] = useState<CategoryResponseType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, setSortBy] = useState<'default' | 'mostPosts' | 'leastPosts'>('default');

    // Lấy danh sách danh mục từ API
    const fetchCategories = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getAllCategory();
            console.log(response);
            if (response?.data) {
                const categoryData = Array.isArray(response.data)
                    ? response.data
                    : (response.data.items || []);
                setCategories(categoryData);
            }
        } catch (err) {
            console.error("Lỗi khi tải danh mục:", err);
            setError("Không thể tải danh mục. Vui lòng thử lại sau.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // Lọc và sắp xếp danh mục
    const filteredAndSortedCategories = categories
        .filter(category =>
            category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (category.description && category.description.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        .sort((a, b) => {
            if (sortBy === 'mostPosts') {
                return (b.countTotalPost || 0) - (a.countTotalPost || 0);
            } else if (sortBy === 'leastPosts') {
                return (a.countTotalPost || 0) - (b.countTotalPost || 0);
            }
            return 0; // Default order (as returned from API)
        });

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white py-12 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-r from-blue-100/30 to-indigo-200/30 transform -skew-y-3 animate-gradient"></div>
            <div className="absolute bottom-0 right-0 w-full h-64 bg-gradient-to-l from-blue-100/20 to-indigo-200/20 transform skew-y-3 animate-gradient"></div>
            <div className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full bg-indigo-100/20 blur-3xl"></div>
            <div className="absolute top-1/3 right-0 w-72 h-72 rounded-full bg-blue-100/20 blur-3xl"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Breadcrumb */}
                <Breadcrumb
                    items={[
                        { label: 'Trang chủ', href: '/home' },
                        { label: 'Danh mục', isActive: true }
                    ]}
                    className="mb-8"
                />

                {/* Search and filter section */}
                <div className="mb-8 animate-fadeIn">
                    <div className="bg-white/90 backdrop-blur-sm p-5 rounded-xl shadow-md border border-indigo-100 card-shine">
                        <div className="flex flex-col md:flex-row gap-4 items-center">
                            <div className="relative flex-grow">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-indigo-400" />
                                </div>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Tìm kiếm danh mục..."
                                    className="block w-full pl-10 pr-3 py-3 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 bg-indigo-50/50 text-gray-700 transition-all"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-indigo-600"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>

                            <div className="flex gap-2 md:gap-3">
                                <button
                                    onClick={() => setSortBy('default')}
                                    className={`flex items-center px-3 py-2 rounded-lg transition-all ${sortBy === 'default'
                                        ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-md'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    <Filter className="mr-2 h-4 w-4" />
                                    <span>Mặc định</span>
                                </button>

                                <button
                                    onClick={() => setSortBy('mostPosts')}
                                    className={`flex items-center px-3 py-2 rounded-lg transition-all ${sortBy === 'mostPosts'
                                        ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-md'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    <TrendingUp className="mr-2 h-4 w-4" />
                                    <span>Nhiều nhất</span>
                                </button>

                                <button
                                    onClick={() => setSortBy('leastPosts')}
                                    className={`flex items-center px-3 py-2 rounded-lg transition-all ${sortBy === 'leastPosts'
                                        ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-md'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    <TrendingDown className="mr-2 h-4 w-4" />
                                    <span>Ít nhất</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Categories grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <CategoryCardSkeleton key={i} />
                        ))}
                    </div>
                ) : error ? (
                    <ErrorMessage message={error} onRetry={fetchCategories} />
                ) : filteredAndSortedCategories.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                        </svg>
                        <p className="text-gray-600 mb-2">Không tìm thấy danh mục nào</p>
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="text-orange-500 hover:text-orange-600 font-medium"
                            >
                                Xóa tìm kiếm
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredAndSortedCategories.map((category) => (
                            <CategoryCard
                                key={category.categoryId}
                                id={category.categoryId}
                                slug={category.slug}
                                name={category.name}
                                count={category.countTotalPost || 0}
                                description={category.description}
                            />
                        ))}
                    </div>
                )}

                {/* Stats and info */}
                <div className="mt-12 bg-gradient-to-r from-orange-50 to-white p-6 rounded-xl shadow-sm border border-orange-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Thống kê danh mục</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                            <p className="text-sm text-gray-600">Tổng số danh mục</p>
                            <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                            <p className="text-sm text-gray-600">Tổng số bài viết</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {categories.reduce((sum, cat) => sum + (cat.countTotalPost || 0), 0)}
                            </p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                            <p className="text-sm text-gray-600">Danh mục nhiều bài viết nhất</p>
                            <p className="text-xl font-bold text-gray-900 truncate">
                                {categories.length > 0
                                    ? categories.reduce((prev, current) =>
                                        (prev.countTotalPost || 0) > (current.countTotalPost || 0) ? prev : current
                                    ).name
                                    : "N/A"
                                }
                            </p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                            <p className="text-sm text-gray-600">Cập nhật lần cuối</p>
                            <div className="flex items-center">
                                <Clock size={16} className="text-gray-500 mr-1" />
                                <p className="text-lg font-bold text-gray-900">Hôm nay</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoryPage;
