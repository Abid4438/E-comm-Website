import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '../../utils/cn';

interface RatingProps {
  value: number; // 0 to 5
  count?: number;
  showCount?: boolean;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
}

export const Rating: React.FC<RatingProps> = ({
  value,
  count,
  showCount = false,
  size = 'sm',
  interactive = false,
  onChange,
  className,
}) => {
  const sizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div className={cn('inline-flex items-center gap-1.5', className)}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = value >= star;
          const isHalf = value >= star - 0.5 && value < star;

          return (
            <button
              key={star}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onChange?.(star)}
              className={cn(
                'focus:outline-none transition-transform',
                interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
              )}
            >
              <Star
                className={cn(
                  sizes[size],
                  isFilled
                    ? 'fill-[#B88E4F] text-[#B88E4F]'
                    : isHalf
                    ? 'fill-[#B88E4F]/50 text-[#B88E4F]'
                    : 'text-sand-300 fill-transparent'
                )}
              />
            </button>
          );
        })}
      </div>

      {showCount && (
        <span className="text-xs text-charcoal-500 font-sans ml-0.5">
          {value.toFixed(1)} {count !== undefined && `(${count})`}
        </span>
      )}
    </div>
  );
};
