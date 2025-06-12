import Image from 'next/image';
import Link from 'next/link';
import { FC, useState, useEffect, useRef } from 'react';
import { PostResponseType } from '@/types/PostType';
import { formatDistance } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
    FaHeart, FaRegHeart, FaRegComment, FaShareAlt, FaBookmark,
    FaFlag, FaEllipsisV, FaFilePdf, FaFileWord, FaFileExcel,
    FaFileAlt, FaFileImage, FaFile, FaDownload, FaPaperclip,
    FaRegBookmark
} from 'react-icons/fa';
import { getImagesFromUrl } from '@/helper/GetImagesHelper';
import '@/styles/animations.css';
import { toggleLike } from '@/services/LikeService';
import { toggleBookmark } from '@/services/BookmarkService';
import FileIcon from '@/components/common/FileIcon';
import ToastService from '@/services/ToastService';
import ReportPostModal from '@/components/modals/ReportPostModal';

interface PostCardProps {
    post: PostResponseType;
}

const PostCard: FC<PostCardProps> = ({ post }) => {
    const {
        postId,
        title,
        content,
        fullName,
        avatarUrl,
        createdAt,
        isLiked,
        likeCount,
        commentCount,
        fileUrls,
        categoryName,
        categorySlug,
        isScam,
        postSlug,
        isBookmark
    } = post;

    const [showOptions, setShowOptions] = useState(false);
    const [localIsLiked, setLocalIsLiked] = useState(isLiked);
    const [localLikeCount, setLocalLikeCount] = useState(likeCount);
    const [localIsBookmarked, setLocalIsBookmarked] = useState(isBookmark || false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setShowOptions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const formattedTime = formatDistance(new Date(createdAt), new Date(), {
        addSuffix: true,
        locale: vi
    });

    const truncatedContent = content.length > 150
        ? content.substring(0, 150) + '...'
        : content;

    const handleReport = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setIsReportModalOpen(true);
    };

    const handleLike = async () => {
        try {
            await toggleLike({ postId });
            setLocalIsLiked(!localIsLiked);
            setLocalLikeCount(prev => localIsLiked ? prev - 1 : prev + 1);
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    const handleToggleBookmark = async (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        try {
            await toggleBookmark(postId);
            const newBookmarkState = !localIsBookmarked;
            setLocalIsBookmarked(newBookmarkState);

            // Use the ToastService instead of manual DOM manipulation
            if (newBookmarkState) {
                ToastService.success('Đã lưu vào danh sách');
            } else {
                ToastService.info('Đã xóa khỏi danh sách lưu');
            }
        } catch (error) {
            console.error('Error toggling bookmark:', error);
            ToastService.error('Vui lòng đăng nhập');
        }
    };

    const handleShare = async (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        try {
            const currentUrl = `${window.location.origin}/home/category/${categorySlug}/${postSlug}`;
            await navigator.clipboard.writeText(currentUrl);
            ToastService.success('Đã sao chép liên kết vào clipboard');
        } catch (error) {
            console.error('Error copying to clipboard:', error);
            ToastService.error('Không thể sao chép liên kết');
        }
    };

    // Count file types
    const imageCount = fileUrls ? fileUrls.filter(url => getFileType(url) === 'image').length : 0;
    const pdfCount = fileUrls ? fileUrls.filter(url => getFileType(url) === 'pdf').length : 0;
    const wordCount = fileUrls ? fileUrls.filter(url => getFileType(url) === 'word').length : 0;
    const excelCount = fileUrls ? fileUrls.filter(url => getFileType(url) === 'excel').length : 0;
    const otherCount = fileUrls ? fileUrls.filter(url => !['image', 'pdf', 'word', 'excel'].includes(getFileType(url))).length : 0;

    return (
        <>
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-lg p-5 mb-5 hover:shadow-xl transition-all duration-300 border border-blue-100 relative overflow-hidden hover-lift card-shine">
                {/* Decorative element */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-blue-100/30 to-indigo-100/30 rounded-full z-0 animate-blob"></div>

                {isScam && (
                    <div className="mb-3 relative z-10">
                        <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-3 py-1 rounded-full font-semibold shadow-sm animate-gradient">Lừa đảo</span>
                    </div>
                )}

                <div className="flex items-center mb-4 relative z-10">
                    <div className="w-12 h-12 relative mr-3 ring-2 ring-blue-200 rounded-full hover:ring-indigo-400 transition-all">
                        <Image
                            src={getImagesFromUrl(avatarUrl)}
                            alt={fullName}
                            fill
                            className="rounded-full object-cover"
                        />
                    </div>
                    <div>
                        <p className="font-semibold text-gray-800">{fullName}</p>
                        <p className="text-gray-500 text-xs">{formattedTime}</p>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        <span className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs px-3 py-1.5 rounded-full font-medium shadow-sm animate-gradient">
                            {categoryName}
                        </span>
                    </div>
                </div>

                <Link href={`/home/category/${categorySlug}/${postSlug}`} className="block group">
                    <h3 className="text-xl font-bold mb-3 text-gray-800 group-hover:text-indigo-600 transition-colors">{title}</h3>

                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Content */}
                        <div className="flex-1">
                            <p className="text-gray-600 mb-4 leading-relaxed">{truncatedContent}</p>
                        </div>

                        {/* Media icons instead of actual media */}
                        {fileUrls && fileUrls.length > 0 && (
                            <div className="flex items-center gap-2 bg-blue-50/50 p-2 rounded-lg border border-blue-100">
                                <FaPaperclip className="text-blue-500" />
                                <span className="text-sm text-gray-600 font-medium">{fileUrls.length} tệp đính kèm:</span>

                                <div className="flex items-center gap-2 ml-2">
                                    {imageCount > 0 && (
                                        <div className="flex items-center bg-white px-2 py-1 rounded-md shadow-sm">
                                            <FileIcon fileType="image" />
                                            <span className="text-xs font-medium ml-1">{imageCount}</span>
                                        </div>
                                    )}
                                    {pdfCount > 0 && (
                                        <div className="flex items-center bg-white px-2 py-1 rounded-md shadow-sm">
                                            <FileIcon fileType="pdf" />
                                            <span className="text-xs font-medium ml-1">{pdfCount}</span>
                                        </div>
                                    )}
                                    {wordCount > 0 && (
                                        <div className="flex items-center bg-white px-2 py-1 rounded-md shadow-sm">
                                            <FileIcon fileType="word" />
                                            <span className="text-xs font-medium ml-1">{wordCount}</span>
                                        </div>
                                    )}
                                    {excelCount > 0 && (
                                        <div className="flex items-center bg-white px-2 py-1 rounded-md shadow-sm">
                                            <FileIcon fileType="excel" />
                                            <span className="text-xs font-medium ml-1">{excelCount}</span>
                                        </div>
                                    )}
                                    {otherCount > 0 && (
                                        <div className="flex items-center bg-white px-2 py-1 rounded-md shadow-sm">
                                            <FileIcon fileType="other" />
                                            <span className="text-xs font-medium ml-1">{otherCount}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </Link>

                <div className="flex items-center text-gray-600 pt-3 border-t border-blue-100 relative z-10 mt-2">
                    <div
                        className="flex items-center mr-5 hover:text-indigo-500 transition-colors cursor-pointer group"
                        onClick={handleLike}
                    >
                        {localIsLiked ? (
                            <FaHeart className="text-red-500 mr-2 group-hover:scale-110 transition-transform" />
                        ) : (
                            <FaRegHeart className="mr-2 group-hover:scale-110 transition-transform" />
                        )}
                        <span className="font-medium">{localLikeCount}</span>
                    </div>
                    <div className="flex items-center mr-5 hover:text-indigo-500 transition-colors cursor-pointer group">
                        <FaRegComment className="mr-2 group-hover:scale-110 transition-transform" />
                        <span className="font-medium">{commentCount}</span>
                    </div>
                    <div className="ml-auto flex gap-3">
                        <button
                            className="text-gray-500 hover:text-red-500 transition-colors"
                            onClick={handleReport}
                            title="Báo cáo bài viết"
                        >
                            <FaFlag className="hover:scale-110 transition-transform" />
                        </button>
                        <button
                            className="text-gray-500 hover:text-indigo-500 transition-colors"
                            onClick={handleShare}
                            title="Chia sẻ bài viết"
                        >
                            <FaShareAlt className="hover:scale-110 transition-transform" />
                        </button>
                        <button
                            className={`${localIsBookmarked ? 'text-blue-500' : 'text-gray-500'} hover:text-blue-600 transition-colors`}
                            onClick={handleToggleBookmark}
                        >
                            {localIsBookmarked ? (
                                <FaBookmark className="hover:scale-110 transition-transform" />
                            ) : (
                                <FaRegBookmark className="hover:scale-110 transition-transform" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Report Modal */}
            <ReportPostModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                postId={postId}
                postTitle={title}
            />
        </>
    );
};

export default PostCard;

const getFileType = (url: string): string => {
    const extension = url.split('.').pop()?.toLowerCase();

    if (extension === 'pdf') return 'pdf';
    if (['doc', 'docx'].includes(extension || '')) return 'word';
    if (['xls', 'xlsx'].includes(extension || '')) return 'excel';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(extension || '')) return 'image';

    return 'other';
};