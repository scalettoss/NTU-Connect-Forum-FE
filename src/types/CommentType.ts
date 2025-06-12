export interface CommentResponseType {
    commentId: number,
    content: string,
    userId: number,
    fullName: string,
    avatarUrl: string,
    likeCount: number,
    createdAt: string,
    isLiked: boolean,
    updatedAt?: string,
    isDeleted: boolean,
    fileTypes?: string[],
    fileUrls?: string[],
    replies?: CommentResponseType[],
}

export interface CreateCommentRequestType {
    content: string,
    postId: number,
    replyTo?: number,
    files?: File[],
}

export interface DeleteCommentRequestType {
    id: number,
    userId: number,
}

export interface UpdateCommentRequestType {
    content: string,
    userId: number,
}

