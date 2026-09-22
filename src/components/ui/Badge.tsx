import React from 'react';
import { cn } from '../../utils/cn';
import { ProductBadge } from '../../types/product';
import { OrderStatus } from '../../types/order';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: ProductBadge | OrderStatus | 'in-stock' | 'low-stock' | 'out-of-stock' | 'default' | 'vip';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className }) => {
  const getStyles = () => {
    switch (variant) {
      case 'NEW':
        return 'bg-moss-900 text-sand-50 border-moss-900';
      case 'BESTSELLER':
        return 'bg-sand-900 text-sand-50 border-sand-900';
      case 'LIMITED':
        return 'bg-clay-600 text-sand-50 border-clay-600';
      case 'SALE':
        return 'bg-[#8E3B29] text-white border-[#8E3B29]';
      case 'ORGANIC':
        return 'bg-moss-100 text-moss-900 border-moss-300';
      case 'HANDCRAFTED':
        return 'bg-sand-200 text-sand-900 border-sand-400';
      
      // Order statuses
      case 'Delivered':
        return 'bg-moss-100 text-moss-800 border-moss-200';
      case 'Shipped':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Processing':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Pending':
        return 'bg-stone-100 text-stone-700 border-stone-200';
      case 'Cancelled':
      case 'Refunded':
        return 'bg-red-50 text-red-700 border-red-200';

      // Inventory
      case 'in-stock':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'low-stock':
        return 'bg-amber-50 text-amber-800 border-amber-300 font-semibold';
      case 'out-of-stock':
        return 'bg-stone-200 text-stone-700 border-stone-300';

      case 'vip':
        return 'bg-gold-500/10 text-gold-600 border-gold-500/30';

      default:
        return 'bg-sand-200/70 text-charcoal-800 border-sand-300';
    }
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 text-[10px] uppercase font-medium tracking-widest border transition-colors',
        getStyles(),
        className
      )}
    >
      {children || variant}
    </span>
  );
};
