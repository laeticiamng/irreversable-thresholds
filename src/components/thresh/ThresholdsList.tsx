import { InvisibleThreshold, THRESH_TYPE_LABELS, ThreshType } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Eye, Clock, Plus } from 'lucide-react';

interface ThresholdsListProps {
  thresholds: InvisibleThreshold[];
  onSense: (id: string) => void;
  onAddThreshold: () => void;
}

export function ThresholdsList({ thresholds, onSense, onAddThreshold }: ThresholdsListProps) {
  const pendingThresholds = thresholds.filter(t => !t.sensed_at);
  const sensedThresholds = thresholds.filter(t => t.sensed_at);

  if (thresholds.length === 0) {
    return (
      <div className="text-center py-24 border border-dashed border-amber-500/20">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full border border-amber-500/20 flex items-center justify-center">
          <Eye className="w-6 h-6 text-amber-500/40" />
        </div>
        <p className="text-muted-foreground font-body mb-6">
          Aucun seuil identifié pour l'instant.
        </p>
        <Button 
          onClick={onAddThreshold}
          className="bg-amber-500 hover:bg-amber-600 text-black font-display tracking-wider"
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter le premier seuil
        </Button>
      </div>
    );
  }

  const getTypeColor = (type: ThreshType) => {
    const colors: Record<ThreshType, string> = {
      trop: 'bg-red-500/20 text-red-400 border-red-500/30',
      pas_assez: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      rupture: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      evidence: 'bg-green-500/20 text-green-400 border-green-500/30',
      saturation: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      acceptabilite: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      tolerance: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    };
    return colors[type] || 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  };

  return (
    <div className="space-y-8">
      {/* Pending Thresholds */}
      {pendingThresholds.length > 0 && (
        <div>
          <h3 className="font-display text-lg text-foreground mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            En attente ({pendingThresholds.length})
          </h3>
          <div className="grid gap-4">
            {pendingThresholds.map((threshold) => (
              <div 
                key={threshold.id}
                className="p-6 border border-amber-500/20 bg-card/30 hover:bg-card/50 transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getTypeColor(threshold.thresh_type)}`}
                      >
                        {THRESH_TYPE_LABELS[threshold.thresh_type]}
                      </Badge>
                    </div>
                    <h4 className="font-display text-foreground mb-2">{threshold.title}</h4>
                    <p className="text-sm text-muted-foreground">{threshold.description}</p>
                    <p className="text-xs text-muted-foreground/60 mt-3">
                      Ajouté {formatDistanceToNow(new Date(threshold.created_at), { 
                        addSuffix: true, 
                        locale: fr 
                      })}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSense(threshold.id)}
                    className="text-amber-500 hover:text-amber-400 hover:bg-amber-500/10"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Ressenti
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sensed Thresholds */}
      {sensedThresholds.length > 0 && (
        <div>
          <h3 className="font-display text-lg text-foreground mb-4 flex items-center gap-2">
            <Eye className="w-4 h-4 text-green-500" />
            Ressentis ({sensedThresholds.length})
          </h3>
          <div className="grid gap-4">
            {sensedThresholds.map((threshold) => (
              <div 
                key={threshold.id}
                className="p-6 border border-green-500/20 bg-card/30 opacity-80"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getTypeColor(threshold.thresh_type)}`}
                      >
                        {THRESH_TYPE_LABELS[threshold.thresh_type]}
                      </Badge>
                      <Badge variant="outline" className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
                        Ressenti
                      </Badge>
                    </div>
                    <h4 className="font-display text-foreground mb-2">{threshold.title}</h4>
                    <p className="text-sm text-muted-foreground">{threshold.description}</p>
                    <p className="text-xs text-muted-foreground/60 mt-3">
                      Ressenti {threshold.sensed_at && formatDistanceToNow(new Date(threshold.sensed_at), { 
                        addSuffix: true, 
                        locale: fr 
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
