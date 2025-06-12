import { LikeType } from '@/types/LikeType';
import clientApi from '@/lib/ClientApi';

export const toggleLike = async (like: LikeType) => {
    return await clientApi.post<LikeType>("/like/toggle", like);
};
