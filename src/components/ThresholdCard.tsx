import { Threshold } from '@/types/threshold';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ThresholdCardProps {
  threshold: Threshold;
  onCross?: () => void;
}

export function ThresholdCard({ threshold, onCross }: ThresholdCardProps) {
  const isCrossed = threshold.isCrossed;

  return (
    <div
      className={`
        relative p-6 border transition-all duration-500
        ${isCrossed 
          ? 'border-primary/40 bg-primary/5' 
          : 'border-border bg-card hover:border-foreground/30'
        }
      `}
    >
      {/* Crossed seal overlay */}
      {isCrossed && (
        <div className="absolute top-4 right-4 animate-seal-stamp">
          <div className="w-16 h-16 rounded-full border-2 border-primary flex items-center justify-center rotate-[-12deg]">
            <span className="text-primary text-[10px] font-display tracking-[0.2em] uppercase">
              Franchi
            </span>
          </div>
        </div>
      )}

      {/* Title */}
      <h3 className={`
        font-display text-xl tracking-wide mb-3
        ${isCrossed ? 'text-primary' : 'text-foreground'}
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
          Inscrit le {format(threshold.createdAt, "d MMMM yyyy 'à' HH:mm", { locale: fr })}
        </span>
        {isCrossed && threshold.crossedAt && (
          <span className="text-primary">
            Franchi le {format(threshold.crossedAt, "d MMMM yyyy 'à' HH:mm", { locale: fr })}
          </span>
        )}
      </div>

      {/* Cross action */}
      {!isCrossed && onCross && (
        <button
          onClick={onCross}
          className="mt-4 text-xs font-display tracking-[0.15em] uppercase text-foreground/50 hover:text-primary transition-colors duration-300"
        >
          Franchir ce seuil →
        </button>
      )}
    </div>
  );
}
