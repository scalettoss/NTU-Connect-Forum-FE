"use client"

import React, { useEffect, useState, useRef } from 'react';
import { NotificationResponseType } from '@/types/NotificationType';
import { getUserNotification, markNotificationAsRead } from '@/services/NotificationService';
import { useRouter } from 'next/navigation';
import { formatDistance } from 'date-fns';
import Badge from '@/components/ui/badge/Badge';

interface NotificationsPopupProps {
    isOpen: boolean;
    onClose: () => void;
    anchorRef: React.RefObject<HTMLButtonElement>;
}

export default function NotificationsPopup({ isOpen, onClose, anchorRef }: NotificationsPopupProps) {
    const [notifications, setNotifications] = useState<NotificationResponseType[]>([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const popupRef = useRef<HTMLDivElement>(null);
    const [popupPosition, setPopupPosition] = useState({ top: 0, right: 0 });

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await getUserNotification();
            //@ts-ignore
            setNotifications(response.data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    // Position the popup relative to the anchor element
    const updatePopupPosition = () => {
        if (!anchorRef.current) return;

        const rect = anchorRef.current.getBoundingClientRect();
        setPopupPosition({
            top: rect.bottom + 5, // 5px below the button
            right: window.innerWidth - rect.right
        });
    };

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
            updatePopupPosition();
        }
    }, [isOpen]);

    // Update position when window is scrolled or resized
    useEffect(() => {
        if (!isOpen) return;

        const handleScroll = () => updatePopupPosition();
        const handleResize = () => updatePopupPosition();

        window.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleResize);
        };
    }, [isOpen]);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                popupRef.current &&
                !popupRef.current.contains(event.target as Node) &&
                anchorRef.current &&
                !anchorRef.current.contains(event.target as Node)
            ) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose, anchorRef]);

    // Close popup when pressing Escape key
    useEffect(() => {
        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscapeKey);
        }

        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [isOpen, onClose]);

    const handleNotificationClick = async (notification: NotificationResponseType) => {
        try {
            // Only mark as read if it's not already read
            if (!notification.isRead) {
                await markNotificationAsRead(notification.notificationId);

                // Update local state to reflect the change
                setNotifications(prev =>
                    prev.map(item =>
                        item.notificationId === notification.notificationId
                            ? { ...item, isRead: true }
                            : item
                    )
                );
            }

            // Navigate to the post if categorySlug and postSlug are available
            if (notification.categorySlug && notification.postSlug) {
                router.push(`/home/category/${notification.categorySlug}/${notification.postSlug}`);
                onClose(); // Close the popup after navigation
            }
        } catch (error) {
            console.error('Error handling notification click:', error);
        }
    };

    // Get background color based on notification type and read status
    const getNotificationBgColor = (notification: NotificationResponseType) => {
        if (notification.isRead) {
            return 'bg-gray-50 dark:bg-gray-800/30';
        }

        if (notification.type === 'System') {
            return 'bg-blue-50 dark:bg-blue-900/10';
        }

        return 'bg-blue-50 dark:bg-blue-900/10';
    };

    // Get hover color based on notification type
    const getNotificationHoverColor = (notification: NotificationResponseType) => {
        if (notification.type === 'System') {
            return 'hover:bg-blue-100/50 dark:hover:bg-blue-800/30';
        }

        return 'hover:bg-blue-100/50 dark:hover:bg-blue-800/30';
    };

    // Get border color for new notifications
    const getNotificationBorder = (notification: NotificationResponseType) => {
        if (!notification.isRead) {
            if (notification.type === 'System') {
                return 'border-l-4 border-l-blue-500';
            }
            return 'border-l-4 border-l-blue-500';
        }
        return '';
    };

    if (!isOpen) return null;

    return (
        <div
            ref={popupRef}
            className="fixed bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 w-96"
            style={{
                top: `${popupPosition.top}px`,
                right: `${popupPosition.right}px`,
                maxHeight: '80vh',
                overflowY: 'auto'
            }}
        >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="mr-2"
                    >
                        <path d="M12.0001 22C13.1001 22 14.0001 21.1 14.0001 20H10.0001C10.0001 21.1 10.8901 22 12.0001 22ZM18.0001 16V11C18.0001 7.93 16.3601 5.36 13.5001 4.68V4C13.5001 3.17 12.8301 2.5 12.0001 2.5C11.1701 2.5 10.5001 3.17 10.5001 4V4.68C7.63008 5.36 6.00008 7.92 6.00008 11V16L4.71008 17.29C4.08008 17.92 4.52008 19 5.41008 19H18.5801C19.4701 19 19.9201 17.92 19.2901 17.29L18.0001 16Z" fill="currentColor" />
                    </svg>
                    <h2 className="text-base font-semibold">Notifications</h2>
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M6.04289 6.04289C6.43342 5.65237 7.06658 5.65237 7.45711 6.04289L12 10.5858L16.5429 6.04289C16.9334 5.65237 17.5666 5.65237 17.9571 6.04289C18.3476 6.43342 18.3476 7.06658 17.9571 7.45711L13.4142 12L17.9571 16.5429C18.3476 16.9334 18.3476 17.5666 17.9571 17.9571C17.5666 18.3476 16.9334 18.3476 16.5429 17.9571L12 13.4142L7.45711 17.9571C7.06658 18.3476 6.43342 18.3476 6.04289 17.9571C5.65237 17.5666 5.65237 16.9334 6.04289 16.5429L10.5858 12L6.04289 7.45711C5.65237 7.06658 5.65237 6.43342 6.04289 6.04289Z" fill="currentColor" />
                    </svg>
                </button>
            </div>

            <div className="overflow-y-auto max-h-[400px]">
                {loading ? (
                    <div className="flex justify-center p-4">Loading notifications...</div>
                ) : notifications.length === 0 ? (
                    <div className="text-center p-4 text-gray-500">No notifications yet</div>
                ) : (
                    <div className="flex flex-col">
                        {notifications.map((notification) => (
                            <div
                                key={notification.notificationId}
                                onClick={() => handleNotificationClick(notification)}
                                className={`
                                    px-4 py-3 cursor-pointer flex flex-col gap-1 transition-colors
                                    ${getNotificationBgColor(notification)}
                                    ${getNotificationHoverColor(notification)}
                                    ${getNotificationBorder(notification)}
                                `}
                            >
                                {!notification.isRead && (
                                    <div className="text-blue-600 font-medium text-sm mb-1">
                                        New
                                    </div>
                                )}
                                <div className="text-gray-800 dark:text-gray-200 text-sm font-medium">
                                    {notification.message}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {formatDistance(new Date(notification.createdAt), new Date(), { addSuffix: true })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
} 