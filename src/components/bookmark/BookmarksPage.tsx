"use client";
import React, { useState, useEffect } from 'react';
import { Bookmark, Search, Filter, FolderOpen, Clock, Calendar, List, Grid, X, Heart, MessageSquare, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { toast, Toaster } from 'react-hot-toast';
import { BookmarkResponseType } from '@/types/BookmarkType';
import { getBookmarksByUser, toggleBookmark } from '@/services/BookmarkService';
import { getUserInfoFromTokenClient } from '@/helper/UserTokenHelper';
import Breadcrumb from '../common/Breadcrumb';
// Interface hiển thị bookmark
interface DisplayBookmarkType {
    category: string;
    author: string;
    savedAt: string;
    postId: number;
    title: string;
    content: string;
    postSlug: string;
    categorySlug: string;
}

const BookmarksPage: React.FC = () => {
    // Lấy userId từ localStorage hoặc cookie thay vì sử dụng context
    const [userId, setUserId] = useState<number | null>(null);
    const [viewMode, setViewMode] = useState('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [sortBy, setSortBy] = useState('recent');

    // UI state
    const [loading, setLoading] = useState(true);
    const [bookmarks, setBookmarks] = useState<DisplayBookmarkType[]>([]);
    const [originalBookmarks, setOriginalBookmarks] = useState<BookmarkResponseType[]>([]);

    useEffect(() => {
        const userInfo = getUserInfoFromTokenClient();
        if (userInfo) {
            setUserId(userInfo.id);
        }
    }, []);

    // Lấy bookmarks từ API
    useEffect(() => {
        const fetchBookmarks = async () => {
            try {
                setLoading(true);
                if (userId) {
                    const response = await getBookmarksByUser(userId);
                    if (response) {
                        //@ts-ignore
                        const bookmarksData = response.data;
                        setOriginalBookmarks(bookmarksData);

                        const displayBookmarks: DisplayBookmarkType[] = bookmarksData.map((bookmark: BookmarkResponseType) => ({
                            title: bookmark.postTitle,
                            content: bookmark.postContent,
                            category: bookmark.categoryName,
                            author: bookmark.fullName,
                            savedAt: bookmark.createdAt.toString(),
                            postId: bookmark.postId,
                            postSlug: bookmark.postSlug,
                            categorySlug: bookmark.categorySlug,
                        }));

                        setBookmarks(displayBookmarks);
                    }
                }
            } catch (error) {
                console.error('Error fetching bookmarks:', error);
                toast.error('Không thể tải danh sách bài viết đã lưu');
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchBookmarks();
        }
    }, [userId]);

    // Xóa bookmark
    const handleRemoveBookmark = async (postId: number) => {
        try {
            await toggleBookmark(postId);

            // Cập nhật UI sau khi xóa
            setBookmarks(prev => prev.filter(bookmark => bookmark.postId !== postId));
            setOriginalBookmarks(prev => prev.filter(bookmark => bookmark.postId !== postId));

            toast.success('Đã xóa bài viết khỏi danh sách đã lưu');
        } catch (error) {
            console.error('Error removing bookmark:', error);
            toast.error('Không thể xóa bài viết khỏi danh sách đã lưu');
        }
    };

    // Filter bookmarks
    const filteredBookmarks = bookmarks.filter(bookmark => {
        // Filter by search query
        if (searchQuery && bookmark.title && !bookmark.title.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }

        // Filter by category
        if (selectedCategory && bookmark.category !== selectedCategory) {
            return false;
        }

        return true;
    });

    // Sort bookmarks
    const sortedBookmarks = [...filteredBookmarks].sort((a, b) => {
        if (sortBy === 'recent') {
            return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
        } else if (sortBy === 'oldest') {
            return new Date(a.savedAt).getTime() - new Date(b.savedAt).getTime();
        }
        return 0;
    });

    // Định dạng thời gian
    const formatSavedTime = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    // Tạo danh sách các danh mục duy nhất từ bookmarks để hiển thị trong select
    const uniqueCategories = [...new Set(bookmarks.map(bookmark => bookmark.category))];

    // Empty state when no bookmarks
    if (bookmarks.length === 0 && !loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 py-8 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center mb-6">
                        <Bookmark className="h-6 w-6 text-orange-500 mr-2" />
                        <h1 className="text-2xl font-bold text-gray-800">Bài viết đã lưu</h1>
                    </div>

                    <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
                        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Bookmark className="h-10 w-10 text-orange-500" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Chưa có bài viết nào được lưu</h2>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                            Hãy lưu các bài viết bạn muốn đọc sau bằng cách nhấn vào biểu tượng dấu trang trong các bài viết.
                        </p>
                        <a
                            href="/home/category"
                            className="inline-flex items-center justify-center px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors shadow-sm"
                        >
                            Khám phá bài viết
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 py-8 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center mb-6">
                        <Bookmark className="h-6 w-6 text-orange-500 mr-2" />
                        <h1 className="text-2xl font-bold text-gray-800">Bài viết đã lưu</h1>
                    </div>

                    <div className="animate-pulse space-y-6">
                        <div className="h-12 bg-gray-200 rounded-lg w-full"></div>
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                <div className="h-5 bg-gray-200 rounded w-3/4 mb-4"></div>
                                <div className="h-4 bg-gray-200 rounded-full w-1/4 mb-2"></div>
                                <div className="flex justify-between mt-4">
                                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }
    console.log("bookmarks", bookmarks);
    console.log("filtered bookmarks", filteredBookmarks);
    console.log("sorted bookmarks", sortedBookmarks);

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 py-8 px-4">
            <Toaster position="top-right" />
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <Breadcrumb
                    items={[
                        { label: 'Trang chủ', href: '/home' },
                        { label: 'Bookmark', isActive: true }
                    ]}
                    className="mb-8"
                />
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                        <Bookmark className="h-6 w-6 text-orange-500 mr-2" />
                        <h1 className="text-2xl font-bold text-gray-800">Bài viết đã lưu</h1>
                        <span className="ml-3 bg-orange-100 text-orange-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                            {bookmarks.length} bài viết
                        </span>
                    </div>

                    <div className="flex items-center space-x-2">
                        <button
                            className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            onClick={() => setViewMode('list')}
                            title="Chế độ xem danh sách"
                        >
                            <List size={20} />
                        </button>
                        <button
                            className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            onClick={() => setViewMode('grid')}
                            title="Chế độ xem lưới"
                        >
                            <Grid size={20} />
                        </button>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                        {/* Search input */}
                        <div className="relative flex-grow">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                placeholder="Tìm kiếm bài viết đã lưu..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setSearchQuery('')}
                                >
                                    <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                </button>
                            )}
                        </div>

                        {/* Category filter */}
                        <div className="relative min-w-[180px]">
                            <select
                                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 rounded-md sm:text-sm"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                <option value="">Tất cả danh mục</option>
                                {uniqueCategories.map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <Filter className="h-4 w-4 text-gray-400" />
                            </div>
                        </div>

                        {/* Sort options */}
                        <div className="relative min-w-[180px]">
                            <select
                                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 rounded-md sm:text-sm"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="recent">Mới nhất</option>
                                <option value="oldest">Cũ nhất</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <Calendar className="h-4 w-4 text-gray-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main content */}
                {sortedBookmarks.length === 0 ? (
                    <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center">
                        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FolderOpen className="h-8 w-8 text-orange-500" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-800 mb-2">Không tìm thấy kết quả phù hợp</h2>
                        <p className="text-gray-600 mb-4">
                            Không tìm thấy bài viết nào phù hợp với bộ lọc hiện tại
                        </p>
                        <button
                            className="inline-flex items-center justify-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors shadow-sm text-sm"
                            onClick={() => {
                                setSearchQuery('');
                                setSelectedCategory('');
                                setSortBy('recent');
                            }}
                        >
                            Xóa bộ lọc
                        </button>
                    </div>
                ) : (
                    <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-4'}>
                        {sortedBookmarks.map(bookmark => (
                            <div key={bookmark.postId} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                                <div className="p-5">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <Link href={`/home/category/${bookmark.categorySlug}/${bookmark.postSlug}`}>
                                                <h3 className="text-lg font-bold text-gray-800 hover:text-orange-600 transition-colors line-clamp-2 mb-2">
                                                    {bookmark.title || 'Tiêu đề không có sẵn'}
                                                </h3>
                                            </Link>

                                            {bookmark.content && (
                                                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                                    {bookmark.content}
                                                </p>
                                            )}

                                            <div className="flex items-center text-sm text-gray-500 mb-3">
                                                <span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full text-xs font-medium">
                                                    {bookmark.category || 'Không có danh mục'}
                                                </span>
                                                <span className="mx-2">•</span>
                                                <span>{bookmark.author || 'Không xác định'}</span>
                                            </div>

                                            <div className="flex items-center text-xs text-gray-500">
                                                <Clock size={14} className="mr-1" />
                                                <span>Đã lưu: {formatSavedTime(bookmark.savedAt)}</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleRemoveBookmark(bookmark.postId)}
                                            className="ml-2 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                            title="Bỏ lưu"
                                        >
                                            <Bookmark className="h-5 w-5 fill-current" />
                                        </button>
                                    </div>

                                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-50">
                                        <div className="flex space-x-4 text-gray-500 text-sm">
                                            <Link
                                                href={`/home/category/${bookmark.categorySlug}/${bookmark.postSlug}`}
                                                className="flex items-center hover:text-orange-600 transition-colors"
                                            >
                                                <ExternalLink size={16} className="mr-1" />
                                                <span>Xem bài viết</span>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookmarksPage; 