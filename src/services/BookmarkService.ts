import clientApi from '@/lib/ClientApi';
import { BookmarkResponseType } from '@/types/BookmarkType';

// Lấy tất cả bookmark của user
export const getBookmarksByUser = async (userId: number) => {
    return await clientApi.get<BookmarkResponseType[]>(`/bookmark/user/${userId}`);
};

// Toggle bookmark (thêm/xóa bookmark)
export const toggleBookmark = async (postId: number) => {
    return await clientApi.post(`/bookmark/toggle`, { postId });
}; 