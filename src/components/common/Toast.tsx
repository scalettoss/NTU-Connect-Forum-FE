"use client";
import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

// Toast type definition
export type ToastType = 'success' | 'error' | 'warning' | 'info';

// Toast position type
export type ToastPosition = 'top-right' | 'top-center' | 'top-left' | 'bottom-right' | 'bottom-center' | 'bottom-left';

// Toast props interface
interface ToastProps {
    message: string;
    type?: ToastType;
    position?: ToastPosition;
    duration?: number;
    onClose?: () => void;
}

const Toast: React.FC<ToastProps> = ({
    message,
    type = 'success',
    position = 'top-right',
    duration = 3000,
    onClose
}) => {
    const [isExiting, setIsExiting] = useState(false);

    // Get icon and colors based on toast type
    const getToastConfig = (toastType: ToastType) => {
        switch (toastType) {
            case 'success':
                return {
                    icon: <CheckCircle className="w-5 h-5" />,
                    background: '#10B981',
                    textColor: 'white',
                    iconColor: 'white'
                };
            case 'error':
                return {
                    icon: <XCircle className="w-5 h-5" />,
                    background: '#EF4444',
                    textColor: 'white',
                    iconColor: 'white'
                };
            case 'warning':
                return {
                    icon: <AlertCircle className="w-5 h-5" />,
                    background: '#F59E0B',
                    textColor: 'white',
                    iconColor: 'white'
                };
            case 'info':
                return {
                    icon: <Info className="w-5 h-5" />,
                    background: '#3B82F6',
                    textColor: 'white',
                    iconColor: 'white'
                };
            default:
                return {
                    icon: <CheckCircle className="w-5 h-5" />,
                    background: '#10B981',
                    textColor: 'white',
                    iconColor: 'white'
                };
        }
    };

    // Get position classes
    const getPositionClasses = (pos: ToastPosition) => {
        switch (pos) {
            case 'top-right':
                return 'top-4 right-4';
            case 'top-center':
                return 'top-4 left-1/2 transform -translate-x-1/2';
            case 'top-left':
                return 'top-4 left-4';
            case 'bottom-right':
                return 'bottom-4 right-4';
            case 'bottom-center':
                return 'bottom-4 left-1/2 transform -translate-x-1/2';
            case 'bottom-left':
                return 'bottom-4 left-4';
            default:
                return 'top-4 right-4';
        }
    };

    const config = getToastConfig(type);
    const positionClasses = getPositionClasses(position);

    // Handle close with animation
    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => {
            if (onClose) onClose();
        }, 300); // Match animation duration
    };

    // Auto close toast after duration
    useEffect(() => {
        const timer = setTimeout(() => {
            handleClose();
        }, duration);

        return () => {
            clearTimeout(timer);
        };
    }, [duration]);

    return (
        <div
            className={`min-w-[300px] max-w-md rounded-lg shadow-lg p-4 ${isExiting ? 'animate-slideOutRight' : 'animate-slideInRight'}`}
            style={{
                background: config.background,
                color: config.textColor
            }}
            role="alert"
        >
            <div className="flex items-center">
                <div className="flex-shrink-0 mr-3" style={{ color: config.iconColor }}>
                    {config.icon}
                </div>
                <div className="flex-1">
                    <p className="font-medium">{message}</p>
                </div>
                <button
                    type="button"
                    className="ml-3 -mr-1 -mt-1 text-white hover:text-gray-100 focus:outline-none"
                    onClick={handleClose}
                    aria-label="Close"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default Toast; 