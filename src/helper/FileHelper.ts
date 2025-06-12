/**
 * Determines the file type from a URL
 * @param url The URL of the file
 * @returns The file type as a string ('pdf', 'word', 'excel', 'image', 'powerpoint', 'audio', 'text', or 'other')
 */
export const getFileType = (url: string): string => {
    const extension = url.split('.').pop()?.toLowerCase();

    if (extension === 'pdf') return 'pdf';
    if (['doc', 'docx'].includes(extension || '')) return 'word';
    if (['xls', 'xlsx'].includes(extension || '')) return 'excel';
    if (['ppt', 'pptx'].includes(extension || '')) return 'powerpoint';
    if (['txt'].includes(extension || '')) return 'text';
    if (['mp3'].includes(extension || '')) return 'audio';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(extension || '')) return 'image';

    return 'other';
};

/**
 * Gets the file name from a URL
 * @param url The URL of the file
 * @returns The extracted file name
 */
export const getFileName = (url: string): string => {
    const parts = url.split('/');
    return parts[parts.length - 1];
};

/**
 * Filters and categorizes file URLs into images and documents
 * @param fileUrls Array of file URLs
 * @returns Object containing separate arrays for image URLs and document URLs
 */
export const categorizeFileUrls = (fileUrls: string[] | undefined) => {
    if (!fileUrls || fileUrls.length === 0) {
        return { imageUrls: [], documentUrls: [] };
    }

    const imageUrls = fileUrls.filter(url => getFileType(url) === 'image');
    const documentUrls = fileUrls.filter(url => getFileType(url) !== 'image');

    return { imageUrls, documentUrls };
}; 