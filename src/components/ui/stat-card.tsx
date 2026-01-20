import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    positive?: boolean;
  };
  color?: 'primary' | 'nulla' | 'amber' | 'silva' | 'default';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const colorClasses = {
  primary: {
    icon: 'bg-primary/10 text-primary',
    value: 'text-primary',
    border: 'border-primary/20',
  },
  nulla: {
    icon: 'bg-nulla/10 text-nulla',
    value: 'text-nulla',
    border: 'border-nulla/20',
  },
  amber: {
    icon: 'bg-amber-500/10 text-amber-500',
    value: 'text-amber-500',
    border: 'border-amber-500/20',
  },
  silva: {
    icon: 'bg-silva/10 text-silva',
    value: 'text-silva',
    border: 'border-silva/20',
  },
  default: {
    icon: 'bg-muted/50 text-muted-foreground',
    value: 'text-foreground',
    border: 'border-border',
  },
};

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'default',
  size = 'md',
  className,
}: StatCardProps) {
  const colors = colorClasses[color];
  
  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const valueClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'relative overflow-hidden rounded-lg border bg-card/50',
        colors.border,
        sizeClasses[size],
        className
      )}
    >
      {/* Background glow */}
      <div className={cn(
        'absolute -right-8 -top-8 w-24 h-24 rounded-full opacity-20 blur-2xl',
        colors.icon
      )} />

      <div className="relative z-10 flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-display tracking-[0.2em] uppercase text-muted-foreground/70">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <AnimatePresence mode="wait">
              <motion.span
                key={value.toString()}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className={cn('font-display font-bold', valueClasses[size], colors.value)}
              >
                {value}
              </motion.span>
            </AnimatePresence>
            {trend && (
              <span className={cn(
                'text-xs font-medium',
                trend.positive ? 'text-green-500' : 'text-red-500'
              )}>
                {trend.positive ? '+' : ''}{trend.value}%
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-muted-foreground/60">
              {subtitle}
            </p>
          )}
        </div>

        {icon && (
          <div className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
            colors.icon
          )}>
            {icon}
          </div>
        )}
      </div>
    </motion.div>
  );
}
