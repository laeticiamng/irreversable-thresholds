import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIAssistButtonProps {
  onClick: () => void;
  variant?: 'default' | 'compact' | 'ghost';
  className?: string;
  disabled?: boolean;
}

export function AIAssistButton({ 
  onClick, 
  variant = 'default',
  className,
  disabled 
}: AIAssistButtonProps) {
  if (variant === 'compact') {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "text-xs text-muted-foreground hover:text-primary",
          className
        )}
      >
        <Sparkles className="w-3 h-3 mr-1" />
        IA
      </Button>
    );
  }

  if (variant === 'ghost') {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
      >
        <Sparkles className="w-3 h-3" />
        Aide IA ✨
      </button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "border-primary/30 text-primary hover:bg-primary/10",
        className
      )}
    >
      <Sparkles className="w-4 h-4 mr-2" />
      Aide IA ✨
    </Button>
  );
}