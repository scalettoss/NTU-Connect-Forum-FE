import React from 'react';
import Link from 'next/link';
import { CategoryIcon } from './CategoryIcon';

interface CategoryDisplayProps {
    id: number;
    slug: string;
    name: string;
    count: number;
    className?: string;
    linkEnabled?: boolean;
}

/**
 * A reusable component for displaying a category with its icon and count
 */
const CategoryDisplay: React.FC<CategoryDisplayProps> = ({
    id,
    slug,
    name,
    count,
    className = "",
    linkEnabled = true
}) => {
    const content = (
        <div className={`bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition duration-300 border border-gray-100 h-full flex flex-col ${className}`}>
            <CategoryIcon
                name={name}
                className="w-12 h-12 mb-4"
            />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{name}</h3>
            <p className="text-sm text-gray-500 mt-auto">{count} bài viết</p>
        </div>
    );

    if (linkEnabled) {
        return (
            <Link href={`/home/category/${slug}`}>
                {content}
            </Link>
        );
    }

    return content;
};

export default CategoryDisplay; 