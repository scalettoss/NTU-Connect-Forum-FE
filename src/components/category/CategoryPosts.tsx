"use client";

import { FC, useEffect, useState } from 'react';
import { getAllPostByCategory } from '@/services/PostService';
import { PaginationResponseType } from '@/types/PaginationType';
import { PostResponseType } from '@/types/PostType';
import CategoryPostList from './CategoryPostList';
import { useSearchParams } from 'next/navigation';
import { FaLayerGroup, FaSearch, FaSortAmountDown, FaSortAmountUp, FaHome, FaChevronRight, FaFire } from 'react-icons/fa';
import Link from 'next/link';
import '@/styles/animations.css';
import Breadcrumb from '@/components/common/Breadcrumb';

interface CategoryPostsProps {
    categoryName: string;
    categorySlug: string;
}

type SortType = 'newest' | 'oldest' | 'popular';

const CategoryPosts: FC<CategoryPostsProps> = ({ categoryName, categorySlug }) => {
    const searchParams = useSearchParams();
    const pageIndex = Number(searchParams.get('page')) || 1;
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState<SortType>('newest');

    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState<PostResponseType[]>([]);
    const [pagination, setPagination] = useState<Omit<PaginationResponseType<any>, 'items'>>({
        currentPage: 1,
        totalPages: 1,
        pageSize: 10,
        totalCount: 0,
        hasNext: false,
        hasPrevious: false,
    });

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            try {
                const response = await getAllPostByCategory(categorySlug, {
                    PageNumber: pageIndex,
                    PageSize: 10,
                    SortBy: sortOrder,
                });
                //@ts-ignore
                const postData = response.data;

                // Filter posts by search term if provided
                let filteredPosts = postData.items;
                if (searchTerm.trim()) {
                    filteredPosts = postData.items.filter((post: PostResponseType) =>
                        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        post.content.toLowerCase().includes(searchTerm.toLowerCase())
                    );
                }

                setPosts(filteredPosts);
                setPagination({
                    currentPage: postData.currentPage,
                    totalPages: postData.totalPages,
                    pageSize: postData.pageSize,
                    totalCount: postData.totalCount,
                    hasNext: postData.hasNext,
                    hasPrevious: postData.hasPrevious,
                });
            } catch (error) {
                console.error('Error fetching posts:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [categorySlug, pageIndex, sortOrder]);

    // Handle search with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            // Re-fetch or filter posts
            const fetchPosts = async () => {
                setLoading(true);
                try {
                    const response = await getAllPostByCategory(categorySlug, {
                        PageNumber: pageIndex,
                        PageSize: 10,
                        SortBy: sortOrder,
                    });
                    console.log(response);

                    //@ts-ignore
                    const postData = response.data;

                    // Filter posts by search term if provided
                    let filteredPosts = postData.items;
                    if (searchTerm.trim()) {
                        filteredPosts = postData.items.filter((post: PostResponseType) =>
                            post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            post.content.toLowerCase().includes(searchTerm.toLowerCase())
                        );
                    }

                    setPosts(filteredPosts);
                } catch (error) {
                    console.error('Error fetching posts:', error);
                } finally {
                    setLoading(false);
                }
            };

            fetchPosts();
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-indigo-50 py-10 animate-gradient">
            <div className="container mx-auto px-4 py-6">
                {/* Breadcrumb */}
                <Breadcrumb
                    items={[
                        { label: 'Trang chủ', href: '/home' },
                        { label: 'Danh mục', href: '/home/category/' },
                        { label: categoryName, isActive: true }
                    ]}
                    className="mb-8"
                />

                <div className="mb-12 text-center relative">
                    {/* Decorative elements */}
                    <div className="absolute top-0 left-1/4 w-16 h-16 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                    <div className="absolute top-0 right-1/4 w-16 h-16 bg-indigo-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                    <div className="absolute -bottom-8 left-1/3 w-16 h-16 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
                </div>

                {/* Search and filter bar */}
                <div className="bg-white rounded-xl shadow-md p-5 mb-8 border border-indigo-100 hover-lift card-shine">
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <div className="relative flex-grow">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaSearch className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 bg-gray-50 text-gray-700 transition-all"
                                placeholder="Tìm kiếm bài viết..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-2 md:gap-3">
                            <button
                                onClick={() => setSortOrder('newest')}
                                className={`flex items-center px-3 py-2 rounded-lg transition-all ${sortOrder === 'newest'
                                    ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                <FaSortAmountDown className="mr-2" />
                                <span>Mới nhất</span>
                            </button>

                            <button
                                onClick={() => setSortOrder('oldest')}
                                className={`flex items-center px-3 py-2 rounded-lg transition-all ${sortOrder === 'oldest'
                                    ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                <FaSortAmountUp className="mr-2" />
                                <span>Cũ nhất</span>
                            </button>

                            <button
                                onClick={() => setSortOrder('popular')}
                                className={`flex items-center px-3 py-2 rounded-lg transition-all ${sortOrder === 'popular'
                                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                <FaFire className="mr-2" />
                                <span>Phổ biến</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white bg-opacity-70 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-indigo-100 hover-lift">
                    <CategoryPostList
                        posts={posts}
                        pagination={pagination}
                        loading={loading}
                    />
                </div>
            </div>
        </div>
    );
};

export default CategoryPosts; 