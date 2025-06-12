import React from 'react';
import Link from 'next/link';
import { FaHome, FaChevronRight, FaLayerGroup, FaFileAlt } from 'react-icons/fa';

export interface BreadcrumbItem {
    label: string;
    href?: string;
    icon?: React.ReactNode;
    isActive?: boolean;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
    className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
    const truncateLabel = (label: string, maxLength: number = 20) => {
        if (label.length <= maxLength) return label;
        return `${label.substring(0, maxLength)}...`;
    };

    // Default icons for common breadcrumb items
    const getDefaultIcon = (label: string, index: number) => {
        if (index === 0 || label.toLowerCase() === 'trang chủ') return <FaHome className="text-white" />;
        if (label.toLowerCase() === 'danh mục') return <FaLayerGroup className="text-white" />;
        return index === items.length - 1 ? <FaFileAlt className="text-white" /> : <FaLayerGroup className="text-white" />;
    };

    return (
        <nav className={`flex flex-wrap items-center bg-white/70 backdrop-blur-sm px-4 py-3 rounded-xl shadow-sm border border-indigo-100/50 animate-fadeIn ${className}`}>
            {items.map((item, index) => (
                <React.Fragment key={`breadcrumb-${index}`}>
                    {index > 0 && (
                        <div className="mx-2 sm:mx-3 text-gray-300">
                            <FaChevronRight className="h-3 w-3" />
                        </div>
                    )}

                    {item.href && !item.isActive ? (
                        <Link href={item.href} className="flex items-center text-gray-700 hover:text-indigo-600 transition-colors group my-1">
                            <div className="bg-gradient-to-r from-indigo-500 to-blue-500 p-2 rounded-lg shadow-sm group-hover:shadow-md transition-all mr-2 transform group-hover:-translate-y-1 duration-200">
                                {item.icon || getDefaultIcon(item.label, index)}
                            </div>
                            <span className="font-medium text-sm">
                                {truncateLabel(item.label, 15)}
                            </span>
                        </Link>
                    ) : (
                        <div className="flex items-center my-1">
                            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-2 rounded-lg shadow-md mr-2">
                                {item.icon || getDefaultIcon(item.label, index)}
                            </div>
                            <span className={`font-semibold text-sm ${item.isActive ? 'bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500' : ''}`}>
                                {truncateLabel(item.label, 15)}
                            </span>
                        </div>
                    )}
                </React.Fragment>
            ))}
        </nav>
    );
};

export default Breadcrumb; 