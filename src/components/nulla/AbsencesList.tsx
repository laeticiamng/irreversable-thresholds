import { Absence, ABSENCE_CATEGORY_LABELS, IMPACT_LEVEL_LABELS } from '@/types/database';
import { Button } from '@/components/ui/button';
import { AbsenceActions } from './AbsenceActions';
import { Plus, Trash2 } from 'lucide-react';

const IMPACT_STYLES: Record<string, { color: string; bg: string }> = {
  low: { color: 'text-green-500', bg: 'bg-green-500/10' },
  moderate: { color: 'text-amber-500', bg: 'bg-amber-500/10' },
  high: { color: 'text-red-500', bg: 'bg-red-500/10' },
};

interface AbsencesListProps {
  absences: Absence[];
  onAddAbsence: () => void;
  onAddEffect?: (absence: Absence) => void;
  onDeleteEffect?: (effectId: string) => void;
  onEdit?: (data: {
    id: string;
    title?: string;
    description?: string;
    category?: string;
    impactLevel?: string;
    counterfactual?: string;
    evidenceNeeded?: string;
  }) => void;
  onDelete?: (id: string) => void;
  isAtLimit: boolean;
}

export function AbsencesList({ absences, onAddAbsence, onAddEffect, onDeleteEffect, onEdit, onDelete, isAtLimit }: AbsencesListProps) {
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
        const categoryKey = absence.category || 'autre';
        const category = ABSENCE_CATEGORY_LABELS[categoryKey as keyof typeof ABSENCE_CATEGORY_LABELS] || categoryKey;
        const impactKey = absence.impact_level || 'moderate';
        const impactLabel = IMPACT_LEVEL_LABELS[impactKey as keyof typeof IMPACT_LEVEL_LABELS] || impactKey;
        const impactStyle = IMPACT_STYLES[impactKey] || IMPACT_STYLES.moderate;

        return (
          <div
            key={absence.id}
            className="p-6 border border-nulla/20 bg-card/30 animate-fade-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h3 className="font-display text-lg text-foreground">{absence.title}</h3>
                  <span className="text-xs px-2 py-0.5 bg-nulla/10 text-nulla">
                    {category}
                  </span>
                  <span className={`text-xs px-2 py-0.5 ${impactStyle.bg} ${impactStyle.color}`}>
                    {impactLabel}
                  </span>
                </div>
              </div>
              {onEdit && onDelete && (
                <AbsenceActions
                  absence={absence}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              )}
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground mb-4">{absence.description}</p>

            {/* Effects */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-display tracking-wider text-nulla uppercase">
                  Effets concrets
                </h4>
                {onAddEffect && (
                  <button
                    onClick={() => onAddEffect(absence)}
                    className="text-xs text-nulla hover:text-nulla/80 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Ajouter
                  </button>
                )}
              </div>
              {absence.effects && absence.effects.length > 0 ? (
                <div className="space-y-2">
                  {absence.effects.map(effect => (
                    <div
                      key={effect.id}
                      className="p-3 bg-background/50 border-l-2 border-nulla/30 flex items-start justify-between group"
                    >
                      <div>
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
                      {onDeleteEffect && (
                        <button
                          onClick={() => onDeleteEffect(effect.id)}
                          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity ml-2"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground/50 italic">
                  Aucun effet documenté
                </p>
              )}
            </div>

            {/* Counterfactual */}
            {absence.counterfactual && (
              <div className="mb-4">
                <h4 className="text-xs font-display tracking-wider text-muted-foreground mb-2 uppercase">
                  Si cela existait...
                </h4>
                <p className="text-sm text-foreground/80 italic">
                  {absence.counterfactual}
                </p>
              </div>
            )}

            {/* Evidence needed */}
            {absence.evidence_needed && (
              <div>
                <h4 className="text-xs font-display tracking-wider text-muted-foreground mb-2 uppercase">
                  Preuve / accès requis
                </h4>
                <p className="text-sm text-foreground/80">
                  {absence.evidence_needed}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
