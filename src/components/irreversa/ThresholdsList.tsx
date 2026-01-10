import { Threshold, CATEGORY_LABELS, SEVERITY_LABELS, ThresholdCategory, Severity } from '@/types/database';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ThresholdActions } from './ThresholdActions';

interface ThresholdsListProps {
  thresholds: Threshold[];
  onCross: (id: string) => Promise<void>;
  onAddThreshold: () => void;
  onEdit?: (data: { id: string; title?: string; description?: string; category?: ThresholdCategory; severity?: Severity }) => void;
  onDelete?: (id: string) => void;
  isAtLimit: boolean;
}

export function ThresholdsList({ thresholds, onCross, onAddThreshold, onEdit, onDelete, isAtLimit }: ThresholdsListProps) {
  if (thresholds.length === 0) {
    return (
      <div className="text-center py-16 border border-dashed border-primary/20">
        <p className="text-muted-foreground mb-4">Aucun seuil dans ce dossier.</p>
        {!isAtLimit && (
          <Button onClick={onAddThreshold} className="bg-primary text-primary-foreground">
            Ajouter un seuil
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {thresholds.map(threshold => (
        <div 
          key={threshold.id} 
          className={`p-6 border ${threshold.is_crossed ? 'border-primary/30 bg-primary/5' : 'border-border/50'}`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-display text-lg text-foreground">{threshold.title}</h3>
                <span className={`text-xs px-2 py-0.5 ${threshold.is_crossed ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  {threshold.is_crossed ? 'Franchi' : 'En attente'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{threshold.description}</p>
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground/60">
                {threshold.category && <span>{CATEGORY_LABELS[threshold.category]}</span>}
                {threshold.severity && <span>• {SEVERITY_LABELS[threshold.severity]}</span>}
                {threshold.crossed_at && (
                  <span>• Franchi le {format(new Date(threshold.crossed_at), 'd MMM yyyy', { locale: fr })}</span>
                )}
              </div>
            </div>
            {!threshold.is_crossed && (
              <Button 
                onClick={() => onCross(threshold.id)}
                variant="outline"
                className="border-primary/30 text-primary hover:bg-primary/10"
              >
                Franchir
              </Button>
            )}
          </div>
          {onEdit && onDelete && (
            <ThresholdActions 
              threshold={threshold} 
              onEdit={onEdit} 
              onDelete={onDelete} 
            />
          )}
        </div>
      ))}
    </div>
  );
}
