"use client"
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { NotificationType } from '@/types/NotificationType';
import { getNotificationsByUser } from '@/services/NotificationService';

interface NotificationContextProps {
    notifications: NotificationType[];
    unreadCount: number;
    refreshNotifications: () => Promise<void>;
    markAllAsRead: () => void;
    markAsRead: (notificationId: number) => void;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const [notifications, setNotifications] = useState<NotificationType[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const refreshNotifications = async () => {
        try {
            const data = await getNotificationsByUser();
            if (data) {
                setNotifications(data);
                const unread = data.filter(notification => !notification.isRead).length;
                setUnreadCount(unread);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    // Đánh dấu 1 thông báo đã đọc
    const markAsRead = (notificationId: number) => {
        // Cập nhật UI trước
        setNotifications(prev =>
            prev.map(notification =>
                notification.notificationId === notificationId
                    ? { ...notification, isRead: true }
                    : notification
            )
        );

        // Cập nhật số lượng chưa đọc
        setUnreadCount(prev => Math.max(0, prev - 1));

        // Ở đây bạn có thể gọi API để cập nhật trạng thái đã đọc trên server nếu cần
        // Ví dụ: markNotificationAsRead(notificationId)
    };

    // Đánh dấu tất cả thông báo đã đọc
    const markAllAsRead = () => {
        // Cập nhật UI
        setNotifications(prev =>
            prev.map(notification => ({ ...notification, isRead: true }))
        );

        // Đặt số lượng chưa đọc về 0
        setUnreadCount(0);

        // Ở đây bạn có thể gọi API để cập nhật trạng thái đã đọc trên server nếu cần
        // Ví dụ: markAllNotificationsAsRead()
    };

    // Lấy thông báo khi component được mount
    useEffect(() => {
        refreshNotifications();
    }, []);

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            refreshNotifications,
            markAsRead,
            markAllAsRead
        }}>
            {children}
        </NotificationContext.Provider>
    );
}; 