import { Absence, EFFECT_LABELS } from '@/types/database';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';

interface ViewEffectsProps {
  absence: Absence;
  onClose: () => void;
}

export function ViewEffects({ absence, onClose }: ViewEffectsProps) {
  const effects = absence.effects || [];
  
  // Group effects by type
  const effectsByType = effects.reduce((acc, effect) => {
    if (!acc[effect.effect_type]) acc[effect.effect_type] = [];
    acc[effect.effect_type].push(effect);
    return acc;
  }, {} as Record<string, typeof effects>);

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
              {effects.length} effet{effects.length !== 1 ? 's' : ''} observé{effects.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Effects by type */}
          <div className="space-y-6">
            {Object.entries(effectsByType).map(([type, typeEffects]) => (
              <div key={type} className="space-y-3">
                <h3 className="text-xs font-display tracking-[0.2em] uppercase text-nulla/60">
                  {EFFECT_LABELS[type as keyof typeof EFFECT_LABELS]}
                </h3>
                <div className="space-y-2">
                  {typeEffects.map((effect) => (
                    <div 
                      key={effect.id}
                      className="p-4 border border-border bg-secondary/30"
                    >
                      <p className="text-sm font-body text-foreground/80 mb-2">
                        {effect.description}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(effect.created_at), "d MMM yyyy", { locale: fr })}
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
