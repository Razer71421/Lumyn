import React from 'react';

interface LogoProps {
    className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "h-10 w-auto" }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 300 300"
            className={`${className}`}
            role="img"
            aria-label="Lumyn Logo"
        >
            <defs>
                <linearGradient id="leafGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#52B788" />
                    <stop offset="100%" stopColor="#2D6A4F" />
                </linearGradient>
            </defs>

            {/* Group for Icon */}
            <g transform="translate(75, 20) scale(1.2)">
                {/* Main Stem */}
                <path 
                    d="M60 130 Q 70 80 110 30" 
                    stroke="url(#leafGradient)" 
                    strokeWidth="4" 
                    fill="none" 
                    strokeLinecap="round"
                />

                {/* Leaf 1 (Left Bottom) */}
                <path 
                    d="M63 115 Q 40 110 35 90 Q 55 95 68 105" 
                    fill="url(#leafGradient)" 
                />

                {/* Leaf 2 (Right Low) */}
                <path 
                    d="M75 95 Q 100 90 105 75 Q 85 80 78 88" 
                    fill="url(#leafGradient)" 
                />

                {/* Leaf 3 (Left High) */}
                <path 
                    d="M82 70 Q 60 60 60 45 Q 75 55 85 65" 
                    fill="url(#leafGradient)" 
                />

                {/* Leaf 4 (Right High) */}
                <path 
                    d="M95 50 Q 115 45 120 30 Q 105 40 98 45" 
                    fill="url(#leafGradient)" 
                />
                
                {/* Top Leaf */}
                <path 
                    d="M110 30 Q 105 10 115 5 Q 125 10 110 30" 
                    fill="url(#leafGradient)" 
                />
            </g>

            {/* Text */}
            <text
                x="150"
                y="230"
                textAnchor="middle"
                fontFamily="'Times New Roman', Times, serif"
                fontWeight="500"
                fontSize="85"
                className="fill-current text-[#2D6A4F] dark:text-[#D8F3DC]"
                letterSpacing="2"
            >
                Lumyn
            </text>
        </svg>
    );
};

export default Logo;