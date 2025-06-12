import React from 'react';
import { BookOpen, Calendar, Users, Award, LucideIcon } from 'lucide-react';

// Define a type for the icon data structure
type IconData = {
    icon: React.ReactNode;
    color: string;
};

// Category icon mappings with their respective colors
export const categoryIcons: Record<string, IconData> = {
    'Học tập': { icon: <BookOpen size={20} />, color: 'bg-blue-500' },
    'Sự kiện': { icon: <Calendar size={20} />, color: 'bg-purple-500' },
    'Câu lạc bộ': { icon: <Users size={20} />, color: 'bg-green-500' },
    'Học bổng': { icon: <Award size={20} />, color: 'bg-yellow-500' },
    'default': { icon: <BookOpen size={20} />, color: 'bg-gray-500' }
};

interface CategoryIconProps {
    name: string;
    size?: number;
    className?: string;
}

/**
 * A component that displays the appropriate icon for a category
 */
export const CategoryIcon: React.FC<CategoryIconProps> = ({
    name,
    size = 20,
    className = ""
}) => {
    // Get the icon data or use default if not found
    const iconData = categoryIcons[name] || categoryIcons.default;

    // For custom size, we need to render the icon differently
    // This approach avoids cloning issues with React elements
    const renderIcon = () => {
        if (size === 20) {
            // Use the default icon if size is 20px (our default size)
            return iconData.icon;
        } else {
            // For different sizes, recreate the icon with the new size
            switch (name) {
                case 'Học tập':
                    return <BookOpen size={size} />;
                case 'Sự kiện':
                    return <Calendar size={size} />;
                case 'Câu lạc bộ':
                    return <Users size={size} />;
                case 'Học bổng':
                    return <Award size={size} />;
                default:
                    return <BookOpen size={size} />;
            }
        }
    };

    return (
        <div className={`${iconData.color} rounded-full flex items-center justify-center text-white ${className}`}>
            {renderIcon()}
        </div>
    );
};

/**
 * Get icon data (icon and color) for a category by name
 */
export const getCategoryIconData = (name: string): IconData => {
    return categoryIcons[name] || categoryIcons.default;
};

export default CategoryIcon; 