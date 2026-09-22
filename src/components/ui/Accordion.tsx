import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
  defaultOpen?: boolean;
}

interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
  items,
  allowMultiple = false,
  className,
}) => {
  const [openIds, setOpenIds] = useState<string[]>(() => {
    return items.filter((item) => item.defaultOpen).map((item) => item.id);
  });

  const toggleItem = (id: string) => {
    if (allowMultiple) {
      setOpenIds((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
    } else {
      setOpenIds((prev) => (prev.includes(id) ? [] : [id]));
    }
  };

  return (
    <div className={cn('divide-y divide-sand-200 border-y border-sand-200', className)}>
      {items.map((item) => {
        const isOpen = openIds.includes(item.id);
        return (
          <div key={item.id} className="py-1">
            <button
              onClick={() => toggleItem(item.id)}
              className="flex w-full items-center justify-between py-4 text-left font-serif text-lg tracking-tight text-charcoal-900 transition-colors hover:text-moss-800 focus:outline-none"
              aria-expanded={isOpen}
            >
              <span>{item.title}</span>
              <ChevronDown
                className={cn(
                  'w-4 h-4 text-charcoal-400 transition-transform duration-300',
                  isOpen && 'transform rotate-180 text-charcoal-900'
                )}
              />
            </button>
            {isOpen && (
              <div className="pb-5 pt-1 text-sm leading-relaxed text-charcoal-600 animate-slide-down">
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
