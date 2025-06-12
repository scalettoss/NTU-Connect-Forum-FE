export interface CreateAttachmentType {
    postId: number;
    userId: number;
    files: File[];
}

export interface CreateAttachmentForCommentType {
    commentId: number;
    userId: number;
    files: File[];
}

