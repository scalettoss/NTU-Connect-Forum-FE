import clientApi from "@/lib/ClientApi";
import adminApi from "@/lib/AdminApi";
import { PaginationRequestType, PaginationResponseType } from "@/types/PaginationType";
import { CreatePostRequestType, PostDetailResponseType, PostResponseType, UpdatePostByAdminRequestType } from "@/types/PostType";


export const getPreviewPost = async (sortBy?: string) => {
    const url = sortBy ? `/post/latest-posts?sortBy=${sortBy}` : '/post/latest-posts';
    return await clientApi.get<PostResponseType[]>(url);
};

export const getAllPostByCategory = async (slug: string, pagination?: PaginationRequestType) => {
    return await clientApi.get<PaginationResponseType<PostResponseType>>(`/post/get-by-category/${slug}`, pagination);
};

export const getPostDetail = async (id: string) => {
    return await clientApi.get<PostResponseType>(`/post/${id}`);
};

export const getPostDetailBySlug = async (postSlug: string) => {
    return await clientApi.get<PostResponseType>(`/post/slug/${postSlug}`);
};

export const createPost = async (formData: FormData) => {
    return await clientApi.post<PostResponseType>('/post', formData, true);
};

export const updatePostByAdmin = async (postId: number, data: UpdatePostByAdminRequestType) => {
    return await adminApi.put<PostResponseType>(`/post/by-admin/${postId}`, data);
};

export const deletePost = async (postId: number) => {
    return await clientApi.delete<void>(`/post/${postId}`);
};

export const getAuthorIdByPostId = async (postId: number) => {
    return await clientApi.get<number>(`/post/author/${postId}`);
};

export const getPostDetailByAdmin = async (postId: number) => {
    const response = await adminApi.get<PostDetailResponseType>(`/post/by-admin/${postId}`);
    //@ts-ignore
    return response.data;
};

