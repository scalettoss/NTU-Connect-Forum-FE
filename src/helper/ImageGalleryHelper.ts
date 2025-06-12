/**
 * Determines the appropriate layout for images based on count
 * @param count Number of images
 * @returns String representing the layout type: 'single', 'double', 'triple', or 'grid'
 */
export const getImageLayoutType = (count: number): 'single' | 'double' | 'triple' | 'grid' => {
    if (count === 1) return 'single';
    if (count === 2) return 'double';
    if (count === 3) return 'triple';
    return 'grid';
};

/**
 * Returns text to display for remaining images count
 * @param total Total number of images
 * @param displayed Number of displayed images
 * @returns String with count of remaining images, or empty string if all are displayed
 */
export const getRemainingImagesText = (total: number, displayed: number): string => {
    const remaining = total - displayed;
    if (remaining <= 0) return '';
    return `+${remaining} ảnh`;
};

/**
 * Gets the next image in a gallery
 * @param images Array of image URLs
 * @param currentImage Current image URL
 * @returns Next image URL or first image if at the end
 */
export const getNextImage = (images: string[], currentImage: string): string => {
    const currentIndex = images.indexOf(currentImage);
    if (currentIndex === -1 || currentIndex === images.length - 1) {
        return images[0];
    }
    return images[currentIndex + 1];
};

/**
 * Gets the previous image in a gallery
 * @param images Array of image URLs
 * @param currentImage Current image URL
 * @returns Previous image URL or last image if at the beginning
 */
export const getPreviousImage = (images: string[], currentImage: string): string => {
    const currentIndex = images.indexOf(currentImage);
    if (currentIndex === -1 || currentIndex === 0) {
        return images[images.length - 1];
    }
    return images[currentIndex - 1];
}; 