import React from 'react';

interface LogoProps {
    width?: number;
    height?: number;
    className?: string;
}

const Logo: React.FC<LogoProps> = ({ width = 40, height = 40, className = '' }) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Gradient definition */}
            <defs>
                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F97316" />
                    <stop offset="100%" stopColor="#EA580C" />
                </linearGradient>
                <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
                    <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.3" />
                </filter>
            </defs>

            {/* Main circular background */}
            <circle cx="50" cy="50" r="45" fill="url(#logoGradient)" filter="url(#shadow)" />

            {/* Letter N */}
            <path
                d="M30 30L30 70L40 70L40 45L60 70L60 30L50 30L50 55L30 30Z"
                fill="white"
            />

            {/* Stylized T */}
            <path
                d="M65 30H85V40H80V70H70V40H65V30Z"
                fill="white"
            />

            {/* Connection circle dot */}
            <circle cx="50" cy="50" r="5" fill="white" />

            {/* Connection lines */}
            <path
                d="M50 50L30 40M50 50L70 40M50 50L40 70M50 50L60 70"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeOpacity="0.6"
            />
        </svg>
    );
};

// Variant with text
export const LogoWithText: React.FC<LogoProps & { textClassName?: string }> = ({
    width = 40,
    height = 40,
    className = '',
    textClassName = ''
}) => {
    return (
        <div className={`flex items-center ${className}`}>
            <Logo width={width} height={height} />
            <div className={`ml-2 font-bold text-xl ${textClassName}`}>
                <span className="text-orange-600">NTU</span>
                <span className="text-gray-700">Connect</span>
            </div>
        </div>
    );
};

export default Logo; 