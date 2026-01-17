import { cn } from '@/lib/utils';

export default function Logo({ className = '', size = 'default' }) {
  const sizeClasses = {
    small: 'h-8',
    default: 'h-12 md:h-14 lg:h-16',
    large: 'h-16 md:h-20',
  };

  return (
    <div className={cn('flex items-center', sizeClasses[size], className)}>
      <svg 
        viewBox="0 0 300 50" 
        className="h-full w-auto"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Text MOONLIGHTBL */}
        <text
          x="0"
          y="35"
          fill="white"
          fontFamily="'Outfit', sans-serif"
          fontWeight="700"
          fontSize="32"
          letterSpacing="0.05em"
        >
          MOONLIGHTBL
        </text>
        
        {/* Crescent Moon */}
        <g transform="translate(252, 5)">
          <path
            d="M20 0C8.954 0 0 8.954 0 20s8.954 20 20 20c4.5 0 8.65-1.5 12-4-6.5-3-11-9.5-11-17s4.5-14 11-17c-3.35-2.5-7.5-4-12-4z"
            fill="white"
          />
        </g>
      </svg>
    </div>
  );
}
