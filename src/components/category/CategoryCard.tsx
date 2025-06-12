import React from 'react';
import Link from 'next/link';
import { CategoryIcon } from '../common/CategoryIcon';



/**
 * Component hiển thị thẻ danh mục, có thể tùy chỉnh với nhiều kích thước và kiểu hiển thị
 */
const CategoryCard: React.FC<CategoryCardProps> = ({
    id,
    slug,
    name,
    count,
    description,
    showLink = true,
    className = "",
    compact = false
}) => {
    const cardContent = (
        <div className={`bg-white rounded-xl p-${compact ? '4' : '6'} shadow-sm hover:shadow-md transition duration-300 border border-gray-100 h-full flex flex-col ${className}`}>
            <div className="flex items-center">
                <CategoryIcon
                    name={name}
                    className={`${compact ? 'w-10 h-10' : 'w-12 h-12'} mb-${description ? '3' : '4'}`}
                />
                {compact && (
                    <div className="ml-3">
                        <h3 className="text-base font-semibold text-gray-900">{name}</h3>
                        <p className="text-xs text-gray-500">{count} bài viết</p>
                    </div>
                )}
            </div>

            {!compact && (
                <>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{name}</h3>
                    {description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{description}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-auto">{count} bài viết</p>
                </>
            )}

            {showLink && !compact && (
                <div className="mt-4">
                    <span className="text-orange-500 text-sm font-medium inline-flex items-center hover:underline">
                        Xem tất cả
                        <svg className="w-3.5 h-3.5 ml-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
                        </svg>
                    </span>
                </div>
            )}
        </div>
    );

    if (showLink) {
        return (
            <Link href={`/home/category/${slug}`} className="block">
                {cardContent}
            </Link>
        );
    }

    return cardContent;
};

export default CategoryCard;

interface CategoryCardProps {
    id: number;
    slug: string;
    name: string;
    count: number;
    description?: string;
    showLink?: boolean;
    className?: string;
    compact?: boolean;
}