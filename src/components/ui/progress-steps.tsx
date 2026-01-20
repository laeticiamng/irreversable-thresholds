import * as React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface ProgressStepsProps {
  steps: {
    id: string;
    label: string;
    description?: string;
  }[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  className?: string;
}

export function ProgressSteps({
  steps,
  currentStep,
  onStepClick,
  className,
}: ProgressStepsProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isClickable = onStepClick && (isCompleted || isCurrent);

        return (
          <React.Fragment key={step.id}>
            {/* Step indicator */}
            <button
              onClick={() => isClickable && onStepClick?.(index)}
              disabled={!isClickable}
              className={cn(
                'flex items-center gap-3 transition-all duration-300',
                isClickable && 'cursor-pointer',
                !isClickable && 'cursor-default'
              )}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-display transition-all duration-300',
                  isCompleted && 'bg-primary text-primary-foreground',
                  isCurrent && 'bg-primary/20 text-primary border-2 border-primary',
                  !isCompleted && !isCurrent && 'bg-muted/30 text-muted-foreground border border-border'
                )}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : (
                  index + 1
                )}
              </div>
              <div className="hidden md:block text-left">
                <p className={cn(
                  'text-sm font-display',
                  (isCurrent || isCompleted) ? 'text-foreground' : 'text-muted-foreground'
                )}>
                  {step.label}
                </p>
                {step.description && (
                  <p className="text-xs text-muted-foreground/60">
                    {step.description}
                  </p>
                )}
              </div>
            </button>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div className={cn(
                'flex-1 h-px min-w-8 max-w-16',
                index < currentStep ? 'bg-primary' : 'bg-border'
              )} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
