import { Absence, EFFECT_LABELS } from '@/types/absence';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AbsenceCardProps {
  absence: Absence;
  onAddEffect?: () => void;
  onViewEffects?: () => void;
}

export function AbsenceCard({ absence, onAddEffect, onViewEffects }: AbsenceCardProps) {
  const hasEffects = absence.effects.length > 0;

  return (
    <div className="relative p-8 border border-nulla/20 bg-card/50 hover:border-nulla/40 transition-all duration-500">
      {/* Void indicator */}
      <div className="absolute top-4 right-4">
        <div className="w-3 h-3 rounded-full bg-nulla/20 animate-void-breathe" />
      </div>

      {/* Title - styled as absence */}
      <h3 className="font-display text-xl tracking-wide text-nulla mb-3">
        <span className="opacity-40">∅</span> {absence.title}
      </h3>

      {/* Description */}
      <p className="text-muted-foreground text-sm leading-relaxed mb-4 font-body">
        {absence.description}
      </p>

      {/* Effects summary */}
      {hasEffects && (
        <div className="flex flex-wrap gap-2 mb-4">
          {absence.effects.slice(0, 3).map((effect) => (
            <span 
              key={effect.id}
              className="text-xs px-2 py-1 bg-nulla/10 text-nulla/70 font-display tracking-wider uppercase"
            >
              {EFFECT_LABELS[effect.type]}
            </span>
          ))}
          {absence.effects.length > 3 && (
            <span className="text-xs px-2 py-1 text-nulla/50">
              +{absence.effects.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Date */}
      <div className="text-xs text-muted-foreground font-body mb-4">
        Déclarée le {format(absence.createdAt, "d MMMM yyyy", { locale: fr })}
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        {onAddEffect && (
          <button
            onClick={onAddEffect}
            className="text-xs font-display tracking-[0.15em] uppercase text-nulla/50 hover:text-nulla transition-colors duration-300"
          >
            Observer un effet →
          </button>
        )}
        {onViewEffects && hasEffects && (
          <button
            onClick={onViewEffects}
            className="text-xs font-display tracking-[0.15em] uppercase text-nulla/50 hover:text-nulla transition-colors duration-300"
          >
            Voir les effets ({absence.effects.length})
          </button>
        )}
      </div>
    </div>
  );
}
