import * as React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  color?: 'primary' | 'nulla' | 'amber' | 'silva';
  onClick?: () => void;
  disabled?: boolean;
  badge?: string;
  className?: string;
}

const colorConfig = {
  primary: {
    icon: 'text-primary',
    iconBg: 'bg-primary/10 border-primary/20',
    hoverBorder: 'hover:border-primary/40',
    hoverBg: 'hover:bg-primary/5',
  },
  nulla: {
    icon: 'text-nulla',
    iconBg: 'bg-nulla/10 border-nulla/20',
    hoverBorder: 'hover:border-nulla/40',
    hoverBg: 'hover:bg-nulla/5',
  },
  amber: {
    icon: 'text-amber-500',
    iconBg: 'bg-amber-500/10 border-amber-500/20',
    hoverBorder: 'hover:border-amber-500/40',
    hoverBg: 'hover:bg-amber-500/5',
  },
  silva: {
    icon: 'text-silva',
    iconBg: 'bg-silva/10 border-silva/20',
    hoverBorder: 'hover:border-silva/40',
    hoverBg: 'hover:bg-silva/5',
  },
};

export function FeatureCard({
  title,
  description,
  icon: Icon,
  color = 'primary',
  onClick,
  disabled = false,
  badge,
  className,
}: FeatureCardProps) {
  const colors = colorConfig[color];

  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={cn(
        'group relative p-5 rounded-lg border border-border/50 bg-card/30 text-left',
        'transition-all duration-300',
        onClick && !disabled && [colors.hoverBorder, colors.hoverBg, 'cursor-pointer'],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {/* Badge */}
      {badge && (
        <div className="absolute top-3 right-3">
          <span className="text-[10px] font-display tracking-wider uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
            {badge}
          </span>
        </div>
      )}

      {/* Icon */}
      <div className={cn(
        'w-10 h-10 rounded-lg border flex items-center justify-center mb-3',
        'transition-colors duration-300',
        colors.iconBg,
        onClick && !disabled && 'group-hover:scale-105'
      )}>
        <Icon className={cn('w-5 h-5', colors.icon)} />
      </div>

      {/* Content */}
      <h3 className="font-display text-base tracking-wide text-foreground mb-1">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground/70 leading-relaxed">
        {description}
      </p>
    </Component>
  );
}
