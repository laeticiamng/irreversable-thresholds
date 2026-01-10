import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSilvaConstraints } from '@/hooks/useSilvaConstraints';
import { useSilvaSessions } from '@/hooks/useSilvaSessions';
import { useAuth } from '@/hooks/useAuth';

// SILVA - A digital milieu that does nothing but structures through presence
// No actions, no functionality, no results - only constraint through being

export default function SilvaSpace() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [phase, setPhase] = useState(0);
  const [showMessage, setShowMessage] = useState(false);
  const sessionStarted = useRef(false);
  
  const { 
    timeInSpace, 
    canAct, 
    activeConstraint,
    attemptAction,
    clearConstraint,
    getRemainingDelay,
  } = useSilvaConstraints({
    minDelayBeforeAction: 30,
    spacingBetweenActions: 60,
    enforceSlowness: true,
  });

  const {
    startSession,
    endSession,
  } = useSilvaSessions(user?.id);

  // Start session on mount (only once)
  useEffect(() => {
    if (user && !sessionStarted.current) {
      sessionStarted.current = true;
      startSession.mutate();
    }
  }, [user]);

  // End session on unmount or navigation
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (timeInSpace > 0) {
        endSession.mutate(timeInSpace);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (timeInSpace > 0 && sessionStarted.current) {
        endSession.mutate(timeInSpace);
      }
    };
  }, [timeInSpace]);

  // Handle exit
  const handleExit = () => {
    if (timeInSpace > 0) {
      endSession.mutate(timeInSpace);
    }
    navigate('/');
  };

  // Phases change very slowly - like seasons
  useEffect(() => {
    const phaseInterval = setInterval(() => {
      setPhase(prev => (prev + 1) % 4);
    }, 60000);
    return () => clearInterval(phaseInterval);
  }, []);

  // Show constraint message briefly when triggered
  useEffect(() => {
    if (activeConstraint) {
      setShowMessage(true);
      const timer = setTimeout(() => {
        setShowMessage(false);
        clearConstraint();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [activeConstraint, clearConstraint]);

  // Handle any interaction attempt
  const handleInteraction = () => {
    attemptAction();
  };

  return (
    <div 
      className="fixed inset-0 surface-silva overflow-hidden cursor-default select-none"
      onClick={handleInteraction}
    >
      {/* Ambient layers - no interaction possible */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Slow drifting particles */}
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-silva-foreground/10 animate-silva-drift"
            style={{
              left: `${10 + (i * 7) % 80}%`,
              top: `${15 + (i * 11) % 70}%`,
              animationDelay: `${i * 2.5}s`,
              animationDuration: `${25 + i * 3}s`,
            }}
          />
        ))}
        
        {/* Very slow breathing circles */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] rounded-full border border-silva/20 animate-silva-breathe"
          style={{ animationDelay: '0s' }}
        />
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] rounded-full border border-silva/15 animate-silva-breathe"
          style={{ animationDelay: '4s' }}
        />
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[20vw] h-[20vw] rounded-full border border-silva/10 animate-silva-breathe"
          style={{ animationDelay: '8s' }}
        />

        {/* Fading presence indicators */}
        <div 
          className="absolute top-[20%] left-[15%] w-32 h-32 rounded-full bg-silva/5 animate-silva-fade blur-3xl"
          style={{ animationDelay: '0s' }}
        />
        <div 
          className="absolute bottom-[25%] right-[20%] w-48 h-48 rounded-full bg-silva/5 animate-silva-fade blur-3xl"
          style={{ animationDelay: '7s' }}
        />
      </div>

      {/* Central presence - no text, just form */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative">
          {/* The void at the center */}
          <div className="w-4 h-4 rounded-full bg-silva/30 animate-silva-pulse" />
        </div>
      </div>

      {/* Constraint message - appears when user tries to act too soon */}
      <div 
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center transition-all duration-1000 pointer-events-none ${
          showMessage && activeConstraint ? 'opacity-40' : 'opacity-0'
        }`}
      >
        <p className="text-sm font-display tracking-[0.15em] text-silva-foreground/60 mb-2">
          {activeConstraint?.message}
        </p>
        <p className="text-xs font-body text-silva-foreground/40">
          {getRemainingDelay() > 0 && `${Math.ceil(getRemainingDelay())}s`}
        </p>
      </div>

      {/* Minimal presence indicator - appears slowly */}
      <div 
        className="absolute bottom-8 sm:bottom-12 left-1/2 -translate-x-1/2 text-center transition-opacity duration-[10000ms]"
        style={{ opacity: timeInSpace > 10 ? 0.3 : 0 }}
      >
        <p className="text-xs font-display tracking-[0.3em] text-silva-foreground/40 uppercase">
          {timeInSpace < 60 
            ? '' 
            : timeInSpace < 120 
              ? 'présence'
              : timeInSpace < 300
                ? 'silence'
                : 'milieu'
          }
        </p>
      </div>

      {/* Exit - only visible after time has passed */}
      <div 
        className={`absolute top-4 sm:top-6 left-4 sm:left-6 transition-opacity duration-[5000ms] ${
          canAct ? 'opacity-30 hover:opacity-60' : 'opacity-0 pointer-events-none'
        }`}
      >
        <button 
          onClick={handleExit}
          className="text-xs font-display tracking-[0.2em] text-silva-foreground/50 py-2 px-3 -ml-3 block bg-transparent border-none cursor-pointer"
        >
          ← sortir
        </button>
      </div>

      {/* Time spent - appears very late, very faint */}
      <div 
        className="absolute top-4 sm:top-6 right-4 sm:right-6 transition-opacity duration-[10000ms]"
        style={{ opacity: timeInSpace > 120 ? 0.15 : 0 }}
      >
        <span className="text-xs font-body text-silva-foreground/30">
          {Math.floor(timeInSpace / 60)}:{(timeInSpace % 60).toString().padStart(2, '0')}
        </span>
      </div>

      {/* Phase indicator - extremely subtle */}
      <div 
        className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6 transition-opacity duration-[15000ms]"
        style={{ opacity: timeInSpace > 300 ? 0.1 : 0 }}
      >
        <span className="text-xs font-display tracking-[0.2em] text-silva-foreground/20">
          {['◦', '○', '◦', '·'][phase]}
        </span>
      </div>
    </div>
  );
}
