import { addToast, removeToast } from '@/components/common/ToastContainer';
import { ToastType, ToastPosition } from '@/components/common/Toast';

/**
 * Toast service for displaying toast notifications
 */
const ToastService = {
    /**
     * Show a success toast notification
     * @param message The message to display
     * @param position The position of the toast
     * @param duration The duration in milliseconds
     * @returns The ID of the toast
     */
    success: (message: string, position: ToastPosition = 'top-center', duration: number = 3000) => {
        return addToast(message, 'success', position, duration);
    },

    /**
     * Show an error toast notification
     * @param message The message to display
     * @param position The position of the toast
     * @param duration The duration in milliseconds
     * @returns The ID of the toast
     */
    error: (message: string, position: ToastPosition = 'top-center', duration: number = 3000) => {
        return addToast(message, 'error', position, duration);
    },

    /**
     * Show a warning toast notification
     * @param message The message to display
     * @param position The position of the toast
     * @param duration The duration in milliseconds
     * @returns The ID of the toast
     */
    warning: (message: string, position: ToastPosition = 'top-center', duration: number = 3000) => {
        return addToast(message, 'warning', position, duration);
    },

    /**
     * Show an info toast notification
     * @param message The message to display
     * @param position The position of the toast
     * @param duration The duration in milliseconds
     * @returns The ID of the toast
     */
    info: (message: string, position: ToastPosition = 'top-center', duration: number = 3000) => {
        return addToast(message, 'info', position, duration);
    },

    /**
     * Remove a toast notification by ID
     * @param id The ID of the toast to remove
     */
    remove: (id: string) => {
        removeToast(id);
    }
};

export default ToastService; 