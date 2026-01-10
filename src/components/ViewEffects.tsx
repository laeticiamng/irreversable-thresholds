import { Absence, EFFECT_LABELS } from '@/types/absence';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';

interface ViewEffectsProps {
  absence: Absence;
  onClose: () => void;
}

export function ViewEffects({ absence, onClose }: ViewEffectsProps) {
  // Group effects by type
  const effectsByType = absence.effects.reduce((acc, effect) => {
    if (!acc[effect.type]) acc[effect.type] = [];
    acc[effect.type].push(effect);
    return acc;
  }, {} as Record<string, typeof absence.effects>);

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full max-h-[80vh] overflow-y-auto animate-fade-up">
        <div className="border border-nulla/20 p-8 bg-card">
          {/* Header */}
          <div className="mb-8">
            <h2 className="font-display text-2xl tracking-wide text-nulla mb-2">
              <span className="opacity-40">∅</span> {absence.title}
            </h2>
            <p className="text-muted-foreground text-sm font-body">
              {absence.effects.length} effet{absence.effects.length !== 1 ? 's' : ''} observé{absence.effects.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Effects by type */}
          <div className="space-y-6">
            {Object.entries(effectsByType).map(([type, effects]) => (
              <div key={type} className="space-y-3">
                <h3 className="text-xs font-display tracking-[0.2em] uppercase text-nulla/60">
                  {EFFECT_LABELS[type as keyof typeof EFFECT_LABELS]}
                </h3>
                <div className="space-y-2">
                  {effects.map((effect) => (
                    <div 
                      key={effect.id}
                      className="p-4 border border-border bg-secondary/30"
                    >
                      <p className="text-sm font-body text-foreground/80 mb-2">
                        {effect.description}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {format(effect.createdAt, "d MMM yyyy", { locale: fr })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Close button */}
          <div className="mt-8 pt-6 border-t border-border">
            <Button variant="stone" onClick={onClose}>
              Fermer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
