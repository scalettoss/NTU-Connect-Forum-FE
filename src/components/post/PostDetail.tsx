"use client"
import { FC, useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PostResponseType } from '@/types/PostType';
import {
    FaHeart, FaRegHeart, FaRegComment, FaShareAlt, FaBookmark as FaBookmarkSolid,
    FaFlag, FaEllipsisV, FaFilePdf, FaFileWord, FaFileExcel,
    FaFileAlt, FaFileImage, FaDownload, FaPaperclip,
    FaHome, FaLayerGroup, FaChevronRight, FaRegBookmark
} from 'react-icons/fa';
import { getImagesFromUrl } from '@/helper/GetImagesHelper';
import '@/styles/animations.css';
import { toggleLike } from '@/services/LikeService';
import { toggleBookmark } from '@/services/BookmarkService';
import { getPostDetailBySlug } from '@/services/PostService';
import { getFileType, getFileName, categorizeFileUrls } from '@/helper/FileHelper';
import { formatRelativeTime } from '@/helper/DateHelper';
import CommentSection from '@/components/comments/CommentSection';
import FileIcon from '@/components/common/FileIcon';
import { getFileFromUrl } from '@/helper/GetUrlFileHelper';
import Breadcrumb from '@/components/common/Breadcrumb';
import ToastService from '@/services/ToastService';

interface PostDetailProps {
    post: PostResponseType;
}

const PostDetail: FC<PostDetailProps> = ({ post }) => {
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
        postSlug,
        isScam,
        isBookmark
    } = post;

    // State for likes and post details
    const [showOptions, setShowOptions] = useState(false);
    const [localIsLiked, setLocalIsLiked] = useState(isLiked);
    const [localLikeCount, setLocalLikeCount] = useState(likeCount);
    // Use isBookmark from response
    const [localIsBookmarked, setLocalIsBookmarked] = useState(isBookmark || false);

    // State for images
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    // Refs
    const menuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    // Use helper function to categorize file URLs
    const { imageUrls, documentUrls } = categorizeFileUrls(fileUrls);

    // Fetch mới dữ liệu từ server khi component mount
    useEffect(() => {
        const refreshPostData = async () => {
            try {
                if (postSlug) {
                    const response = await getPostDetailBySlug(postSlug);
                    if (response) {
                        // @ts-ignore
                        const updatedData = response.data;
                        if (updatedData) {
                            // Cập nhật state với dữ liệu mới từ server
                            setLocalIsLiked(updatedData.isLiked);
                            setLocalLikeCount(updatedData.likeCount);
                            // Update bookmark state from response
                            if (updatedData.isBookmark !== undefined) {
                                setLocalIsBookmarked(updatedData.isBookmark);
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('Error refreshing post data:', error);
            }
        };

        refreshPostData();
    }, [postSlug]);

    // For click outside menu
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

    // Use formatRelativeTime helper instead of inline formatting
    const formattedTime = formatRelativeTime(createdAt);

    const handleReport = () => {
        console.log('Báo cáo bài viết:', postId);
        setShowOptions(false);
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

    // Add bookmark handler
    const handleToggleBookmark = async () => {
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
            ToastService.error('Vui lòng đăng nhập để lưu bài viết');
        }
    };

    const handleShare = async () => {
        try {
            const currentUrl = `${window.location.origin}/home/category/${categorySlug}/${postSlug}`;
            await navigator.clipboard.writeText(currentUrl);
            ToastService.success('Đã sao chép liên kết vào clipboard');
        } catch (error) {
            console.error('Error copying to clipboard:', error);
            ToastService.error('Không thể sao chép liên kết');
        }
    };

    const openImageModal = (url: string) => {
        setSelectedImage(url);
    };

    const closeImageModal = () => {
        setSelectedImage(null);
    };

    return (
        <div className="mx-auto relative">
            {/* Background gradient - making it more visible and enhanced */}
            <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 -z-50"></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-100/40 to-indigo-200/40 rounded-3xl -z-10"></div>
            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-blue-200/30 to-transparent -z-10 rounded-t-3xl"></div>
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-indigo-200/30 to-transparent -z-10 rounded-b-3xl"></div>

            {/* Decorative elements */}
            <div className="absolute top-20 right-10 w-64 h-64 bg-blue-300/10 rounded-full blur-3xl -z-10"></div>
            <div className="absolute bottom-20 left-10 w-64 h-64 bg-indigo-300/10 rounded-full blur-3xl -z-10"></div>

            {selectedImage && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 animate-fadeIn">
                    <div className="relative max-w-5xl w-full h-full flex flex-col items-center justify-center px-4">
                        <button
                            className="absolute top-4 right-4 text-white hover:text-red-500 z-50 bg-black/30 p-2 rounded-full backdrop-blur-sm"
                            onClick={closeImageModal}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <div className="relative w-full h-[70vh] bg-black/20 rounded-xl backdrop-blur-sm">
                            <img
                                src={selectedImage}
                                alt="Enlarged view"
                                className="max-w-full max-h-full object-contain absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                            />
                        </div>

                        {/* Gallery navigation */}
                        <div className="flex justify-center mt-4 gap-2 flex-wrap backdrop-blur-sm bg-black/10 p-3 rounded-xl">
                            {imageUrls.map((url, index) => (
                                <div
                                    key={index}
                                    className={`w-16 h-16 relative rounded-md overflow-hidden cursor-pointer border-2 ${getImagesFromUrl(url) === selectedImage ? 'border-blue-500 shadow-lg scale-110' : 'border-transparent'} transition-all duration-200`}
                                    onClick={() => openImageModal(getImagesFromUrl(url))}
                                >
                                    <Image
                                        src={getImagesFromUrl(url)}
                                        alt={`Thumbnail ${index + 1}`}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Breadcrumb Navigation */}
            <Breadcrumb
                items={[
                    { label: 'Trang chủ', href: '/home' },
                    { label: 'Danh mục', href: '/home/category' },
                    { label: categoryName, href: `/home/category/${categorySlug}` },
                    { label: title, isActive: true }
                ]}
                className="mb-6"
            />

            {/* Post Detail Card */}
            <div className="bg-white/95 rounded-xl shadow-xl p-6 mb-6 border border-blue-100 backdrop-blur-md hover-lift card-shine transition-all duration-300 hover:shadow-blue-200/50">
                {isScam && (
                    <div className="mb-4">
                        <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-1.5 rounded-full font-semibold shadow-md animate-gradient flex items-center w-fit">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span>Lừa đảo</span>
                        </span>
                    </div>
                )}

                {/* Post Header */}
                <div className="flex items-center mb-5 pb-4 border-b border-gray-100">
                    <div className="w-12 h-12 relative mr-4 rounded-full ring-2 ring-blue-200 shadow-md overflow-hidden">
                        <Image
                            src={getImagesFromUrl(avatarUrl)}
                            alt={fullName}
                            fill
                            className="rounded-full object-cover"
                        />
                    </div>
                    <div>
                        <p className="font-semibold text-gray-800 hover:text-indigo-600 transition-colors">{fullName}</p>
                        <p className="text-gray-500 text-xs flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {formattedTime}
                        </p>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        <span className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs px-4 py-1.5 rounded-full font-medium shadow-md animate-gradient">
                            {categoryName}
                        </span>
                        <div className="relative">
                            <button
                                ref={buttonRef}
                                onClick={() => setShowOptions(!showOptions)}
                                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-indigo-50 transition-colors"
                                aria-label="Tùy chọn bài viết"
                            >
                                <FaEllipsisV className="text-indigo-400" />
                            </button>

                            {showOptions && (
                                <div
                                    ref={menuRef}
                                    className="absolute right-0 top-full mt-1 w-44 bg-white shadow-lg rounded-lg overflow-hidden z-20 border border-indigo-100 animate-fadeIn"
                                >
                                    <button
                                        onClick={handleReport}
                                        className="w-full px-4 py-2.5 text-left flex items-center text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        <FaFlag className="mr-2" />
                                        <span>Báo cáo bài viết</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Post Title */}
                <h1 className="text-2xl font-bold mb-5 text-gray-800 bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent leading-tight">{title}</h1>

                {/* Post Content */}
                <div className="prose max-w-none mb-6 text-gray-700 bg-blue-50/50 p-4 rounded-lg border border-blue-100/80">
                    <p>{content}</p>
                </div>

                {/* Images Display */}
                {imageUrls.length > 0 && (
                    <div className="mb-6">
                        <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
                            <FaFileImage className="text-indigo-500 mr-2" />
                            Hình ảnh ({imageUrls.length}):
                        </h3>

                        {/* Hiển thị dạng gallery dựa vào số lượng ảnh */}
                        {imageUrls.length === 1 ? (
                            // Một ảnh: hiển thị đầy đủ, giới hạn chiều cao
                            <div
                                className="cursor-pointer rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all border border-indigo-100 max-w-2xl mx-auto"
                                onClick={() => openImageModal(getImagesFromUrl(imageUrls[0]))}
                            >
                                <div className="relative" style={{ height: '400px' }}>
                                    <Image
                                        src={getImagesFromUrl(imageUrls[0])}
                                        alt="Image"
                                        fill
                                        className="object-contain bg-gray-50"
                                    />
                                </div>
                            </div>
                        ) : imageUrls.length === 2 ? (
                            // Hai ảnh: hiển thị cạnh nhau
                            <div className="grid grid-cols-2 gap-3">
                                {imageUrls.map((url, index) => (
                                    <div
                                        key={index}
                                        className="relative aspect-video rounded-lg overflow-hidden shadow-md cursor-pointer hover:opacity-95 transition-all hover:shadow-lg border border-indigo-100"
                                        onClick={() => openImageModal(getImagesFromUrl(url))}
                                    >
                                        <Image
                                            src={getImagesFromUrl(url)}
                                            alt={`Image ${index + 1}`}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : imageUrls.length === 3 ? (
                            // Ba ảnh: hiển thị 1 ảnh lớn bên trái, 2 ảnh nhỏ bên phải
                            <div className="grid grid-cols-2 gap-3">
                                <div
                                    className="relative aspect-square rounded-lg overflow-hidden shadow-md cursor-pointer hover:opacity-95 transition-all hover:shadow-lg border border-indigo-100 row-span-2"
                                    onClick={() => openImageModal(getImagesFromUrl(imageUrls[0]))}
                                >
                                    <Image
                                        src={getImagesFromUrl(imageUrls[0])}
                                        alt="Main image"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div
                                    className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-md cursor-pointer hover:opacity-95 transition-all hover:shadow-lg border border-indigo-100"
                                    onClick={() => openImageModal(getImagesFromUrl(imageUrls[1]))}
                                >
                                    <Image
                                        src={getImagesFromUrl(imageUrls[1])}
                                        alt="Second image"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div
                                    className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-md cursor-pointer hover:opacity-95 transition-all hover:shadow-lg border border-indigo-100"
                                    onClick={() => openImageModal(getImagesFromUrl(imageUrls[2]))}
                                >
                                    <Image
                                        src={getImagesFromUrl(imageUrls[2])}
                                        alt="Third image"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            </div>
                        ) : (
                            // Hơn 3 ảnh: Hiển thị 4 ảnh đầu tiên với ảnh thứ 4 hiển thị số ảnh còn lại
                            <div className="grid grid-cols-2 gap-3">
                                {imageUrls.slice(0, 3).map((url, index) => (
                                    <div
                                        key={index}
                                        className={`relative rounded-lg overflow-hidden shadow-md cursor-pointer hover:opacity-95 transition-all hover:shadow-lg border border-indigo-100 ${index === 0 ? 'row-span-2 aspect-square' : 'aspect-[4/3]'}`}
                                        onClick={() => openImageModal(getImagesFromUrl(url))}
                                    >
                                        <Image
                                            src={getImagesFromUrl(url)}
                                            alt={`Image ${index + 1}`}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                ))}
                                {imageUrls.length > 3 && (
                                    <div
                                        className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-md cursor-pointer hover:opacity-90 transition-all hover:shadow-lg border border-indigo-100 bg-gray-800"
                                        onClick={() => openImageModal(getImagesFromUrl(imageUrls[3]))}
                                    >
                                        <Image
                                            src={getImagesFromUrl(imageUrls[3])}
                                            alt={`Image 4`}
                                            fill
                                            className="object-cover opacity-70"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-white text-xl font-bold bg-black/50 px-4 py-2 rounded-full">
                                                +{imageUrls.length - 3} ảnh
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Attachments Section */}
                {documentUrls.length > 0 && (
                    <div className="mb-6">
                        <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
                            <FaPaperclip className="text-indigo-500 mr-2" />
                            Tài liệu đính kèm:
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {documentUrls.map((url, index) => {
                                // Using our helper functions for file type and name
                                const fileType = getFileType(url);
                                const fileName = getFileName(url);

                                return (
                                    <div
                                        key={index}
                                        className="flex items-center p-3 bg-indigo-50/60 rounded-lg border border-indigo-100 hover:bg-indigo-100/60 transition-colors shadow-sm"
                                    >
                                        <FileIcon fileType={fileType} />
                                        <div className="ml-3 flex-1 overflow-hidden">
                                            <p className="text-sm font-medium text-gray-700 truncate">{fileName}</p>
                                        </div>
                                        <a
                                            href={getFileFromUrl(url)}
                                            target="_blank"
                                            download
                                            className="ml-2 p-2 text-indigo-600 hover:text-indigo-800 transition-colors bg-white rounded-full shadow-sm hover:shadow-md"
                                        >
                                            <FaDownload size={16} />
                                        </a>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Post Actions */}
                <div className="flex items-center justify-between text-gray-600 pt-4 border-t border-gray-200 mt-4">
                    <div className="flex items-center space-x-4">
                        <div
                            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 cursor-pointer ${localIsLiked
                                ? 'bg-red-50 text-red-500 hover:bg-red-100'
                                : 'bg-gray-100 hover:bg-gray-200'
                                }`}
                            onClick={handleLike}
                        >
                            {localIsLiked ? (
                                <FaHeart className="text-red-500 animate-pulse" />
                            ) : (
                                <FaRegHeart className="transform group-hover:scale-110 transition-transform" />
                            )}
                            <span className="font-medium">{localLikeCount}</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-200">
                            <FaRegComment className="text-indigo-500" />
                            <span className="font-medium">{commentCount}</span>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            className="bg-gray-100 hover:bg-indigo-50 p-2 rounded-full transition-colors flex items-center gap-2 px-4"
                            onClick={handleShare}
                            title="Chia sẻ bài viết"
                        >
                            <FaShareAlt className="text-gray-500" />
                            <span className="text-sm font-medium hidden sm:inline">Chia sẻ</span>
                        </button>
                        <button
                            className={`${localIsBookmarked
                                ? 'bg-blue-50 text-blue-500 hover:bg-blue-100'
                                : 'bg-gray-100 hover:bg-indigo-50'} 
                                p-2 rounded-full transition-colors flex items-center gap-2 px-4`}
                            onClick={handleToggleBookmark}
                        >
                            {localIsBookmarked ? (
                                <FaBookmarkSolid className="text-blue-500" />
                            ) : (
                                <FaRegBookmark className="text-gray-500" />
                            )}
                            <span className="text-sm font-medium hidden sm:inline">
                                {localIsBookmarked ? 'Đã lưu' : 'Lưu'}
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Thêm CommentSection */}
            <CommentSection
                postId={Number(postId)}
            />
        </div>
    );
};

export default PostDetail;
