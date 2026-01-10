import { Threshold, CONSEQUENCE_TYPE_LABELS, ThresholdConsequence } from '@/types/database';

interface ConsequencesViewProps {
  thresholds: Threshold[];
  onAddConsequence: (data: { thresholdId: string; consequenceType: ThresholdConsequence['consequence_type']; description: string }) => Promise<unknown>;
}

export function ConsequencesView({ thresholds }: ConsequencesViewProps) {
  const crossedThresholds = thresholds.filter(t => t.is_crossed);

  if (crossedThresholds.length === 0) {
    return (
      <div className="text-center py-16 border border-dashed border-primary/20">
        <p className="text-muted-foreground">Aucun seuil franchi. Les conséquences apparaîtront ici.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {crossedThresholds.map(threshold => (
        <div key={threshold.id} className="p-6 border border-primary/20 bg-card/30">
          <h3 className="font-display text-lg text-primary mb-4">
            Après « {threshold.title} »
          </h3>
          
          {threshold.what_cannot_be_undone && (
            <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20">
              <h4 className="text-xs font-display uppercase text-destructive/70 mb-2">Ce qui ne peut pas être défait</h4>
              <p className="text-sm text-foreground">{threshold.what_cannot_be_undone}</p>
            </div>
          )}

          {threshold.what_changes_after && (
            <div className="p-4 bg-primary/5 border border-primary/20">
              <h4 className="text-xs font-display uppercase text-primary/70 mb-2">Ce qui change durablement</h4>
              <p className="text-sm text-foreground">{threshold.what_changes_after}</p>
            </div>
          )}

          {threshold.consequences && threshold.consequences.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-xs font-display uppercase text-muted-foreground">Implications</h4>
              {threshold.consequences.map(c => (
                <div key={c.id} className="flex items-start gap-2 text-sm">
                  <span className="text-primary">•</span>
                  <span className="text-muted-foreground">
                    <strong>{CONSEQUENCE_TYPE_LABELS[c.consequence_type]}:</strong> {c.description}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
