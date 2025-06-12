import { CreateAttachmentType, CreateAttachmentForCommentType } from '@/types/AttachmentType';
import clientApi from '@/lib/ClientApi';

export const createAttachmentForComment = async (attachment: CreateAttachmentForCommentType) => {
    const formData = new FormData();
    formData.append('commentId', attachment.commentId.toString());
    formData.append('userId', attachment.userId.toString());


    for (let i = 0; i < attachment.files.length; i++) {
        formData.append('files', attachment.files[i]);
    }

    return await clientApi.post('/attachments', formData, true);
};


