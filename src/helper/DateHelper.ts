import { formatDistance } from 'date-fns';
import { vi } from 'date-fns/locale';

/**
 * Formats a date as a relative time string (e.g., "2 hours ago")
 * @param date The date to format (string or Date object)
 * @returns Formatted relative time string
 */
export const formatRelativeTime = (date: string | Date): string => {
    try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;

        // Check if date is valid
        if (isNaN(dateObj.getTime())) {
            return 'Vừa xong';
        }

        return formatDistance(dateObj, new Date(), {
            addSuffix: true,
            locale: vi
        });
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Vừa xong';
    }
};

/**
 * Formats a date as a simple date string (DD/MM/YYYY)
 * @param date The date to format (string or Date object)
 * @returns Formatted date string
 */
export const formatSimpleDate = (date: string | Date): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObj.getFullYear();

    return `${day}/${month}/${year}`;
};

/**
 * Formats a date as a time string (HH:MM)
 * @param date The date to format (string or Date object)
 * @returns Formatted time string
 */
export const formatTime = (date: string | Date): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    const hours = dateObj.getHours().toString().padStart(2, '0');
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');

    return `${hours}:${minutes}`;
}; 