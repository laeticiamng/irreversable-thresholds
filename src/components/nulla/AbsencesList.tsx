import { Absence } from '@/types/database';
import { Button } from '@/components/ui/button';

const CATEGORY_LABELS: Record<string, string> = {
  ressource: 'Ressource',
  preuve: 'Preuve / Document',
  acces: 'Accès',
  competence: 'Compétence',
  protection: 'Protection',
  information: 'Information',
  relation: 'Relation / Soutien',
  stabilite: 'Stabilité',
  autre: 'Autre',
};

const IMPACT_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  low: { label: 'Faible', color: 'text-green-500', bg: 'bg-green-500/10' },
  moderate: { label: 'Modéré', color: 'text-amber-500', bg: 'bg-amber-500/10' },
  high: { label: 'Élevé', color: 'text-red-500', bg: 'bg-red-500/10' },
};

interface AbsencesListProps {
  absences: Absence[];
  onAddAbsence: () => void;
  isAtLimit: boolean;
}

export function AbsencesList({ absences, onAddAbsence, isAtLimit }: AbsencesListProps) {
  if (absences.length === 0) {
    return (
      <div className="text-center py-24 border border-dashed border-nulla/20">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full border border-nulla/20 flex items-center justify-center">
          <span className="text-2xl text-nulla/40">∅</span>
        </div>
        <p className="text-muted-foreground font-body mb-6">
          Aucune absence déclarée pour ce dossier.
        </p>
        {!isAtLimit && (
          <Button 
            onClick={onAddAbsence}
            className="bg-nulla hover:bg-nulla/90 text-primary-foreground"
          >
            Déclarer la première absence
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {absences.map((absence, index) => {
        const category = CATEGORY_LABELS[(absence as any).category || 'autre'];
        const impact = IMPACT_LABELS[(absence as any).impact_level || 'moderate'];
        const counterfactual = (absence as any).counterfactual;
        const evidenceNeeded = (absence as any).evidence_needed;

        return (
          <div 
            key={absence.id}
            className="p-6 border border-nulla/20 bg-card/30 animate-fade-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-display text-lg text-foreground">{absence.title}</h3>
                  <span className="text-xs px-2 py-0.5 bg-nulla/10 text-nulla">
                    {category}
                  </span>
                  <span className={`text-xs px-2 py-0.5 ${impact.bg} ${impact.color}`}>
                    {impact.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Effects */}
            {absence.effects && absence.effects.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-display tracking-wider text-nulla mb-2 uppercase">
                  Effets concrets
                </h4>
                <div className="space-y-2">
                  {absence.effects.map(effect => (
                    <div 
                      key={effect.id}
                      className="p-3 bg-background/50 border-l-2 border-nulla/30"
                    >
                      <span className={`text-xs font-display uppercase mr-2 ${
                        effect.effect_type === 'prevents' ? 'text-red-500' :
                        effect.effect_type === 'enables' ? 'text-green-500' :
                        effect.effect_type === 'forces' ? 'text-amber-500' :
                        'text-blue-500'
                      }`}>
                        {effect.effect_type === 'prevents' ? 'Empêche' :
                         effect.effect_type === 'enables' ? 'Permet' :
                         effect.effect_type === 'forces' ? 'Force' : 'Préserve'}:
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {effect.description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Counterfactual */}
            {counterfactual && (
              <div className="mb-4">
                <h4 className="text-xs font-display tracking-wider text-muted-foreground mb-2 uppercase">
                  Si cela existait...
                </h4>
                <p className="text-sm text-foreground/80 italic">
                  {counterfactual}
                </p>
              </div>
            )}

            {/* Evidence needed */}
            {evidenceNeeded && (
              <div>
                <h4 className="text-xs font-display tracking-wider text-muted-foreground mb-2 uppercase">
                  Preuve / accès requis
                </h4>
                <p className="text-sm text-foreground/80">
                  {evidenceNeeded}
                </p>
              </div>
            )}

            {/* Empty effects state */}
            {(!absence.effects || absence.effects.length === 0) && (
              <p className="text-sm text-muted-foreground/50 italic">
                Aucun effet documenté. Ajoutez un effet pour décrire ce que cette absence provoque.
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
