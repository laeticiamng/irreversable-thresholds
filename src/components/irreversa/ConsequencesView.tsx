import { useState } from 'react';
import { Threshold, CONSEQUENCE_TYPE_LABELS, ThresholdConsequence } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, X } from 'lucide-react';

interface ConsequencesViewProps {
  thresholds: Threshold[];
  onAddConsequence: (data: { thresholdId: string; consequenceType: ThresholdConsequence['consequence_type']; description: string }) => Promise<unknown>;
  onDeleteConsequence?: (consequenceId: string) => Promise<unknown>;
}

const CONSEQUENCE_TYPES: { value: ThresholdConsequence['consequence_type']; label: string; color: string }[] = [
  { value: 'impossible', label: 'Devient impossible', color: 'text-red-500 border-red-500/30' },
  { value: 'costly', label: 'Devient très coûteux', color: 'text-amber-500 border-amber-500/30' },
  { value: 'changed', label: 'Change durablement', color: 'text-blue-500 border-blue-500/30' },
  { value: 'enabled', label: 'Devient possible', color: 'text-green-500 border-green-500/30' },
];

export function ConsequencesView({ thresholds, onAddConsequence, onDeleteConsequence }: ConsequencesViewProps) {
  const crossedThresholds = thresholds.filter(t => t.is_crossed);
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [newType, setNewType] = useState<ThresholdConsequence['consequence_type']>('changed');
  const [newDescription, setNewDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (crossedThresholds.length === 0) {
    return (
      <div className="text-center py-16 border border-dashed border-primary/20">
        <p className="text-muted-foreground">Aucun seuil franchi. Les conséquences apparaîtront ici.</p>
      </div>
    );
  }

  const handleSubmit = async (thresholdId: string) => {
    if (!newDescription.trim()) return;
    setIsSubmitting(true);
    try {
      await onAddConsequence({
        thresholdId,
        consequenceType: newType,
        description: newDescription.trim(),
      });
      setNewDescription('');
      setNewType('changed');
      setAddingTo(null);
    } finally {
      setIsSubmitting(false);
    }
  };

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

          {/* Consequences list */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-display uppercase text-muted-foreground">Implications</h4>
              {addingTo !== threshold.id && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAddingTo(threshold.id)}
                  className="text-xs text-primary hover:text-primary/80"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Ajouter
                </Button>
              )}
            </div>

            {threshold.consequences && threshold.consequences.length > 0 ? (
              threshold.consequences.map(c => (
                <div key={c.id} className="flex items-start justify-between gap-2 text-sm group p-2 hover:bg-muted/30 rounded">
                  <div className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span className="text-muted-foreground">
                      <strong>{CONSEQUENCE_TYPE_LABELS[c.consequence_type]}:</strong> {c.description}
                    </span>
                  </div>
                  {onDeleteConsequence && (
                    <button
                      onClick={() => onDeleteConsequence(c.id)}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground/60 italic">Aucune implication documentée</p>
            )}

            {/* Add consequence form */}
            {addingTo === threshold.id && (
              <div className="mt-4 p-4 border border-primary/20 bg-background space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-display text-foreground">Nouvelle implication</span>
                  <button onClick={() => setAddingTo(null)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {CONSEQUENCE_TYPES.map(type => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setNewType(type.value)}
                      className={`p-2 text-left border text-xs transition-all ${
                        newType === type.value
                          ? `${type.color} bg-current/5`
                          : 'border-border/50 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>

                <Textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Décris cette implication..."
                  className="min-h-[80px]"
                />

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleSubmit(threshold.id)}
                    disabled={isSubmitting || !newDescription.trim()}
                    size="sm"
                    className="bg-primary text-primary-foreground"
                  >
                    {isSubmitting ? 'Ajout...' : 'Ajouter'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAddingTo(null)}
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
