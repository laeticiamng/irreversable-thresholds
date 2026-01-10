import { useState, useEffect } from 'react';
import { Threshold } from '@/types/threshold';
import { Button } from '@/components/ui/button';

interface CrossingCeremonyProps {
  threshold: Threshold;
  onConfirm: () => void;
  onCancel: () => void;
}

const CONFIRMATION_PHRASE = "Je franchis ce seuil";

export function CrossingCeremony({ threshold, onConfirm, onCancel }: CrossingCeremonyProps) {
  const [typedPhrase, setTypedPhrase] = useState('');
  const [stage, setStage] = useState<'warning' | 'confirm' | 'typing'>('warning');
  const [countdown, setCountdown] = useState(5);

  const isConfirmed = typedPhrase.toLowerCase() === CONFIRMATION_PHRASE.toLowerCase();

  useEffect(() => {
    if (stage === 'confirm' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [stage, countdown]);

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="max-w-lg w-full animate-fade-up">
        {stage === 'warning' && (
          <div className="text-center space-y-8">
            <div className="w-20 h-20 mx-auto border border-destructive/50 rounded-full flex items-center justify-center">
              <span className="text-destructive text-3xl font-display">!</span>
            </div>
            
            <div className="space-y-4">
              <h2 className="font-display text-2xl tracking-wide text-foreground">
                Point de non-retour
              </h2>
              <p className="text-muted-foreground text-sm font-body leading-relaxed">
                Vous vous apprêtez à franchir un seuil irréversible. 
                Cette action ne pourra pas être annulée, corrigée ou effacée.
              </p>
            </div>

            <div className="border border-border p-6 text-left">
              <h3 className="font-display text-lg text-foreground mb-2">
                {threshold.title}
              </h3>
              <p className="text-muted-foreground text-sm font-body">
                {threshold.description}
              </p>
            </div>

            <div className="flex gap-4 justify-center pt-4">
              <Button variant="stone" onClick={onCancel}>
                Reculer
              </Button>
              <Button variant="monument" onClick={() => setStage('confirm')}>
                Je comprends
              </Button>
            </div>
          </div>
        )}

        {stage === 'confirm' && (
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h2 className="font-display text-2xl tracking-wide text-foreground">
                Seconde confirmation
              </h2>
              <p className="text-muted-foreground text-sm font-body">
                Êtes-vous absolument certain ? Cette décision est définitive.
              </p>
            </div>

            <div className="flex gap-4 justify-center pt-4">
              <Button variant="stone" onClick={onCancel}>
                Non, je recule
              </Button>
              <Button 
                variant="seal" 
                onClick={() => setStage('typing')}
                disabled={countdown > 0}
              >
                {countdown > 0 ? `Attendre ${countdown}s` : 'Oui, je confirme'}
              </Button>
            </div>
          </div>
        )}

        {stage === 'typing' && (
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h2 className="font-display text-2xl tracking-wide text-foreground">
                Scellement final
              </h2>
              <p className="text-muted-foreground text-sm font-body">
                Tapez exactement : <span className="text-primary font-medium">"{CONFIRMATION_PHRASE}"</span>
              </p>
            </div>

            <input
              type="text"
              value={typedPhrase}
              onChange={(e) => setTypedPhrase(e.target.value)}
              placeholder={CONFIRMATION_PHRASE}
              className="w-full bg-transparent border-b-2 border-border py-4 text-center text-xl font-display text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary transition-colors"
              autoFocus
            />

            <div className="flex gap-4 justify-center pt-4">
              <Button variant="stone" onClick={onCancel}>
                Abandonner
              </Button>
              <Button 
                variant="seal" 
                onClick={onConfirm}
                disabled={!isConfirmed}
                className={isConfirmed ? 'animate-pulse-subtle' : ''}
              >
                Franchir définitivement
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
