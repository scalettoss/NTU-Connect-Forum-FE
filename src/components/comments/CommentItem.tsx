"use client"
import { FC, useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from "next/link";
import {
    FaHeart, FaRegHeart, FaTrash, FaEllipsisV,
    FaReply, FaPaperclip, FaSmile, FaTimes, FaExclamationTriangle,
    FaPen, FaSave, FaFile
} from 'react-icons/fa';
import { CommentResponseType } from '@/types/CommentType';
import { getImagesFromUrl } from '@/helper/GetImagesHelper';
import { formatRelativeTime } from '@/helper/DateHelper';
import { getFileType, getFileName, categorizeFileUrls } from '@/helper/FileHelper';
import { deleteComment, updateComment, createComment } from '@/services/CommentService';
import { toggleLike } from '@/services/LikeService';
import FileIcon from '@/components/common/FileIcon';
import { getUserInfoFromTokenClient } from '@/helper/UserTokenHelper';
import { getFileFromUrl } from '@/helper/GetUrlFileHelper';
import { createNotification } from '@/services/NotificationService';
import ToastService from '@/services/ToastService';

interface EnrichedCommentType extends CommentResponseType {
    replies?: EnrichedCommentType[];
}

interface CommentItemProps {
    comment: EnrichedCommentType;
    postId: number;
    onCommentDeleted?: (commentId: number) => void;
    currentUserName?: string;
    currentUserAvatar?: string;
    currentUserId?: number;
    isReply?: boolean;
    parentComment?: EnrichedCommentType;
}

const CommentItem: FC<CommentItemProps> = ({
    comment,
    postId,
    onCommentDeleted,
    currentUserName = '',
    currentUserAvatar = '',
    currentUserId,
    isReply = false,
    parentComment,
}) => {
    const [localIsLiked, setLocalIsLiked] = useState(comment.isLiked);
    const [localLikeCount, setLocalLikeCount] = useState(comment.likeCount);
    const [showOptions, setShowOptions] = useState(false);
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    // Edit state
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);
    const [isUpdating, setIsUpdating] = useState(false);
    // Reply state
    const [replyContent, setReplyContent] = useState('');
    const [isSubmittingReply, setIsSubmittingReply] = useState(false);
    const [replyFiles, setReplyFiles] = useState<File[]>([]);
    // Refs
    const menuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const editInputRef = useRef<HTMLTextAreaElement>(null);
    const replyInputRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Constants for file upload
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    const MAX_FILES = 5;
    const ALLOWED_FILE_TYPES = [
        ".jpg", ".jpeg", ".png", ".pdf", ".docx", ".txt",
        ".xlsx", ".pptx", ".mp3", ".gif"
    ];

    // Xử lý fileUrls nếu có
    const fileUrls = (comment as any).fileUrls || [];
    const { imageUrls, documentUrls } = categorizeFileUrls(fileUrls);

    const formattedTime = formatRelativeTime(comment.createdAt);
    const isCurrentUserComment = comment.userId === currentUserId;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current &&
                !menuRef.current.contains(event.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node)) {
                setShowOptions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showOptions]);

    // Handle escape key to close modals
    useEffect(() => {
        const handleEscKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setShowOptions(false);
                setShowDeleteModal(false);
                if (isEditing) {
                    cancelEdit();
                }
            }
        };

        document.addEventListener('keydown', handleEscKey);
        return () => {
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [isEditing]);

    // Focus on edit textarea when editing is enabled
    useEffect(() => {
        if (isEditing && editInputRef.current) {
            editInputRef.current.focus();
            const length = editInputRef.current.value.length;
            editInputRef.current.setSelectionRange(length, length);
        }
    }, [isEditing]);

    // Add event listener for clicking outside the delete modal
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                setShowDeleteModal(false);
            }
        };

        if (showDeleteModal) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showDeleteModal]);

    const handleLike = async () => {
        try {
            // Call the API to toggle like
            await toggleLike({ commentId: comment.commentId });
            setLocalIsLiked(!localIsLiked);
            setLocalLikeCount((prev: number) => localIsLiked ? prev - 1 : prev + 1);
        } catch (error) {
            console.error("Error toggling like:", error);
        }
    };

    const toggleOptions = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowOptions(!showOptions);
    };

    const toggleReplyForm = () => {
        setShowReplyForm(!showReplyForm);
        // Reset reply content when toggling form
        if (!showReplyForm) {
            setReplyContent('');
        }
        // Focus on reply textarea when opening form
        setTimeout(() => {
            if (!showReplyForm && replyInputRef.current) {
                replyInputRef.current.focus();
            }
        }, 100);
    };

    const handleDeleteClick = () => {
        setShowOptions(false);
        setShowDeleteModal(true);
    };

    const handleEditClick = () => {
        setShowOptions(false);
        setIsEditing(true);
        setEditContent(comment.content);
    };

    const cancelEdit = () => {
        setIsEditing(false);
        setEditContent(comment.content);
    };

    const handleEditKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // Submit update with Ctrl + Enter or Cmd + Enter
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            handleSaveEdit();
        }
        // Cancel edit with Escape
        else if (e.key === 'Escape') {
            cancelEdit();
        }
    };

    const handleSaveEdit = async () => {
        if (!editContent.trim() || isUpdating) return;

        try {
            setIsUpdating(true);
            const token = getUserInfoFromTokenClient();
            if (token) {
                const userId = token.id;
                await updateComment(comment.commentId, {
                    content: editContent.trim(),
                    userId: userId
                });
                comment.content = editContent.trim();
                // Exit edit mode
                setIsEditing(false);
                // Show success toast
            }


        } catch (error) {
            console.error("Error updating comment:", error);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteModal(false);
    };

    const handleConfirmDelete = async () => {
        if (!onCommentDeleted) return;

        try {
            setIsDeleting(true);
            const token = getUserInfoFromTokenClient();
            if (token) {
                const userId = token.id;
                await deleteComment({
                    id: comment.commentId,
                    userId: userId
                });
                setShowDeleteModal(false);
                onCommentDeleted(comment.commentId);
            }
        } catch (error) {
            console.error("Error deleting comment:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleReplyKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // Submit reply with Ctrl + Enter or Cmd + Enter
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            handleSubmitReply();
        }
        // Cancel reply with Escape
        else if (e.key === 'Escape') {
            toggleReplyForm();
        }
    };

    const handleReplyFileClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);

        if (selectedFiles.length + replyFiles.length > MAX_FILES) {
            ToastService.warning(`Bạn chỉ có thể tải lên tối đa ${MAX_FILES} tệp`);
            return;
        }

        // Validate file types and sizes
        const invalidFiles: string[] = [];
        const validFiles: File[] = [];

        selectedFiles.forEach(file => {
            const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

            if (!ALLOWED_FILE_TYPES.includes(fileExtension)) {
                invalidFiles.push(`${file.name} (định dạng không được hỗ trợ)`);
            } else if (file.size > MAX_FILE_SIZE) {
                invalidFiles.push(`${file.name} (vượt quá 10MB)`);
            } else {
                validFiles.push(file);
            }
        });

        if (invalidFiles.length > 0) {
            ToastService.error(`Các tệp không hợp lệ: ${invalidFiles.join(', ')}`);
        }

        if (validFiles.length > 0) {
            setReplyFiles(prevFiles => [...prevFiles, ...validFiles]);
        }

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeFile = (index: number) => {
        setReplyFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    };

    const handleSubmitReply = async () => {
        if (!replyContent.trim() || isSubmittingReply || !currentUserId) return;

        try {
            setIsSubmittingReply(true);

            const formData = new FormData();
            formData.append('content', replyContent.trim());
            formData.append('postId', postId.toString());
            formData.append('replyTo', comment.commentId.toString());

            // Append files
            for (let i = 0; i < replyFiles.length; i++) {
                formData.append('files', replyFiles[i]);
            }

            await createComment(formData);

            await createNotification({
                userId: comment.userId,
                type: "Mention",
                postId: postId,
                commentId: comment.commentId
            });

            setShowReplyForm(false);
            setReplyContent('');
            setReplyFiles([]);

            if (onCommentDeleted) {
                onCommentDeleted(-1);
            }
        } catch (error) {
            console.error("Error submitting reply:", error);
            ToastService.error("Không thể gửi bình luận. Vui lòng thử lại sau.");
        } finally {
            setIsSubmittingReply(false);
        }
    };

    if (comment.isDeleted) {
        return (
            <div className="mt-4">
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-gray-400 text-sm italic">Bình luận này đã bị xóa</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className={`mt-${isReply ? '2' : '4'} relative`}>
                {/* Comment connector dot */}
                <div className={`absolute left-[-24px] top-4 ${isReply ? 'w-2 h-2 bg-indigo-200' : 'w-3 h-3 bg-gradient-to-r from-blue-400 to-indigo-500 shadow-md'} rounded-full z-10`}></div>
                <div className={`bg-white ${isReply ? 'bg-opacity-95' : ''} rounded-lg ${isReply ? 'p-3' : 'p-4'} border transition-all duration-300 ${showReplyForm || isEditing
                    ? 'border-indigo-300 shadow-md ring-1 ring-indigo-100'
                    : isReply
                        ? 'border-indigo-100 shadow-sm hover:shadow-md hover:border-indigo-200'
                        : 'border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-200'}`}>
                    <div className="flex">
                        {/* Chỉ hiển thị avatar lớn bên trái */}
                        <div className={`w-${isReply ? '7' : '9'} h-${isReply ? '7' : '9'} relative mr-3 flex-shrink-0`}>
                            {/* Add error handling for avatar image */}
                            {(() => {
                                try {
                                    const avatarSrc = comment.avatarUrl ? getImagesFromUrl(comment.avatarUrl) : '';
                                    // Check if this is the current user's avatar
                                    const isCurrentUser = comment.userId === currentUserId;
                                    const profileUrl = isCurrentUser ? '/home/profile' : `/home/profile/${comment.userId}`;

                                    return (
                                        <Link href={profileUrl} className="w-full h-full rounded-full overflow-hidden block cursor-pointer">
                                            {avatarSrc ? (
                                                <Image
                                                    src={avatarSrc}
                                                    alt={comment.fullName}
                                                    fill
                                                    className="rounded-full object-cover ring-2 ring-indigo-100 transition-all duration-300 hover:ring-indigo-300"
                                                    onError={() => {
                                                        // If image fails to load, this will catch the error
                                                        console.log("Avatar image failed to load");
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-indigo-500 text-white font-bold text-lg rounded-full">
                                                    {comment.fullName ? comment.fullName.charAt(0).toUpperCase() : 'U'}
                                                </div>
                                            )}
                                        </Link>
                                    );
                                } catch (error) {
                                    console.error("Error rendering avatar:", error);
                                    return (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-indigo-500 text-white font-bold text-lg rounded-full">
                                            {comment.fullName ? comment.fullName.charAt(0).toUpperCase() : 'U'}
                                        </div>
                                    );
                                }
                            })()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between flex-wrap">
                                <div className="flex items-center group">
                                    {/* Loại bỏ avatar nhỏ trùng lặp trong phần header */}
                                    <div className="flex flex-wrap items-center">
                                        <Link
                                            href={comment.userId === currentUserId ? 'home/profile' : `/home/profile/${comment.userId}`}
                                            className={`font-semibold text-gray-800 text-${isReply ? 'xs' : 'sm'} mr-1.5 group-hover:text-indigo-600 transition-colors duration-300 hover:underline`}
                                        >
                                            {comment.fullName}
                                        </Link>
                                        {isReply && parentComment && (
                                            <span className="text-xs text-gray-500 mr-1.5 bg-gray-100 px-1.5 py-0.5 rounded-full">• Đã phản hồi</span>
                                        )}
                                        <div className="flex items-center space-x-1.5">
                                            <span className="text-gray-500 text-xs flex items-center">
                                                <span className="inline-block w-1 h-1 bg-gray-300 rounded-full mx-1"></span>
                                                {formattedTime}
                                            </span>
                                            {/* Hiển thị thông báo đã chỉnh sửa nếu có updatedAt */}
                                            {comment.updatedAt && (
                                                <span className="text-xs text-gray-400 italic flex items-center bg-gray-50 px-1.5 py-0.5 rounded-full" title={new Date(comment.updatedAt).toLocaleString()}>
                                                    <span className="inline-block w-1 h-1 bg-gray-300 rounded-full mr-1"></span>
                                                    (đã chỉnh sửa)
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Menu Options */}
                                {isCurrentUserComment && (
                                    <div className="relative">
                                        <button
                                            ref={buttonRef}
                                            onClick={toggleOptions}
                                            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-all duration-200"
                                            aria-label="Comment options"
                                        >
                                            <FaEllipsisV size={12} />
                                        </button>

                                        {/* Dropdown menu */}
                                        {showOptions && (
                                            <div
                                                ref={menuRef}
                                                className="absolute right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50 animate-scaleIn overflow-hidden"
                                            >
                                                {/* Edit option */}
                                                <button
                                                    onClick={handleEditClick}
                                                    className="flex items-center w-full px-4 py-2 text-sm text-left text-indigo-500 hover:bg-indigo-50 rounded-t-lg transition-colors whitespace-nowrap border-b border-gray-100"
                                                >
                                                    <FaPen className="mr-2" size={12} />
                                                    <span>Chỉnh sửa</span>
                                                </button>

                                                {/* Delete option */}
                                                <button
                                                    onClick={handleDeleteClick}
                                                    className="flex items-center w-full px-4 py-2 text-sm text-left text-red-500 hover:bg-red-50 rounded-b-lg transition-colors whitespace-nowrap"
                                                >
                                                    <FaTrash className="mr-2" size={12} />
                                                    <span>Xóa bình luận</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Hiển thị thông tin người được trả lời nếu có */}
                            {isReply && parentComment && (
                                <div className="flex items-center mb-2 bg-gradient-to-r from-indigo-50/80 to-blue-50/90 rounded-lg px-3 py-1.5 border border-indigo-100/70 shadow-sm mt-2 hover:border-indigo-200 transition-all duration-200">
                                    <Link
                                        href={parentComment.userId === currentUserId ? 'home/profile' : `/home/profile/${parentComment.userId}`}
                                        className="flex items-center"
                                    >
                                        <div className="w-5 h-5 relative mr-1.5 flex-shrink-0">
                                            {parentComment.avatarUrl ? (
                                                <div className="w-full h-full rounded-full overflow-hidden ring-1 ring-indigo-200 shadow-sm">
                                                    <Image
                                                        src={getImagesFromUrl(parentComment.avatarUrl)}
                                                        alt={parentComment.fullName}
                                                        fill
                                                        className="rounded-full object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-indigo-500 text-white font-bold text-[8px] rounded-full ring-1 ring-indigo-200">
                                                    {parentComment.fullName.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-xs flex items-center text-gray-600">
                                            <span className="mr-1">Trả lời</span>
                                            <span className="font-medium text-indigo-700 bg-indigo-50/90 px-1.5 py-0.5 rounded-full hover:underline">{parentComment.fullName}</span>
                                        </span>
                                    </Link>
                                </div>
                            )}

                            {/* Comment content or edit form */}
                            {isEditing ? (
                                <div className="mt-2 mb-3">
                                    <textarea
                                        ref={editInputRef}
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        onKeyDown={handleEditKeyPress}
                                        className="w-full min-h-[80px] px-3 py-2.5 bg-white border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                    />
                                    <div className="flex items-center justify-end mt-2 gap-2">
                                        <div className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg mr-auto">
                                            <span>Ctrl + Enter để lưu</span>
                                        </div>
                                        <button
                                            onClick={cancelEdit}
                                            className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md text-xs transition-colors flex items-center gap-1"
                                        >
                                            <FaTimes size={10} />
                                            Hủy
                                        </button>
                                        <button
                                            onClick={handleSaveEdit}
                                            disabled={!editContent.trim() || isUpdating}
                                            className={`px-3 py-1.5 rounded-md text-xs transition-colors flex items-center gap-1.5
                                                ${!editContent.trim() || isUpdating
                                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                    : 'bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white'
                                                }`}
                                        >
                                            {isUpdating ? (
                                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <FaSave size={10} />
                                            )}
                                            {isUpdating ? 'Đang lưu...' : 'Lưu'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p className={`text-gray-700 text-sm mt-1 whitespace-pre-line break-words ${showReplyForm ? 'bg-indigo-50/50 p-2 rounded border-l-2 border-indigo-300' : ''
                                    }`}>
                                    {(() => {
                                        try {
                                            return comment.content || '';
                                        } catch (error) {
                                            console.error("Error rendering content:", error);
                                            return "Content unavailable";
                                        }
                                    })()}
                                </p>
                            )}

                            {/* Media section - Images */}
                            {imageUrls && imageUrls.length > 0 && (
                                <div className="mt-2">
                                    <div className={`flex flex-wrap gap-1.5 ${imageUrls.length > 4 ? 'max-h-[300px] overflow-y-auto pr-2' : ''}`}>
                                        {imageUrls.slice(0, 10).map((url, index) => (
                                            <div
                                                key={`img-${comment.commentId}-${index}`}
                                                className={`relative rounded-lg overflow-hidden border border-indigo-100 shadow-sm hover:shadow-md transition-all duration-300 hover:border-indigo-300 
                                                    ${imageUrls.length === 1 ? 'w-52 h-44' : 'w-24 h-24'}`}
                                            >
                                                <div className="absolute inset-0">
                                                    <Image
                                                        src={getImagesFromUrl(url)}
                                                        alt={`Ảnh ${index + 1}`}
                                                        fill
                                                        className="object-cover hover:opacity-90 transition-opacity cursor-pointer"
                                                        sizes="(max-width: 640px) 100px, 200px"
                                                        onClick={() => window.open(getImagesFromUrl(url), '_blank')}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                        {imageUrls.length > 10 && (
                                            <div className="flex items-center justify-center w-24 h-24 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-100 shadow-sm">
                                                <span className="text-indigo-500 text-sm font-medium">+{imageUrls.length - 10}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Media section - Documents */}
                            {documentUrls && documentUrls.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                    {documentUrls.slice(0, 3).map((url, index) => {
                                        const fileType = getFileType(url);
                                        const fileName = getFileName(url);
                                        const shortName = fileName.length > 15
                                            ? fileName.substring(0, 12) + '...' + fileName.substring(fileName.lastIndexOf('.'))
                                            : fileName;

                                        return (
                                            <a
                                                key={`doc-${comment.commentId}-${index}`}
                                                href={getFileFromUrl(url)}
                                                download
                                                className="flex items-center py-1 px-2.5 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-100 hover:border-indigo-300 hover:shadow-sm transition-all duration-200 text-xs group"
                                                title={fileName}
                                                target="_blank"
                                            >
                                                <FileIcon fileType={fileType} />
                                                <span className="ml-1.5 text-gray-700 max-w-[100px] truncate group-hover:text-indigo-700 transition-colors">
                                                    {shortName}
                                                </span>
                                            </a>
                                        );
                                    })}
                                    {documentUrls.length > 3 && (
                                        <div className="py-1 px-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-indigo-100 text-xs text-indigo-500 font-medium shadow-sm">
                                            +{documentUrls.length - 3} tệp khác
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Comment actions - Don't show during editing */}
                            {!isEditing && (
                                <div className="flex items-center justify-between mt-2">
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={handleLike}
                                            className={`flex items-center px-2 py-1 rounded-md text-xs font-medium transition-colors ${localIsLiked
                                                ? 'text-red-500 bg-red-50 hover:bg-red-100'
                                                : 'text-gray-500 hover:text-red-500 hover:bg-red-50'
                                                }`}
                                        >
                                            {localIsLiked ? (
                                                <FaHeart className="mr-1" size={12} />
                                            ) : (
                                                <FaRegHeart className="mr-1" size={12} />
                                            )}
                                            <span>{localLikeCount > 0 ? localLikeCount : ''} {localLikeCount > 0 ? 'Thích' : 'Thích'}</span>
                                        </button>
                                        <button
                                            onClick={toggleReplyForm}
                                            className="flex items-center px-2 py-1 text-gray-500 hover:text-indigo-500 hover:bg-indigo-50 rounded-md text-xs font-medium transition-colors"
                                        >
                                            <FaReply className="mr-1" size={12} />
                                            <span>Trả lời</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Reply form */}
                            {showReplyForm && (
                                <div className="mt-3 relative">
                                    {/* Connection line between comment and reply form */}
                                    <div className="absolute left-4 -top-2 w-0.5 h-4 bg-gradient-to-b from-transparent to-indigo-300 animate-expandVertical"></div>

                                    <div className="bg-gradient-to-r from-indigo-50/70 to-blue-50/70 rounded-lg p-3 border border-blue-100 animate-fadeIn">
                                        <div className="flex items-start gap-2.5">
                                            <div className="w-8 h-8 relative flex-shrink-0 rounded-full overflow-hidden shadow-sm">
                                                {currentUserId && (
                                                    <Link href="/profile" className="block w-full h-full">
                                                        {currentUserAvatar ? (
                                                            <Image
                                                                src={getImagesFromUrl(currentUserAvatar)}
                                                                alt={currentUserName || "Your avatar"}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        ) : (
                                                            <div className="bg-gradient-to-br from-blue-400 to-indigo-500 w-full h-full flex items-center justify-center text-white font-bold text-xs">
                                                                {(currentUserName || 'U').charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                    </Link>
                                                )}
                                            </div>
                                            <div className="flex-1 relative">
                                                <textarea
                                                    ref={replyInputRef}
                                                    value={replyContent}
                                                    onChange={(e) => setReplyContent(e.target.value)}
                                                    onKeyDown={handleReplyKeyPress}
                                                    placeholder={`Trả lời ${comment.fullName}...`}
                                                    className="w-full min-h-[60px] px-3 py-2.5 bg-white border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                                />

                                                {/* Display selected files */}
                                                {replyFiles.length > 0 && (
                                                    <div className="mt-2 space-y-2">
                                                        <div className="text-xs font-medium text-indigo-600 mb-1">
                                                            Tệp đính kèm ({replyFiles.length}/{MAX_FILES})
                                                        </div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {replyFiles.map((file, index) => {
                                                                const fileType = file.type.split('/')[0];
                                                                const isImage = fileType === 'image';

                                                                return (
                                                                    <div
                                                                        key={`file-${index}`}
                                                                        className="relative group bg-indigo-50 border border-indigo-100 rounded-md p-1.5 flex items-center hover:border-indigo-300 transition-colors"
                                                                    >
                                                                        <div className="flex items-center">
                                                                            {isImage ? (
                                                                                <div className="w-8 h-8 relative mr-2 rounded-md overflow-hidden bg-white">
                                                                                    <Image
                                                                                        src={URL.createObjectURL(file)}
                                                                                        alt={file.name}
                                                                                        fill
                                                                                        className="object-cover"
                                                                                    />
                                                                                </div>
                                                                            ) : (
                                                                                <div className="w-8 h-8 flex items-center justify-center mr-2 rounded-md bg-indigo-100 text-indigo-600">
                                                                                    <FaFile size={16} />
                                                                                </div>
                                                                            )}
                                                                            <div>
                                                                                <p className="text-xs font-medium text-gray-700 max-w-[90px] truncate">
                                                                                    {file.name}
                                                                                </p>
                                                                                <p className="text-[10px] text-gray-500">
                                                                                    {(file.size / 1024).toFixed(1)} KB
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => removeFile(index)}
                                                                            className="ml-1 p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50"
                                                                        >
                                                                            <FaTimes size={10} />
                                                                        </button>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-between mt-2">
                                                    <div className="flex gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={handleReplyFileClick}
                                                            className={`p-1.5 rounded-full transition-colors relative
                                                                ${replyFiles.length >= MAX_FILES
                                                                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                                                                    : 'text-gray-500 hover:text-indigo-600 hover:bg-white'
                                                                }`}
                                                            disabled={replyFiles.length >= MAX_FILES}
                                                            title={replyFiles.length >= MAX_FILES
                                                                ? `Đã đạt số lượng tệp tối đa (${MAX_FILES})`
                                                                : 'Thêm tệp đính kèm'
                                                            }
                                                        >
                                                            <FaPaperclip size={14} />
                                                            <input
                                                                ref={fileInputRef}
                                                                type="file"
                                                                multiple
                                                                onChange={handleFileChange}
                                                                accept={ALLOWED_FILE_TYPES.join(',')}
                                                                className="hidden"
                                                                disabled={replyFiles.length >= MAX_FILES}
                                                            />
                                                        </button>
                                                        <button className="text-gray-500 hover:text-indigo-600 p-1.5 rounded-full hover:bg-white transition-colors">
                                                            <FaSmile size={14} />
                                                        </button>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={toggleReplyForm}
                                                            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md text-xs transition-colors flex items-center gap-1"
                                                        >
                                                            <FaTimes size={10} />
                                                            Hủy
                                                        </button>
                                                        <button
                                                            onClick={handleSubmitReply}
                                                            disabled={!replyContent.trim() || isSubmittingReply}
                                                            className={`px-3 py-1 rounded-md text-xs transition-colors flex items-center gap-1.5 ${!replyContent.trim() || isSubmittingReply
                                                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                                : 'bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white'
                                                                }`}
                                                        >
                                                            {isSubmittingReply ? (
                                                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                            ) : (
                                                                <FaReply size={10} />
                                                            )}
                                                            {isSubmittingReply ? 'Đang gửi...' : 'Gửi phản hồi'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm animate-fadeIn">
                    <div
                        ref={modalRef}
                        className="bg-white rounded-lg shadow-md p-4 max-w-xs w-full mx-4 border border-red-100 animate-scaleIn"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <div className="bg-red-100 p-1.5 rounded-full">
                                <FaExclamationTriangle className="text-red-500" size={14} />
                            </div>
                            <h3 className="text-base font-semibold text-gray-800">Xác nhận xóa</h3>
                        </div>

                        <p className="text-gray-600 text-sm mb-4">
                            Bạn có chắc chắn muốn xóa bình luận này?
                        </p>

                        <div className="flex gap-2 justify-end items-center">
                            <button
                                onClick={handleCancelDelete}
                                className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm rounded-md transition-colors"
                                disabled={isDeleting}
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm rounded-md transition-colors flex items-center gap-1.5"
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <>
                                        <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Đang xóa</span>
                                    </>
                                ) : (
                                    <>
                                        <FaTrash size={12} />
                                        <span>Xóa</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CommentItem; 