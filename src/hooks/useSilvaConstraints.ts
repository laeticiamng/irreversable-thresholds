import { useState, useEffect, useCallback } from 'react';

export interface SilvaConstraint {
  type: 'delay' | 'spacing' | 'silence' | 'impossibility';
  duration: number; // in seconds
  message?: string;
}

interface UseSilvaConstraintsOptions {
  minDelayBeforeAction?: number; // seconds before any action can be taken
  spacingBetweenActions?: number; // seconds between consecutive actions
  enforceSlowness?: boolean;
}

export function useSilvaConstraints(options: UseSilvaConstraintsOptions = {}) {
  const {
    minDelayBeforeAction = 5,
    spacingBetweenActions = 10,
    enforceSlowness = true,
  } = options;

  const [timeInSpace, setTimeInSpace] = useState(0);
  const [lastActionTime, setLastActionTime] = useState<number | null>(null);
  const [activeConstraint, setActiveConstraint] = useState<SilvaConstraint | null>(null);

  // Track time in space
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeInSpace(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Check if initial delay has passed
  const canAct = timeInSpace >= minDelayBeforeAction;

  // Check if spacing constraint is satisfied
  const spacingRemaining = lastActionTime !== null 
    ? Math.max(0, spacingBetweenActions - (timeInSpace - lastActionTime))
    : 0;

  const isSpacingActive = spacingRemaining > 0;

  // Attempt an action - returns true if allowed, false if constrained
  const attemptAction = useCallback((actionName?: string): boolean => {
    if (!enforceSlowness) {
      setLastActionTime(timeInSpace);
      return true;
    }

    if (!canAct) {
      setActiveConstraint({
        type: 'delay',
        duration: minDelayBeforeAction - timeInSpace,
        message: 'Le milieu impose un délai initial.',
      });
      return false;
    }

    if (isSpacingActive) {
      setActiveConstraint({
        type: 'spacing',
        duration: spacingRemaining,
        message: 'Un espacement est nécessaire entre les actions.',
      });
      return false;
    }

    // Action allowed
    setLastActionTime(timeInSpace);
    setActiveConstraint(null);
    return true;
  }, [canAct, enforceSlowness, isSpacingActive, minDelayBeforeAction, spacingRemaining, timeInSpace]);

  // Clear constraint message
  const clearConstraint = useCallback(() => {
    setActiveConstraint(null);
  }, []);

  // Get remaining time for any active constraint
  const getRemainingDelay = useCallback((): number => {
    if (!canAct) return minDelayBeforeAction - timeInSpace;
    if (isSpacingActive) return spacingRemaining;
    return 0;
  }, [canAct, isSpacingActive, minDelayBeforeAction, spacingRemaining, timeInSpace]);

  return {
    timeInSpace,
    canAct,
    isSpacingActive,
    spacingRemaining,
    activeConstraint,
    attemptAction,
    clearConstraint,
    getRemainingDelay,
  };
}
