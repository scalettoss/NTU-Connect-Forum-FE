"use client";
import React, { useState, useEffect } from 'react';
import Toast, { ToastType, ToastPosition } from './Toast';

// Toast item interface
export interface ToastItem {
    id: string;
    message: string;
    type: ToastType;
    position: ToastPosition;
    duration: number;
}

// Global array to store toast items
let toasts: ToastItem[] = [];
let listeners: (() => void)[] = [];

// Function to add a new toast
export const addToast = (
    message: string,
    type: ToastType = 'success',
    position: ToastPosition = 'top-center',
    duration: number = 3000
) => {
    const id = Math.random().toString(36).substring(2, 9);
    const toast: ToastItem = { id, message, type, position, duration };
    toasts = [...toasts, toast];
    emitChange();
    return id;
};

// Function to remove a toast by ID
export const removeToast = (id: string) => {
    toasts = toasts.filter(toast => toast.id !== id);
    emitChange();
};

// Function to notify listeners of changes
const emitChange = () => {
    listeners.forEach(listener => listener());
};

// Subscribe to changes
const subscribe = (listener: () => void) => {
    listeners = [...listeners, listener];
    return () => {
        listeners = listeners.filter(l => l !== listener);
    };
};

const ToastContainer: React.FC = () => {
    const [localToasts, setLocalToasts] = useState<ToastItem[]>([]);

    useEffect(() => {
        setLocalToasts(toasts);

        const unsubscribe = subscribe(() => {
            setLocalToasts([...toasts]);
        });

        return unsubscribe;
    }, []);

    const handleCloseToast = (id: string) => {
        removeToast(id);
    };

    // Group toasts by position
    const groupedToasts: Record<ToastPosition, ToastItem[]> = {
        'top-right': [],
        'top-center': [],
        'top-left': [],
        'bottom-right': [],
        'bottom-center': [],
        'bottom-left': []
    };

    localToasts.forEach(toast => {
        groupedToasts[toast.position].push(toast);
    });

    return (
        <>
            {Object.entries(groupedToasts).map(([position, positionToasts]) => (
                positionToasts.length > 0 && (
                    <div
                        key={position}
                        className={`fixed z-50 flex flex-col items-center ${position.includes('top') ? 'top-0 pt-4' : 'bottom-0 pb-4'
                            } ${position.includes('right') ? 'right-0 pr-4 items-end' :
                                position.includes('left') ? 'left-0 pl-4 items-start' :
                                    'left-1/2 transform -translate-x-1/2 items-center'
                            } gap-2`}
                    >
                        {positionToasts.map(toast => (
                            <Toast
                                key={toast.id}
                                message={toast.message}
                                type={toast.type}
                                position={toast.position as ToastPosition}
                                duration={toast.duration}
                                onClose={() => handleCloseToast(toast.id)}
                            />
                        ))}
                    </div>
                )
            ))}
        </>
    );
};

export default ToastContainer; 