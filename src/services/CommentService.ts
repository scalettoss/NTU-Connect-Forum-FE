import clientApi from "@/lib/ClientApi";
import { PaginationRequestType, PaginationResponseType } from "@/types/PaginationType";
import { CreateCommentRequestType, CommentResponseType, DeleteCommentRequestType, UpdateCommentRequestType } from "@/types/CommentType";

export const createComment = async (formData: FormData) => {
    return await clientApi.post<void>('/comment', formData, true);
};

export const getCommentsByPostId = async (postId: number, pagination?: PaginationRequestType) => {
    return await clientApi.get<PaginationResponseType<CommentResponseType>>(`/comment/by-post/${postId}`, pagination);
};

export const deleteComment = async (params: DeleteCommentRequestType) => {
    return await clientApi.delete<void>(`/comment`, {
        params: params
    });
};

export const updateComment = async (commentId: number, comment: UpdateCommentRequestType) => {
    return await clientApi.put<void>(`/comment/${commentId}`, comment);
};
