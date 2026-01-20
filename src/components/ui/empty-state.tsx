import * as React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { Button } from './button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  variant?: 'default' | 'minimal' | 'card';
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  variant = 'default',
}: EmptyStateProps) {
  const baseClasses = cn(
    'flex flex-col items-center justify-center text-center',
    {
      'py-16 px-6': variant === 'default',
      'py-8 px-4': variant === 'minimal',
      'py-12 px-6 bg-card/30 border border-border/30 rounded-lg': variant === 'card',
    },
    className
  );

  return (
    <div className={baseClasses}>
      {Icon && (
        <div className="relative mb-6">
          <div className="absolute inset-0 blur-2xl bg-primary/10 rounded-full scale-150" />
          <div className="relative w-16 h-16 rounded-full border border-border/50 bg-card/50 flex items-center justify-center">
            <Icon className="w-7 h-7 text-muted-foreground/60" />
          </div>
        </div>
      )}
      
      <h3 className="font-display text-lg tracking-wide text-foreground/80 mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-sm text-muted-foreground/60 max-w-md mb-6 font-body leading-relaxed">
          {description}
        </p>
      )}
      
      {(action || secondaryAction) && (
        <div className="flex items-center gap-3">
          {action && (
            <Button 
              onClick={action.onClick}
              className="font-display tracking-wider"
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button 
              variant="outline"
              onClick={secondaryAction.onClick}
              className="font-display tracking-wider"
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
