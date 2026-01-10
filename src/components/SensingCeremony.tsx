import { useState } from 'react';
import { InvisibleThreshold } from '@/types/database';
import { Button } from '@/components/ui/button';

interface SensingCeremonyProps {
  threshold: InvisibleThreshold;
  onConfirm: () => void;
  onCancel: () => void;
}

export function SensingCeremony({ threshold, onConfirm, onCancel }: SensingCeremonyProps) {
  const [stage, setStage] = useState<'acknowledge' | 'confirm'>('acknowledge');

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="max-w-lg w-full animate-fade-up">
        {stage === 'acknowledge' && (
          <div className="text-center space-y-8">
            <div className="w-20 h-20 mx-auto border border-amber-500/50 rounded-full flex items-center justify-center animate-void-breathe">
              <span className="text-amber-500 text-3xl">◉</span>
            </div>
            
            <div className="space-y-4">
              <h2 className="font-display text-2xl tracking-wide text-foreground">
                Reconnaissance du seuil
              </h2>
              <p className="text-muted-foreground text-sm font-body leading-relaxed">
                Vous vous apprêtez à reconnaître que ce seuil a été ressenti.
                Pas mesuré. Pas calculé. Ressenti.
              </p>
            </div>

            <div className="border border-amber-500/20 p-6 text-left">
              <h3 className="font-display text-lg text-foreground mb-2">
                {threshold.title}
              </h3>
              <p className="text-muted-foreground text-sm font-body">
                {threshold.description}
              </p>
            </div>

            <div className="flex gap-4 justify-center pt-4">
              <Button variant="stone" onClick={onCancel}>
                Pas encore
              </Button>
              <Button 
                variant="monument" 
                onClick={() => setStage('confirm')}
                className="border-amber-500/30 text-amber-500 hover:border-amber-500"
              >
                Je l'ai ressenti
              </Button>
            </div>
          </div>
        )}

        {stage === 'confirm' && (
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h2 className="font-display text-2xl tracking-wide text-amber-500">
                Confirmation
              </h2>
              <p className="text-muted-foreground text-sm font-body">
                À partir de là, quelque chose a changé.
              </p>
            </div>

            <div className="py-8">
              <blockquote className="font-display text-xl italic text-foreground/80">
                "Le seuil ne déclenche rien. Il existe, c'est tout."
              </blockquote>
            </div>

            <div className="flex gap-4 justify-center pt-4">
              <Button variant="stone" onClick={onCancel}>
                Annuler
              </Button>
              <Button 
                variant="seal" 
                onClick={onConfirm}
                className="bg-gradient-to-r from-amber-600 to-amber-500"
              >
                Marquer comme ressenti
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
