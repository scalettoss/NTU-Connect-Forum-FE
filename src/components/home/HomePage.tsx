"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, ChevronRight, Calendar, Users, BookOpen, Award, Bookmark, TrendingUp, Clock } from 'lucide-react';
import { getAllCategory } from '@/services/CategoryService';
import { getPreviewPost } from '@/services/PostService';
import { CategoryResponseType } from '@/types/CategoryType';
import { PostResponseType } from '@/types/PostType';
import CategoryCard from '@/components/category/CategoryCard';
import { getImagesFromUrl } from '@/helper/GetImagesHelper';
import { toggleLike } from '@/services/LikeService';
import { toast, Toaster } from 'react-hot-toast';
import { formatRelativeTime, formatSimpleDate } from '@/helper/DateHelper';

const HomePage = () => {
    const [activeTab, setActiveTab] = useState('newest');
    const [searchQuery, setSearchQuery] = useState('');
    const [categories, setCategories] = useState<Category[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [categoryError, setCategoryError] = useState<string | null>(null);
    const [postError, setPostError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Check for login success and show toast
    useEffect(() => {
        const loginSuccess = localStorage.getItem('login_success');
        if (loginSuccess === 'true') {
            // Show success toast
            toast.success('Đăng nhập thành công!', {
                duration: 3000,
                position: 'top-center',
                style: {
                    background: '#10B981',
                    color: '#fff',
                },
                iconTheme: {
                    primary: '#fff',
                    secondary: '#10B981',
                },
            });

            // Remove the flag from localStorage
            localStorage.removeItem('login_success');
        }
    }, []);

    // Lấy danh sách danh mục từ API
    const fetchCategories = async () => {
        try {
            setLoadingCategories(true);
            setCategoryError(null);
            const response = await getAllCategory();
            console.log(response);
            if (response) {
                const categoryData = Array.isArray(response.data)
                    ? response.data
                    : (response.data.items || []);

                const transformedCategories = categoryData.map((cat: CategoryResponseType) => ({
                    id: cat.categoryId,
                    slug: cat.slug,
                    name: cat.name,
                    count: cat.countTotalPost || 0
                }));
                setCategories(transformedCategories);
            }
        } catch (err) {
            console.error("Lỗi khi tải danh mục:", err);
            setCategoryError("Không thể tải danh mục. Vui lòng thử lại sau.");
        } finally {
            setLoadingCategories(false);
        }
    };

    // Lấy danh sách bài viết mới nhất từ API
    const fetchPosts = async (sortType = 'newest') => {
        try {
            setLoadingPosts(true);
            setPostError(null);

            // Chuyển đổi giá trị của tab thành tham số sortBy cho API
            let sortBy: string;
            switch (sortType) {
                case 'newest':
                    sortBy = 'newest';
                    break;
                case 'oldest':
                    sortBy = 'oldest';
                    break;
                case 'popular':
                    sortBy = 'popular';
                    break;
                default:
                    sortBy = 'newest';
            }

            const response = await getPreviewPost(sortBy);
            if (response) {
                //@ts-ignore
                const transformedPosts = response.data.map((post: PostResponseType) => {
                    const image = post.fileUrls && post.fileUrls.length > 0
                        ? getImagesFromUrl(post.fileUrls[0])
                        : undefined;

                    const excerpt = post.content
                        ? post.content.substring(0, 150) + (post.content.length > 150 ? '...' : '')
                        : '';

                    // Use formatRelativeTime instead of getTimeAgo
                    const timeAgo = formatRelativeTime(post.createdAt);

                    // Use formatSimpleDate for the formatted date
                    const formattedDate = formatSimpleDate(post.createdAt);

                    return {
                        id: post.postId,
                        title: post.title,
                        excerpt: excerpt,
                        category: post.categoryName.toString(),
                        categorySlug: post.categorySlug,
                        image: image,
                        author: {
                            name: post.fullName,
                            avatar: post.avatarUrl ? getImagesFromUrl(post.avatarUrl) : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(post.fullName)
                        },
                        date: formattedDate,
                        timeAgo: timeAgo,
                        likes: post.likeCount,
                        comments: post.commentCount,
                        hasAttachments: Boolean(post.fileUrls && post.fileUrls.length > 0),
                        isLiked: post.isLiked,
                        postSlug: post.postSlug
                    };
                });
                setPosts(transformedPosts);
            }
        } catch (err) {
            console.error("Lỗi khi tải bài viết:", err);
            setPostError("Không thể tải bài viết. Vui lòng thử lại sau.");
        } finally {
            setLoadingPosts(false);
        }
    };

    const handleLike = async (postId: number, currentLikes: number, isLiked: boolean) => {
        try {
            await toggleLike({ postId });
            setPosts(prevPosts =>
                prevPosts.map(post =>
                    post.id === postId
                        ? {
                            ...post,
                            likes: isLiked ? currentLikes - 1 : currentLikes + 1,
                            isLiked: !isLiked
                        }
                        : post
                )
            );
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    // Xử lý khi người dùng chuyển tab
    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        fetchPosts(tab);
    };

    useEffect(() => {
        fetchCategories();
        fetchPosts('newest'); // Mặc định lấy bài viết mới nhất
    }, []);

    // Trending topics
    const trendingTopics = [
        'Lịch thi cuối kỳ',
        'Đăng ký học phần',
        'Học bổng KKHT',
        'Thực tập doanh nghiệp',
        'Hoạt động ngoại khóa'
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-white">
            <Toaster position="top-center" />

            {/* Hero Section - Thêm gradient đậm hơn */}
            <div className="bg-gradient-to-r from-orange-100 via-orange-50 to-white py-12 px-4 sm:px-6 lg:px-8 shadow-sm">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center">
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                            Kết nối <span className="text-orange-500">cộng đồng</span> sinh viên Nha Trang
                        </h1>
                        <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                            Cập nhật thông tin học tập, sự kiện, hoạt động mới nhất và kết nối với cộng đồng sinh viên
                        </p>

                        {/* Search box with improved styling */}
                        <div className="max-w-xl mx-auto relative">
                            <div className="flex items-center border-2 border-gray-300 bg-white rounded-full overflow-hidden shadow-md focus-within:ring-2 focus-within:ring-orange-400 focus-within:border-orange-400">
                                <div className="pl-4">
                                    <Search className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    className="w-full py-3 px-4 text-gray-700 focus:outline-none"
                                    placeholder="Tìm kiếm thông tin, bài viết, sự kiện..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="pr-4 text-gray-400 hover:text-gray-600"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Categories Section - Thêm gradient */}
                <div className="mb-16 p-6 bg-gradient-to-r from-white via-gray-50 to-white rounded-xl shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">Danh mục</h2>
                        <Link href="/home/category" className="text-orange-500 hover:text-orange-600 flex items-center text-sm font-medium">
                            Xem tất cả
                            <ChevronRight size={16} className="ml-1" />
                        </Link>
                    </div>

                    {loadingCategories ? (
                        <CategorySkeleton />
                    ) : categoryError ? (
                        <CategoryError message={categoryError} onRetry={fetchCategories} />
                    ) : (
                        // Render categories with custom styling for each
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {categories.slice(0, 8).map((category, index) => {
                                return (
                                    <CategoryCard
                                        key={category.id}
                                        id={category.id}
                                        slug={category.slug}
                                        name={category.name}
                                        count={category.count}
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Featured Posts Section - Thêm gradient */}
                    <div className="lg:col-span-2 p-6 bg-gradient-to-r from-white via-gray-50 to-white rounded-xl shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-gray-900">Bài viết nổi bật</h2>
                            <div className="flex space-x-2 bg-white rounded-full p-1 shadow-sm">
                                <button
                                    onClick={() => handleTabChange('newest')}
                                    className={`px-4 py-1.5 rounded-full text-sm font-medium ${activeTab === 'newest'
                                        ? 'bg-gradient-to-r from-orange-500 to-orange-400 text-white shadow-sm'
                                        : 'text-gray-600 hover:text-gray-800'
                                        }`}
                                >
                                    Mới nhất
                                </button>
                                <button
                                    onClick={() => handleTabChange('oldest')}
                                    className={`px-4 py-1.5 rounded-full text-sm font-medium ${activeTab === 'oldest'
                                        ? 'bg-gradient-to-r from-orange-500 to-orange-400 text-white shadow-sm'
                                        : 'text-gray-600 hover:text-gray-800'
                                        }`}
                                >
                                    Cũ nhất
                                </button>
                                <button
                                    onClick={() => handleTabChange('popular')}
                                    className={`px-4 py-1.5 rounded-full text-sm font-medium ${activeTab === 'popular'
                                        ? 'bg-gradient-to-r from-orange-500 to-orange-400 text-white shadow-sm'
                                        : 'text-gray-600 hover:text-gray-800'
                                        }`}
                                >
                                    Phổ biến
                                </button>
                            </div>
                        </div>

                        {loadingPosts ? (
                            <PostSkeleton />
                        ) : postError ? (
                            <CategoryError message={postError} onRetry={() => fetchPosts(activeTab)} />
                        ) : posts.length === 0 ? (
                            <div className="text-center py-16 bg-gray-50 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1M19 20a2 2 0 002-2V8a2 2 0 00-2-2h-1M9 12h6m-6 4h6" />
                                </svg>
                                <p className="text-gray-600">Chưa có bài viết nào</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {posts.map((post) => (
                                    <Link href={`/home/category/${post.categorySlug}/${post.postSlug || post.id}`} key={post.id}>
                                        <div className="mt-5 bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition duration-300 border border-gray-100 flex flex-col md:flex-row">
                                            {post.image ? (
                                                <div className="relative overflow-hidden md:w-1/3">
                                                    <div className="aspect-[16/9] h-full w-full">
                                                        <img
                                                            src={post.image}
                                                            alt={post.title}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="absolute top-3 left-3">
                                                        <span className="bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full">
                                                            {post.category}
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="relative overflow-hidden bg-gray-100 md:w-1/3">
                                                    <div className="aspect-[16/9] h-full w-full flex items-center justify-center">
                                                        <div className="text-gray-400 flex flex-col items-center">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                            <span className="text-xs">Bài viết này không có ảnh</span>
                                                        </div>
                                                    </div>
                                                    <div className="absolute top-3 left-3">
                                                        <span className="bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full">
                                                            {post.category}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="p-5 md:w-2/3 flex flex-col">
                                                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                                                    {post.title}
                                                </h3>
                                                <p className="text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>

                                                {/* Thông tin tương tác */}
                                                <div className="flex items-center space-x-4 mb-3 text-gray-500 text-sm">
                                                    <div
                                                        className="flex items-center cursor-pointer hover:text-indigo-500 transition-colors"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            handleLike(post.id, post.likes, post.isLiked);
                                                        }}
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            className={`h-4 w-4 mr-1 ${post.isLiked ? 'text-red-500 fill-current' : ''}`}
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                                            />
                                                        </svg>
                                                        <span>{post.likes}</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                        </svg>
                                                        <span>{post.comments}</span>
                                                    </div>
                                                    {post.hasAttachments && (
                                                        <div className="flex items-center">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                            </svg>
                                                            <span>Đính kèm</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="mt-auto flex items-center justify-between">
                                                    <div className="flex items-center">
                                                        <img
                                                            src={post.author.avatar}
                                                            alt={post.author.name}
                                                            className="w-8 h-8 rounded-full mr-2"
                                                        />
                                                        <span className="text-sm text-gray-700">{post.author.name}</span>
                                                    </div>
                                                    <div className="flex items-center text-gray-500 text-sm">
                                                        <Clock size={14} className="mr-1" />
                                                        <span>{post.timeAgo}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-8">
                        {/* Trending Topics - Thêm gradient */}
                        <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center mb-4">
                                <TrendingUp size={20} className="text-orange-500 mr-2" />
                                <h3 className="text-lg font-bold text-gray-900">Xu hướng tìm kiếm</h3>
                            </div>
                            <div className="space-y-3">
                                {trendingTopics.map((topic, index) => (
                                    <Link href={`/search?q=${encodeURIComponent(topic)}`} key={index} className="flex items-center p-2 hover:bg-orange-50 rounded-lg transition-colors">
                                        <span className="bg-gradient-to-r from-orange-400 to-orange-500 text-white w-6 h-6 rounded-full flex items-center justify-center mr-3 text-xs font-medium shadow-sm">
                                            {index + 1}
                                        </span>
                                        <span className="text-gray-700 font-medium">{topic}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Save for later / Bookmarks - Thêm gradient */}
                        <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center mb-4">
                                <Bookmark size={20} className="text-orange-500 mr-2" />
                                <h3 className="text-lg font-bold text-gray-900">Lưu để đọc sau</h3>
                            </div>
                            <p className="text-gray-600 text-sm mb-4">
                                Đánh dấu các bài viết yêu thích để đọc sau
                            </p>
                            <Link href="/bookmarks" className="flex items-center justify-center w-full py-2 px-4 border border-orange-500 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors font-medium text-sm">
                                Xem bài viết đã lưu
                            </Link>
                        </div>

                        {/* Quick Links - Gradient mạnh hơn */}
                        <div className="bg-gradient-to-br from-orange-500 via-orange-400 to-orange-600 rounded-xl p-6 shadow-md text-white">
                            <h3 className="text-lg font-bold mb-4">Truy cập nhanh</h3>
                            <div className="space-y-3">
                                <Link href="/academic-calendar" className="flex items-center p-2 hover:bg-white/20 rounded-lg transition-colors">
                                    <Calendar size={18} className="mr-3" />
                                    <span>Lịch học tập</span>
                                </Link>
                                <Link href="/scholarship" className="flex items-center p-2 hover:bg-white/20 rounded-lg transition-colors">
                                    <Award size={18} className="mr-3" />
                                    <span>Học bổng</span>
                                </Link>
                                <Link href="/clubs" className="flex items-center p-2 hover:bg-white/20 rounded-lg transition-colors">
                                    <Users size={18} className="mr-3" />
                                    <span>Câu lạc bộ</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;



interface Category {
    id: number;
    slug: string;
    name: string;
    count: number;
}

interface Post {
    id: number;
    title: string;
    excerpt: string;
    category: string;
    categorySlug: string;
    image?: string;
    author: {
        name: string;
        avatar: string;
    };
    date: string;
    timeAgo: string;
    likes: number;
    comments: number;
    hasAttachments: boolean;
    isLiked: boolean;
    postSlug?: string;
}

// Skeleton loader component for categories
const CategorySkeleton = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse">
                <div className="w-12 h-12 rounded-full bg-gray-200 mb-4"></div>
                <div className="h-5 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-4 bg-gray-100 rounded w-1/3"></div>
            </div>
        ))}
    </div>
);

// Skeleton loader component for posts
const PostSkeleton = () => (
    <div className="space-y-6">
        {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 flex flex-col md:flex-row animate-pulse">
                <div className="relative overflow-hidden md:w-1/3">
                    <div className="aspect-[16/9] h-full w-full bg-gray-200"></div>
                </div>
                <div className="p-5 md:w-2/3 flex flex-col">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-100 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-100 rounded w-2/3 mb-6"></div>
                    <div className="flex space-x-4 mb-3">
                        <div className="h-4 bg-gray-100 rounded w-12"></div>
                        <div className="h-4 bg-gray-100 rounded w-12"></div>
                        <div className="h-4 bg-gray-100 rounded w-12"></div>
                    </div>
                    <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-gray-200 mr-2"></div>
                            <div className="h-4 bg-gray-100 rounded w-24"></div>
                        </div>
                        <div className="h-4 bg-gray-100 rounded w-16"></div>
                    </div>
                </div>
            </div>
        ))}
    </div>
);

const CategoryError = ({ message, onRetry }: { message: string, onRetry: () => void }) => (
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
