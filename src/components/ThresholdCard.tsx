import { Threshold } from '@/types/database';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ThresholdCardProps {
  threshold: Threshold;
  onCross?: () => void;
}

export function ThresholdCard({ threshold, onCross }: ThresholdCardProps) {
  const isCrossed = threshold.is_crossed;

  return (
    <div className={`relative p-6 border transition-all duration-500 ${isCrossed ? 'border-primary/40 bg-primary/5' : 'border-border bg-card hover:border-foreground/30'}`}>
      {isCrossed && (
        <div className="absolute top-4 right-4 animate-seal-stamp">
          <div className="w-16 h-16 rounded-full border-2 border-primary flex items-center justify-center rotate-[-12deg]">
            <span className="text-primary text-[10px] font-display tracking-[0.2em] uppercase">Franchi</span>
          </div>
        </div>
      )}
      <h3 className={`font-display text-xl tracking-wide mb-3 ${isCrossed ? 'text-primary' : 'text-foreground'}`}>{threshold.title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed mb-4 font-body">{threshold.description}</p>
      <div className="flex flex-col gap-1 text-xs text-muted-foreground font-body">
        <span>Inscrit le {format(new Date(threshold.created_at), "d MMMM yyyy", { locale: fr })}</span>
        {isCrossed && threshold.crossed_at && (
          <span className="text-primary">Franchi le {format(new Date(threshold.crossed_at), "d MMMM yyyy 'à' HH:mm", { locale: fr })}</span>
        )}
      </div>
      {!isCrossed && onCross && (
        <button onClick={onCross} className="mt-4 text-xs font-display tracking-[0.15em] uppercase text-foreground/50 hover:text-primary transition-colors duration-300">
          Franchir ce seuil →
        </button>
      )}
    </div>
  );
}
