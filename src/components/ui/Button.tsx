import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'moss' | 'dark' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss-800/40 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none text-xs uppercase letter-spacing-wider active:scale-[0.99]';

    const variants = {
      primary: 'bg-charcoal-900 text-sand-50 hover:bg-black border border-charcoal-900 shadow-sm',
      moss: 'bg-moss-900 text-sand-50 hover:bg-moss-800 border border-moss-900 shadow-sm',
      secondary: 'bg-sand-200 text-charcoal-900 hover:bg-sand-300 border border-sand-300',
      outline: 'bg-transparent text-charcoal-900 border border-charcoal-900/30 hover:border-charcoal-900 hover:bg-sand-100/60',
      ghost: 'bg-transparent text-charcoal-800 hover:bg-sand-200/60 border border-transparent',
      dark: 'bg-moss-950 text-white hover:bg-charcoal-900 border border-moss-950',
      danger: 'bg-red-700 text-white hover:bg-red-800 border border-red-700',
    };

    const sizes = {
      sm: 'px-3.5 py-2 text-[10px] tracking-wider rounded-none',
      md: 'px-6 py-3 text-[11px] tracking-widest rounded-none',
      lg: 'px-8 py-4 text-xs tracking-widest rounded-none',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {!isLoading && leftIcon && <span className="mr-2 inline-flex items-center">{leftIcon}</span>}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="ml-2 inline-flex items-center">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
