import { CreateNotificationType, NotificationResponseType, SendSystemNotificationType } from '@/types/NotificationType';
import clientApi from '@/lib/ClientApi';

export const createNotification = async (notification: CreateNotificationType) => {
    return await clientApi.post<void>("/notification", notification)
};

export const getUserNotification = async () => {
    return await clientApi.get<NotificationResponseType[]>(`/notification/user`)
};

export const markNotificationAsRead = async (notificationId: number) => {
    return await clientApi.post<void>(`/notification/mark-read`, { notificationId })
};

export const sendSystemNotification = async (notification: SendSystemNotificationType) => {
    return await clientApi.post<void>(`/notification/system`, notification)
};