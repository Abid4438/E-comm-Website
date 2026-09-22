import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { cn } from '../../utils/cn';

interface QuantitySelectorProps {
  quantity: number;
  max?: number;
  min?: number;
  onChange: (qty: number) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  quantity,
  max = 99,
  min = 1,
  onChange,
  size = 'md',
  className,
  disabled = false,
}) => {
  const handleDecrement = () => {
    if (quantity > min) onChange(quantity - 1);
  };

  const handleIncrement = () => {
    if (quantity < max) onChange(quantity + 1);
  };

  const sizes = {
    sm: 'h-8 text-xs',
    md: 'h-10 text-xs',
    lg: 'h-12 text-sm',
  };

  const buttonPaddings = {
    sm: 'w-7',
    md: 'w-9',
    lg: 'w-11',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center border border-sand-300 bg-sand-50/50 select-none',
        sizes[size],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || quantity <= min}
        className={cn(
          'flex h-full items-center justify-center text-charcoal-600 hover:text-charcoal-900 transition-colors disabled:opacity-30 disabled:cursor-not-allowed',
          buttonPaddings[size]
        )}
        aria-label="Decrease quantity"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>

      <span className="flex-1 text-center font-medium font-sans px-2 text-charcoal-900 min-w-[2rem]">
        {quantity}
      </span>

      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || quantity >= max}
        className={cn(
          'flex h-full items-center justify-center text-charcoal-600 hover:text-charcoal-900 transition-colors disabled:opacity-30 disabled:cursor-not-allowed',
          buttonPaddings[size]
        )}
        aria-label="Increase quantity"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
