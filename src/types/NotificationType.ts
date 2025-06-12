export interface NotificationResponseType {
    notificationId: number;
    userId: number;
    message: string;
    senderId?: number;
    senderName: string;
    type: string;
    postId?: number;
    commentId?: number;
    createdAt: string;
    isRead: boolean;
    updatedAt?: string;
    postSlug?: string;
    categorySlug?: string;
}

export interface CreateNotificationType {
    userId: number;
    type: string;
    postId?: number;
    commentId?: number;
}

export interface SendSystemNotificationType {
    message: string;
}
