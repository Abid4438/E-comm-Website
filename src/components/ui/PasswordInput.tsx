import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../../utils/cn';

type PasswordInputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const PasswordInput: React.FC<PasswordInputProps> = ({ className, ...props }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative">
      <input
        {...props}
        type={isVisible ? 'text' : 'password'}
        className={cn(
          'w-full bg-[#FAF8F5] border border-sand-300 p-3 pr-10 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900',
          className
        )}
      />
      <button
        type="button"
        onClick={() => setIsVisible((visible) => !visible)}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-charcoal-500 hover:text-charcoal-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-moss-800"
        aria-label={isVisible ? 'Hide password' : 'Show password'}
        aria-pressed={isVisible}
        title={isVisible ? 'Hide password' : 'Show password'}
      >
        {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
};
