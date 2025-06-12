/**
 * Creates a truncated string with ellipsis if it exceeds maxLength
 * @param text Text to truncate
 * @param maxLength Maximum length before truncation
 * @returns Truncated text with ellipsis or original text if shorter than maxLength
 */
export const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

/**
 * Generates avatar text from a name (usually initials)
 * @param name Full name
 * @param maxChars Maximum number of characters to return (default: 2)
 * @returns Initials or first characters of the name
 */
export const getAvatarText = (name: string, maxChars: number = 2): string => {
    if (!name) return '';

    const parts = name.split(' ').filter(part => part.length > 0);
    if (parts.length === 0) return '';

    if (parts.length === 1) {
        return parts[0].substring(0, maxChars).toUpperCase();
    }

    // Get first letter of first part and first letter of last part
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/**
 * Formats a number for display (e.g., 1000 -> 1K)
 * @param num Number to format
 * @returns Formatted number string
 */
export const formatNumber = (num: number): string => {
    if (num === 0) return '0';

    if (num < 1000) return num.toString();

    if (num < 1000000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }

    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
};

/**
 * Determines if we should show a loading state based on time elapsed
 * Used to prevent flickering for fast operations
 * @param startTime Time when the operation started
 * @param minDelay Minimum delay before showing loading state (ms)
 * @returns Boolean indicating if loading state should be shown
 */
export const shouldShowLoading = (startTime: number, minDelay: number = 300): boolean => {
    return Date.now() - startTime >= minDelay;
}; 