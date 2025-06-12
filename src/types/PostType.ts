export interface PostResponseType {
    postId: number,
    categoryName: string,
    categorySlug: string,
    postSlug: string,
    title: string,
    content: string,
    isScam: boolean,
    fullName: string,
    avatarUrl: string,
    createdAt: string,
    updatedAt: string,
    isLiked: boolean,
    commentCount: number,
    likeCount: number,
    isBookmark: boolean,
    fileTypes?: string[],
    fileUrls?: string[],
}

export interface CreatePostRequestType {
    title: string,
    content: string,
    categoryId: number,
    files?: string[],
}

export interface PostDetailResponseType {
    postId: number,
    categoryName: string,
    title: string,
    status: string,
    content: string,
    isScam: boolean,
    confidenceScore: number,
    fullName: string,
    avatarUrl: string,
    createdAt: string,
    updatedAt: string,
    fileTypes?: string[],
    fileUrls?: string[],
}

export interface UpdatePostByAdminRequestType {
    title?: string,
    content?: string,
    status?: string,
}