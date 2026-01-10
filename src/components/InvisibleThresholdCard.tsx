import { InvisibleThreshold, THRESH_TYPE_LABELS } from '@/types/database';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface InvisibleThresholdCardProps {
  threshold: InvisibleThreshold;
  onSense?: () => void;
}

export function InvisibleThresholdCard({ threshold, onSense }: InvisibleThresholdCardProps) {
  const isSensed = !!threshold.sensed_at;

  return (
    <div
      className={`
        relative p-8 border transition-all duration-500
        ${isSensed 
          ? 'border-amber-500/30 bg-amber-500/5' 
          : 'border-amber-500/10 bg-card/30 hover:border-amber-500/30'
        }
      `}
    >
      {/* Sensed indicator */}
      {isSensed && (
        <div className="absolute top-4 right-4 animate-seal-stamp">
          <div className="w-12 h-12 rounded-full border border-amber-500/50 flex items-center justify-center">
            <span className="text-amber-500 text-lg">◉</span>
          </div>
        </div>
      )}

      {/* Threshold type badge */}
      <div className="mb-4">
        <span className="text-xs font-display tracking-[0.15em] uppercase text-amber-500/70 px-2 py-1 border border-amber-500/20">
          {THRESH_TYPE_LABELS[threshold.thresh_type]}
        </span>
      </div>

      {/* Title */}
      <h3 className={`
        font-display text-xl tracking-wide mb-3
        ${isSensed ? 'text-amber-500' : 'text-foreground'}
      `}>
        {threshold.title}
      </h3>

      {/* Description */}
      <p className="text-muted-foreground text-sm leading-relaxed mb-4 font-body">
        {threshold.description}
      </p>

      {/* Dates */}
      <div className="flex flex-col gap-1 text-xs text-muted-foreground font-body">
        <span>
          Inscrit le {format(new Date(threshold.created_at), "d MMMM yyyy", { locale: fr })}
        </span>
        {isSensed && threshold.sensed_at && (
          <span className="text-amber-500">
            Ressenti le {format(new Date(threshold.sensed_at), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
          </span>
        )}
      </div>

      {/* Sense action */}
      {!isSensed && onSense && (
        <button
          onClick={onSense}
          className="mt-4 text-xs font-display tracking-[0.15em] uppercase text-foreground/50 hover:text-amber-500 transition-colors duration-300"
        >
          Marquer comme ressenti →
        </button>
      )}
    </div>
  );
}
