import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

// SILVA - A digital milieu that does nothing but structures through presence
// No actions, no functionality, no results - only constraint through being

export default function SilvaSpace() {
  const [timeInSpace, setTimeInSpace] = useState(0);
  const [phase, setPhase] = useState(0);

  // Very slow time passage - the space imposes its rhythm
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeInSpace(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Phases change very slowly - like seasons
  useEffect(() => {
    const phaseInterval = setInterval(() => {
      setPhase(prev => (prev + 1) % 4);
    }, 60000); // Change every minute
    return () => clearInterval(phaseInterval);
  }, []);

  // Prevent rapid interactions
  const [canLeave, setCanLeave] = useState(false);
  useEffect(() => {
    // Must spend at least 30 seconds before exit becomes visible
    const timer = setTimeout(() => setCanLeave(true), 30000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 surface-silva overflow-hidden cursor-default select-none">
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

      {/* Minimal presence indicator - appears slowly */}
      <div 
        className="absolute bottom-12 left-1/2 -translate-x-1/2 text-center transition-opacity duration-[10000ms]"
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
        className={`absolute top-6 left-6 transition-opacity duration-[5000ms] ${canLeave ? 'opacity-30 hover:opacity-60' : 'opacity-0 pointer-events-none'}`}
      >
        <Link 
          to="/" 
          className="text-xs font-display tracking-[0.2em] text-silva-foreground/50"
        >
          ← sortir
        </Link>
      </div>

      {/* Time spent - appears very late, very faint */}
      <div 
        className="absolute top-6 right-6 transition-opacity duration-[10000ms]"
        style={{ opacity: timeInSpace > 120 ? 0.15 : 0 }}
      >
        <span className="text-xs font-body text-silva-foreground/30">
          {Math.floor(timeInSpace / 60)}:{(timeInSpace % 60).toString().padStart(2, '0')}
        </span>
      </div>
    </div>
  );
}
