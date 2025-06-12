"use client"
import { FC, useState, useEffect, useRef } from 'react';
import { getCommentsByPostId, createComment } from '@/services/CommentService';
import { CommentResponseType as CommentType, CreateCommentRequestType } from '@/types/CommentType';
import { getImagesFromUrl } from '@/helper/GetImagesHelper';
import {
    FaRegComment,
    FaSort,
    FaArrowUp,
    FaArrowDown,
    FaPaperPlane,
    FaChevronLeft,
    FaChevronRight,
    FaPaperclip,
    FaImage,
    FaFile,
    FaFilePdf,
    FaFileWord,
    FaFileExcel,
    FaTimes
} from 'react-icons/fa';
import CommentItem from '@/components/comments/CommentItem';
import Image from 'next/image';
import { getUserFromTokenClient } from '@/helper/UserTokenHelper';
import { Toaster, toast } from 'react-hot-toast';
import { createNotification } from '@/services/NotificationService';
import { getAuthorIdByPostId } from '@/services/PostService';

interface CommentSectionProps {
    postId: number;
}

// Định nghĩa interface cho thông tin người dùng
interface UserInfo {
    fullName: string;
    avatarUrl: string;
    userId: number;
}

const CommentSection: FC<CommentSectionProps> = ({ postId }) => {
    // State for comments
    const [comments, setComments] = useState<CommentType[]>([]);
    const [totalComments, setTotalComments] = useState(0);
    const [commentPage, setCommentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [sortOrder, setSortOrder] = useState<'popular' | 'newest' | 'oldest'>('popular');
    const [isLoadingComments, setIsLoadingComments] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [hasMoreComments, setHasMoreComments] = useState(false);

    // State for comment form
    const [commentText, setCommentText] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);

    // State cho thông tin người dùng
    const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
    const [isLoadingUser, setIsLoadingUser] = useState(true);

    // Add state for handling files
    const [commentFiles, setCommentFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Refs
    const commentInputRef = useRef<HTMLTextAreaElement>(null);
    const commentsListRef = useRef<HTMLDivElement>(null);

    // Lấy thông tin người dùng một lần khi component mount
    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                setIsLoadingUser(true);
                const userResponse = await getUserFromTokenClient();

                if (userResponse) {
                    // @ts-ignore
                    const userData = userResponse.data;
                    setCurrentUser({
                        fullName: userData.fullName,
                        avatarUrl: userData.avatarUrl,
                        userId: userData.userId
                    });
                }
            } catch (error) {
                console.error("Lỗi khi lấy thông tin người dùng:", error);
            } finally {
                setIsLoadingUser(false);
            }
        };

        fetchCurrentUser();
    }, []);

    // Fetch comments when component mounts or when sort order changes
    useEffect(() => {
        // Reset page and comments when sort order changes
        setCommentPage(1);
        setComments([]);
        fetchComments(true);
    }, [postId, sortOrder]);

    // Calculate total comments including nested replies
    const calculateTotalComments = (comments: CommentType[]): number => {
        let total = comments.length;

        // Add counts from nested replies
        for (const comment of comments) {
            if (comment.replies && comment.replies.length > 0) {
                total += calculateTotalComments(comment.replies);
            }
        }

        return total;
    };

    // Fetch all comments
    const fetchComments = async (isReset = false) => {
        if (!postId) return;

        try {
            setIsLoadingComments(true);

            const response = await getCommentsByPostId(Number(postId), {
                PageNumber: isReset ? 1 : commentPage,
                PageSize: 10,
                SortBy: sortOrder
            });

            // @ts-ignore
            const data = response.data;
            if (data) {
                // With the new response format, we can directly use the comments array
                const rootComments = data.items;

                // Combine existing root comments with new ones if not resetting
                const combinedRootComments = isReset
                    ? rootComments
                    : [...comments, ...rootComments.filter(
                        (newComment: CommentType) => !comments.some(
                            existingComment => existingComment.commentId === newComment.commentId
                        )
                    )];

                // Check if we have more comments to load
                setHasMoreComments(commentPage < data.totalPages);

                // Update page number for next load
                setCommentPage(isReset ? 2 : commentPage + 1);

                // Calculate the actual total including all nested replies
                const actualTotal = data.totalCount || calculateTotalComments(combinedRootComments);

                // Update state
                setComments(combinedRootComments);
                setTotalComments(actualTotal);
                setTotalPages(data.totalPages);
            }
        } catch (error) {
            console.error('Lỗi khi tải bình luận:', error);
        } finally {
            setIsLoadingComments(false);
            setIsInitialLoading(false);
        }
    };

    const loadMoreComments = () => {
        fetchComments(false);
    };

    const submitComment = async () => {
        if (!commentText.trim() || submittingComment) return;

        try {
            setSubmittingComment(true);

            // Create a FormData object instead of a plain JS object
            const formData = new FormData();
            formData.append('content', commentText.trim());
            formData.append('postId', postId.toString());

            // Append files if any
            for (let i = 0; i < commentFiles.length; i++) {
                formData.append('files', commentFiles[i]);
            }

            await createComment(formData);

            const author = await getAuthorIdByPostId(postId);

            // @ts-ignore
            const authorId = author.data;

            await createNotification({
                userId: authorId,
                type: "Comment",
                postId: postId,
            });

            // Reset form
            setCommentText('');
            setCommentFiles([]);

            // Reload comments
            setCommentPage(1);
            setComments([]);
            await fetchComments(true);

            // Focus back on input
            if (commentInputRef.current) {
                commentInputRef.current.focus();
            }

        } catch (error) {
            console.error('Lỗi khi gửi bình luận:', error);
            toast.error('Không thể gửi bình luận');
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleCommentDeleted = (commentId: number) => {
        // If commentId is -1, it means we just need to refresh comments (e.g. after adding a reply)
        if (commentId === -1) {
            // Reset and fetch all comments to ensure we have the latest data
            setCommentPage(1);
            setComments([]);
            fetchComments(true);
            return;
        }

        // For specific comment deletion, update our state directly with a recursive function
        const updateCommentsRecursively = (comments: CommentType[]): CommentType[] => {
            return comments.map(comment => {
                // If this is the deleted comment, mark it as deleted
                if (comment.commentId === commentId) {
                    return { ...comment, isDeleted: true };
                }

                // If this comment has replies, process them recursively
                if (comment.replies && comment.replies.length > 0) {
                    return {
                        ...comment,
                        replies: updateCommentsRecursively(comment.replies)
                    };
                }

                return comment;
            });
        };

        // Update comments array
        const updatedComments = updateCommentsRecursively(comments);
        setComments(updatedComments);

        // Update total count
        setTotalComments(prev => Math.max(0, prev - 1));
    };

    const handleCommentKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // Submit comment with Ctrl + Enter or Cmd + Enter
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            submitComment();
        }
    };

    const handleSortChange = (order: 'popular' | 'newest' | 'oldest') => {
        if (order !== sortOrder) {
            setSortOrder(order);
            // Reset to first page when changing sort
            setCommentPage(1);
        }
    };

    // Placeholder text for comment
    const getCommentPlaceholder = (count: number) => {
        if (count === 0) {
            return "Hãy là người đầu tiên bình luận...";
        }
        return "Viết bình luận của bạn...";
    };

    // Render a comment with its nested replies recursively
    const renderCommentWithReplies = (comment: CommentType, index: number, level = 0, parentComment?: CommentType) => {
        return (
            <div key={`comment-thread-${comment.commentId}`} className="comment-thread mb-3">
                {/* Root comment */}
                <div
                    className={`animate-fadeIn transition-opacity duration-300 ${index % 2 === 0 ? 'animation-delay-2000' : 'animation-delay-4000'}`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                >
                    <CommentItem
                        comment={comment}
                        postId={Number(postId)}
                        onCommentDeleted={handleCommentDeleted}
                        currentUserName={currentUser?.fullName}
                        currentUserAvatar={currentUser?.avatarUrl}
                        currentUserId={currentUser?.userId}
                        isReply={level > 0}
                        parentComment={parentComment}
                    />
                </div>

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                    <div className={`replies-container ${level === 0 ? 'ml-8' : 'ml-4'} pl-4 relative`}>
                        {/* Reply connector line */}
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-200 to-blue-100"></div>

                        {/* Render each reply recursively */}
                        {comment.replies.map((reply, replyIndex) => (
                            <div key={`reply-${reply.commentId}`} className="reply-thread">
                                {renderCommentWithReplies(reply, replyIndex, level + 1, comment)}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    // Add file handling functions
    const handleFileClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    // Add a file validation helper
    const validateFile = (file: File): { valid: boolean; message?: string } => {
        // Size validation (15MB limit)
        const maxSize = 15 * 1024 * 1024; // 15MB in bytes
        if (file.size > maxSize) {
            return {
                valid: false,
                message: `File ${file.name} quá lớn. Kích thước tối đa là 15MB.`
            };
        }

        // File type validation if needed
        const allowedTypes = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'application/pdf',
            'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'text/plain'
        ];

        if (!allowedTypes.includes(file.type)) {
            return {
                valid: false,
                message: `File ${file.name} không được hỗ trợ. Vui lòng chọn ảnh, PDF, Word, Excel, PowerPoint hoặc file văn bản.`
            };
        }

        return { valid: true };
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files);

            // Validate each file
            const invalidFiles: string[] = [];
            const validFiles: File[] = [];

            files.forEach(file => {
                const validation = validateFile(file);
                if (validation.valid) {
                    validFiles.push(file);
                } else if (validation.message) {
                    invalidFiles.push(validation.message);
                }
            });

            // Show errors for invalid files
            if (invalidFiles.length > 0) {
                invalidFiles.forEach(message => {
                    toast.error(message);
                });
            }

            // Add valid files to state
            if (validFiles.length > 0) {
                setCommentFiles(prevFiles => [...prevFiles, ...validFiles]);
            }
        }

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeFile = (index: number) => {
        setCommentFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    };

    return (
        <div className="bg-white/95 rounded-xl shadow-lg p-6 mb-10 border border-blue-100 backdrop-blur-md hover:shadow-xl transition-all duration-300 card-shine">
            {/* Toast container for notifications */}
            <Toaster position="top-center" />

            {/* Header with Sort Options */}
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-indigo-100">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <div className="bg-indigo-100 p-2 rounded-lg">
                        <FaRegComment className="text-indigo-500" />
                    </div>
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                        Bình luận ({totalComments})
                    </span>
                </h2>

                {/* Comment Sort Options */}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 hidden sm:inline-block">Sắp xếp:</span>
                    <div className="flex bg-gray-100 rounded-lg p-1 text-sm shadow-sm">
                        <button
                            className={`px-3 py-1.5 rounded-md transition-all duration-200 ${sortOrder === 'popular'
                                ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-inner'
                                : 'text-gray-600 hover:bg-gray-200'}`}
                            onClick={() => handleSortChange('popular')}
                        >
                            <span className="hidden sm:inline">Phổ biến</span>
                            <FaSort className="inline sm:hidden" />
                        </button>
                        <button
                            className={`px-3 py-1.5 rounded-md transition-all duration-200 ${sortOrder === 'newest'
                                ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-inner'
                                : 'text-gray-600 hover:bg-gray-200'}`}
                            onClick={() => handleSortChange('newest')}
                        >
                            <span className="hidden sm:inline">Mới nhất</span>
                            <FaArrowUp className="inline sm:hidden" />
                        </button>
                        <button
                            className={`px-3 py-1.5 rounded-md transition-all duration-200 ${sortOrder === 'oldest'
                                ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-inner'
                                : 'text-gray-600 hover:bg-gray-200'}`}
                            onClick={() => handleSortChange('oldest')}
                        >
                            <span className="hidden sm:inline">Cũ nhất</span>
                            <FaArrowDown className="inline sm:hidden" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Comment Form */}
            <div className="flex items-start mb-8 bg-gradient-to-br from-indigo-50/80 to-blue-50/60 p-5 rounded-xl border border-indigo-100 shadow-sm transition-all duration-300 hover:shadow-md hover:border-indigo-200">
                <div className="w-12 h-12 relative mr-4 flex-shrink-0 transition-transform duration-200 transform hover:scale-105">
                    {isLoadingUser ? (
                        <div className="w-full h-full rounded-full bg-gray-200 animate-pulse"></div>
                    ) : currentUser?.avatarUrl ? (
                        <div className="rounded-full overflow-hidden ring-2 ring-indigo-300 ring-offset-2 shadow-lg">
                            <Image
                                src={getImagesFromUrl(currentUser.avatarUrl)}
                                alt={currentUser.fullName}
                                fill
                                className="rounded-full object-cover hover:opacity-90 transition-opacity"
                            />
                        </div>
                    ) : (
                        <div className="bg-gradient-to-br from-blue-400 to-indigo-500 w-full h-full rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                            {currentUser?.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'G'}
                        </div>
                    )}
                </div>
                <div className="flex-1 relative">
                    <textarea
                        ref={commentInputRef}
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyDown={handleCommentKeyPress}
                        placeholder={getCommentPlaceholder(totalComments)}
                        className="w-full border border-indigo-200 rounded-xl py-3.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 min-h-[120px] resize-none bg-white shadow-sm transition-all duration-200"
                    />

                    {/* File input (hidden) */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        multiple
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                    />

                    {/* Selected files preview */}
                    {commentFiles.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {commentFiles.map((file, index) => (
                                <div
                                    key={`file-${index}`}
                                    className="relative bg-blue-50 rounded-md px-3 py-1.5 flex items-center gap-2 border border-blue-200 group hover:bg-blue-100 transition-colors"
                                >
                                    {file.type.startsWith('image/') ? (
                                        <div className="w-5 h-5 flex-shrink-0 rounded-md bg-blue-100 flex items-center justify-center">
                                            <FaImage className="w-3 h-3 text-blue-500" />
                                        </div>
                                    ) : file.type === 'application/pdf' ? (
                                        <div className="w-5 h-5 flex-shrink-0 rounded-md bg-blue-100 flex items-center justify-center">
                                            <FaFilePdf className="w-3 h-3 text-blue-500" />
                                        </div>
                                    ) : file.type.includes('word') ? (
                                        <div className="w-5 h-5 flex-shrink-0 rounded-md bg-blue-100 flex items-center justify-center">
                                            <FaFileWord className="w-3 h-3 text-blue-500" />
                                        </div>
                                    ) : file.type.includes('excel') || file.type.includes('sheet') ? (
                                        <div className="w-5 h-5 flex-shrink-0 rounded-md bg-blue-100 flex items-center justify-center">
                                            <FaFileExcel className="w-3 h-3 text-blue-500" />
                                        </div>
                                    ) : (
                                        <div className="w-5 h-5 flex-shrink-0 rounded-md bg-blue-100 flex items-center justify-center">
                                            <FaFile className="w-3 h-3 text-blue-500" />
                                        </div>
                                    )}
                                    <span className="text-xs text-gray-700 max-w-[120px] truncate">{file.name}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeFile(index)}
                                        className="absolute -top-1.5 -right-1.5 bg-red-100 text-red-500 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <FaTimes className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Fixed position action buttons */}
                    <div className="absolute bottom-3 right-3 flex gap-2 items-center">
                        {/* File attachment button */}
                        <button
                            type="button"
                            onClick={handleFileClick}
                            className="hover:bg-indigo-50 text-indigo-500 rounded-lg p-1.5 transition-colors"
                            title="Đính kèm tệp"
                        >
                            <FaPaperclip className="w-5 h-5" />
                        </button>

                        {/* File count indicator */}
                        {commentFiles.length > 0 && (
                            <div className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full font-medium">
                                {commentFiles.length} tệp
                            </div>
                        )}

                        <div className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
                            <span className="hidden sm:inline">Ctrl + Enter để gửi</span>
                            <span className="sm:hidden">⌘/Ctrl+↵</span>
                        </div>
                        <button
                            onClick={submitComment}
                            disabled={!commentText.trim() || submittingComment}
                            className={`rounded-xl px-4 py-1.5 flex items-center gap-1.5 font-medium shadow-sm transition-all duration-300 transform hover:scale-105 ${commentText.trim() && !submittingComment
                                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            {submittingComment ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <FaPaperPlane size={12} className={commentText.trim() ? 'text-white' : ''} />
                            )}
                            <span>Gửi</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Comments List */}
            <div ref={commentsListRef}>
                {isInitialLoading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-indigo-600 animate-pulse">Đang tải bình luận...</p>
                    </div>
                ) : comments.length > 0 ? (
                    <>
                        <div className="space-y-0 relative before:absolute before:content-[''] before:w-0.5 before:bg-gradient-to-b before:from-indigo-200 before:to-blue-100 before:left-5 before:top-0 before:bottom-0 before:z-0 ml-5 pl-10 py-4">
                            {comments.map((comment, index) => renderCommentWithReplies(comment, index))}
                        </div>

                        {/* Display comment count info */}
                        <div className="mt-6 text-center text-sm text-gray-500 bg-gray-50 rounded-lg py-2 px-4 inline-block mx-auto shadow-inner">
                            <span>Đã hiển thị {comments.length} / {totalComments} bình luận</span>
                        </div>

                        {/* Load More Button instead of Pagination */}
                        {hasMoreComments && (
                            <div className="mt-6 flex justify-center">
                                <button
                                    onClick={loadMoreComments}
                                    disabled={isLoadingComments}
                                    className={`px-6 py-2 rounded-lg shadow-sm transition-all duration-200 ${isLoadingComments
                                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white hover:shadow-md transform hover:translate-y-[-1px]'
                                        }`}
                                >
                                    {isLoadingComments ? (
                                        <div className="flex items-center justify-center">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                            <span>Đang tải...</span>
                                        </div>
                                    ) : (
                                        'Xem thêm bình luận'
                                    )}
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-8 text-center border border-indigo-100 shadow-inner">
                        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-slow">
                            <FaRegComment className="text-indigo-400" size={24} />
                        </div>
                        <p className="text-indigo-700 font-medium text-lg">Chưa có bình luận nào</p>
                        <p className="text-gray-600 mt-2 mb-4">Hãy là người đầu tiên bình luận về bài viết này</p>
                        <button
                            onClick={() => commentInputRef.current?.focus()}
                            className="bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                        >
                            Viết bình luận đầu tiên
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommentSection; 