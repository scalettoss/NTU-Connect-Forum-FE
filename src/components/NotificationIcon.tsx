"use client"
import React, { useState, useEffect, useRef } from 'react';
import { getUserNotification } from '@/services/NotificationService';
import NotificationsPopup from './modals/NotificationsPopup';
import { Badge } from '@/components/ui/badge';
export default function NotificationIcon() {
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const fetchUnreadCount = async () => {
        try {
            const notifications = await getUserNotification();
            //@ts-ignore
            const count = notifications.data.filter(notification => !notification.isRead).length;
            setUnreadCount(count);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    useEffect(() => {
        fetchUnreadCount();

        // Set up a polling interval to check for new notifications
        const intervalId = setInterval(fetchUnreadCount, 30000); // Check every 30 seconds

        return () => clearInterval(intervalId);
    }, []);

    // Refresh count when popup closes (in case notifications were marked as read)
    const handleClosePopup = () => {
        setIsPopupOpen(false);
        fetchUnreadCount();
    };

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setIsPopupOpen(!isPopupOpen)}
                aria-label="Notifications"
            >
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path d="M12.0001 22C13.1001 22 14.0001 21.1 14.0001 20H10.0001C10.0001 21.1 10.8901 22 12.0001 22ZM18.0001 16V11C18.0001 7.93 16.3601 5.36 13.5001 4.68V4C13.5001 3.17 12.8301 2.5 12.0001 2.5C11.1701 2.5 10.5001 3.17 10.5001 4V4.68C7.63008 5.36 6.00008 7.92 6.00008 11V16L4.71008 17.29C4.08008 17.92 4.52008 19 5.41008 19H18.5801C19.4701 19 19.9201 17.92 19.2901 17.29L18.0001 16Z" fill="currentColor" />
                </svg>

                {unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1">
                        <Badge variant="solid" color="primary" size="sm">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </Badge>
                    </div>
                )}
            </button>

            <NotificationsPopup
                isOpen={isPopupOpen}
                onClose={handleClosePopup}
                anchorRef={buttonRef as React.RefObject<HTMLButtonElement>}
            />
        </div>
    );
} 