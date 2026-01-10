import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye, Pause, Play, X, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useSilvaSessions } from '@/hooks/useSilvaSessions';
import { useAuth } from '@/hooks/useAuth';

interface FocusModeProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: (durationSeconds: number) => void;
  caseId?: string;
}

const FOCUS_PRESETS = [
  { label: '5 min', seconds: 5 * 60 },
  { label: '15 min', seconds: 15 * 60 },
  { label: '25 min', seconds: 25 * 60 },
  { label: '45 min', seconds: 45 * 60 },
];

export function FocusMode({ open, onOpenChange, onComplete, caseId }: FocusModeProps) {
  const { user } = useAuth();
  const { startSession, endSession, getSessionCount, getTotalTimeSpent } = useSilvaSessions(user?.id);
  
  const [selectedPreset, setSelectedPreset] = useState(FOCUS_PRESETS[2]); // 25 min default
  const [timeRemaining, setTimeRemaining] = useState(selectedPreset.seconds);
  const [isRunning, setIsRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Reset when preset changes
  useEffect(() => {
    if (!hasStarted) {
      setTimeRemaining(selectedPreset.seconds);
    }
  }, [selectedPreset, hasStarted]);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeRemaining]);

  const handleStart = useCallback(async () => {
    setIsRunning(true);
    setHasStarted(true);
    // Start a session in the database
    if (user) {
      try {
        await startSession.mutateAsync();
      } catch (e) {
        console.error('Failed to start session:', e);
      }
    }
  }, [user, startSession]);

  const handlePause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const handleResume = useCallback(() => {
    setIsRunning(true);
  }, []);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    setHasStarted(false);
    setTimeRemaining(selectedPreset.seconds);
  }, [selectedPreset.seconds]);

  const handleComplete = useCallback(async () => {
    const totalDuration = selectedPreset.seconds - timeRemaining;
    // End session in database
    if (user) {
      try {
        await endSession.mutateAsync(totalDuration);
      } catch (e) {
        console.error('Failed to end session:', e);
      }
    }
    toast.success(`Session Focus terminée · ${selectedPreset.label}`, {
      description: `Tu as maintenu ton attention pendant ${Math.round(totalDuration / 60)} minutes.`,
    });
    onComplete?.(totalDuration);
    handleReset();
  }, [selectedPreset, timeRemaining, user, endSession, onComplete]);

  const handleClose = useCallback(() => {
    if (hasStarted && timeRemaining > 0) {
      const confirmed = window.confirm('Quitter le mode focus ? La session en cours sera perdue.');
      if (!confirmed) return;
    }
    handleReset();
    onOpenChange(false);
  }, [hasStarted, timeRemaining, onOpenChange]);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress
  const progress = hasStarted ? 1 - (timeRemaining / selectedPreset.seconds) : 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md border-amber-500/20 bg-background p-0 overflow-hidden">
        <div className="relative min-h-[400px] flex flex-col items-center justify-center p-8">
          {/* Background gradient based on progress */}
          <div 
            className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent transition-opacity duration-1000"
            style={{ opacity: hasStarted ? 0.5 + progress * 0.5 : 0.3 }}
          />

          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            onClick={handleClose}
          >
            <X className="w-4 h-4" />
          </Button>

          {/* Sound toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 left-4 text-muted-foreground hover:text-foreground"
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>

          {/* Icon */}
          <div className="relative z-10 w-16 h-16 rounded-full border border-amber-500/30 flex items-center justify-center mb-8">
            <Eye className={`w-6 h-6 ${isRunning ? 'text-amber-500' : 'text-amber-500/50'}`} />
            {isRunning && (
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-amber-500"
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 1.3, opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </div>

          {/* Title */}
          <h2 className="font-display text-xl tracking-[0.2em] text-amber-500 mb-2 relative z-10">
            MODE FOCUS
          </h2>
          <p className="text-xs text-muted-foreground/60 mb-8 relative z-10">
            {isRunning ? 'Reste présent·e' : 'Choisis ta durée'}
          </p>

          {/* Timer display */}
          <AnimatePresence mode="wait">
            <motion.div
              key={hasStarted ? 'timer' : 'presets'}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="relative z-10 mb-8"
            >
              {hasStarted ? (
                <div className="text-center">
                  <div className="text-6xl font-display text-foreground mb-4">
                    {formatTime(timeRemaining)}
                  </div>
                  {/* Progress bar */}
                  <div className="w-48 h-1 bg-muted/30 overflow-hidden mx-auto">
                    <motion.div
                      className="h-full bg-amber-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap justify-center gap-2">
                  {FOCUS_PRESETS.map((preset) => (
                    <Button
                      key={preset.label}
                      variant={selectedPreset.label === preset.label ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedPreset(preset)}
                      className={
                        selectedPreset.label === preset.label
                          ? 'bg-amber-500 text-black hover:bg-amber-600'
                          : 'border-amber-500/30 text-muted-foreground hover:border-amber-500 hover:text-amber-500'
                      }
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <div className="flex items-center gap-4 relative z-10">
            {!hasStarted ? (
              <Button
                onClick={handleStart}
                className="bg-amber-500 hover:bg-amber-600 text-black font-display tracking-wider px-8"
              >
                Commencer
              </Button>
            ) : (
              <>
                {isRunning ? (
                  <Button
                    variant="outline"
                    onClick={handlePause}
                    className="border-amber-500/30 text-amber-500 hover:bg-amber-500/10"
                  >
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </Button>
                ) : (
                  <Button
                    onClick={handleResume}
                    className="bg-amber-500 hover:bg-amber-600 text-black"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Reprendre
                  </Button>
                )}
                <Button
                  variant="ghost"
                  onClick={handleReset}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Annuler
                </Button>
              </>
            )}
          </div>

          {/* Breathing guide when running */}
          {isRunning && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute bottom-8 text-xs text-muted-foreground/40 text-center"
            >
              Respire. Observe. Reste.
            </motion.p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
