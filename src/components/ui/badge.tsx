import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'solid' | 'outline' | 'light';
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const getBadgeVariantClass = (variant: string, color: string) => {
    const variants = {
        solid: {
            primary: 'bg-blue-500 text-white',
            secondary: 'bg-gray-500 text-white',
            success: 'bg-green-500 text-white',
            warning: 'bg-yellow-500 text-white',
            danger: 'bg-red-500 text-white',
            info: 'bg-cyan-500 text-white',
        },
        outline: {
            primary: 'border border-blue-500 text-blue-500',
            secondary: 'border border-gray-500 text-gray-500',
            success: 'border border-green-500 text-green-500',
            warning: 'border border-yellow-500 text-yellow-500',
            danger: 'border border-red-500 text-red-500',
            info: 'border border-cyan-500 text-cyan-500',
        },
        light: {
            primary: 'bg-blue-100 text-blue-800',
            secondary: 'bg-gray-100 text-gray-800',
            success: 'bg-green-100 text-green-800',
            warning: 'bg-yellow-100 text-yellow-800',
            danger: 'bg-red-100 text-red-800',
            info: 'bg-cyan-100 text-cyan-800',
        },
    };

    return variants[variant as keyof typeof variants][color as keyof typeof variants.solid];
};

const getSizeClass = (size: string) => {
    const sizes = {
        sm: 'text-xs px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center',
        md: 'text-sm px-2 py-1 rounded-full',
        lg: 'text-base px-3 py-1.5 rounded-full',
    };

    return sizes[size as keyof typeof sizes];
};

export function Badge({
    children,
    variant = 'solid',
    color = 'primary',
    size = 'md',
    className = ''
}: BadgeProps) {
    return (
        <span
            className={`
        inline-flex items-center justify-center font-medium
        ${getBadgeVariantClass(variant, color)}
        ${getSizeClass(size)}
        ${className}
      `}
        >
            {children}
        </span>
    );
}

// Default export for backward compatibility
export default Badge; 