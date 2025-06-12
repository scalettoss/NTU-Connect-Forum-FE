import { FC } from 'react';
import { PostResponseType } from '@/types/PostType';
import { PaginationResponseType } from '@/types/PaginationType';
import PostCard from '../post/PostCard';
import Link from 'next/link';
import { FaSpinner, FaFileAlt, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import '@/styles/animations.css';

interface CategoryPostListProps {
    posts: PostResponseType[];
    pagination: Omit<PaginationResponseType<any>, 'items'>;
    loading: boolean;
}

const CategoryPostList: FC<CategoryPostListProps> = ({ posts, pagination, loading }) => {

    const renderPaginationLinks = () => {
        const links = [];
        const maxVisiblePages = 3;
        let startPage = Math.max(1, pagination.currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1);

        if (endPage === pagination.totalPages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        links.push(
            <Link
                key="prev"
                href={pagination.hasPrevious ? `?page=${pagination.currentPage - 1}` : '#'}
                className={`flex items-center px-3 py-2 mx-1 rounded-lg text-sm sm:text-base sm:px-4 ${pagination.hasPrevious
                    ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white hover:from-indigo-600 hover:to-blue-600 shadow-md transform hover:-translate-y-1 transition-all duration-200 animate-gradient'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                onClick={(e) => !pagination.hasPrevious && e.preventDefault()}
                aria-disabled={!pagination.hasPrevious}
            >
                <FaArrowLeft className="mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Trước</span>
            </Link>
        );

        // Page numbers
        for (let i = startPage; i <= endPage; i++) {
            links.push(
                <Link
                    key={i}
                    href={`?page=${i}`}
                    className={`min-w-[32px] sm:min-w-[40px] h-10 flex items-center justify-center px-2 sm:px-3 py-2 mx-1 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${i === pagination.currentPage
                        ? 'bg-gradient-to-br from-indigo-600 to-blue-600 text-white shadow-md transform scale-110 animate-gradient'
                        : 'bg-white border border-blue-200 text-gray-700 hover:border-indigo-400 hover:text-indigo-600 hover-lift'}`}
                >
                    {i}
                </Link>
            );
        }

        // Next button
        links.push(
            <Link
                key="next"
                href={pagination.hasNext ? `?page=${pagination.currentPage + 1}` : '#'}
                className={`flex items-center px-3 py-2 mx-1 rounded-lg text-sm sm:text-base sm:px-4 ${pagination.hasNext
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 shadow-md transform hover:-translate-y-1 transition-all duration-200 animate-gradient'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                onClick={(e) => !pagination.hasNext && e.preventDefault()}
                aria-disabled={!pagination.hasNext}
            >
                <span className="hidden sm:inline">Tiếp</span>
                <FaArrowRight className="ml-1 sm:ml-2" />
            </Link>
        );

        return links;
    };

    const PaginationSection = () => (
        pagination.totalPages > 1 && (
            <div className="flex flex-wrap justify-center gap-1 my-4 sm:my-6 px-2">
                {renderPaginationLinks()}
            </div>
        )
    );

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-80 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 animate-gradient">
                <FaSpinner className="animate-spin text-indigo-500 h-10 w-10 mb-4" />
                <p className="text-indigo-600 font-medium">Đang tải bài viết...</p>
            </div>
        );
    }

    if (!posts || posts.length === 0) {
        return (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow p-8 text-center h-80 flex flex-col items-center justify-center animate-gradient">
                <FaFileAlt className="text-indigo-300 h-16 w-16 mb-4 animate-pulse-slow" />
                <p className="text-indigo-800 font-medium text-xl mb-2">Không có bài viết nào</p>
                <p className="text-gray-600">Hiện chưa có bài viết nào trong danh mục này.</p>
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Background decorative elements */}
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-gradient-to-br from-indigo-100/40 to-blue-100/40 rounded-full -z-10 animate-blob"></div>
            <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-gradient-to-tl from-indigo-100/30 to-blue-100/30 rounded-full -z-10 animate-blob animation-delay-2000"></div>

            {/* Top pagination */}
            <PaginationSection />

            <div className="grid grid-cols-1 gap-8">
                {posts.map(post => (
                    <PostCard key={post.postId} post={post} />
                ))}
            </div>

            {/* Bottom pagination */}
            <PaginationSection />

            <div className="mt-8 text-center">
                <p className="inline-block px-4 py-2 bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-700 rounded-full shadow-sm border border-indigo-100 hover-lift">
                    Hiển thị <span className="font-bold">{posts.length}</span> trong tổng số <span className="font-bold">{pagination.totalCount}</span> bài viết
                </p>
            </div>
        </div>
    );
};

export default CategoryPostList; 