import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useIrreversaCases } from '@/hooks/useIrreversaCases';
import { CATEGORY_LABELS, SEVERITY_LABELS, ThresholdCategory, Severity } from '@/types/database';

interface AddThresholdModalProps {
  caseId?: string;
  onClose: () => void;
}

export function AddThresholdModal({ caseId, onClose }: AddThresholdModalProps) {
  const { user } = useAuth();
  const { createThreshold } = useIrreversaCases(user?.id);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ThresholdCategory>('autre');
  const [whatCannotBeUndone, setWhatCannotBeUndone] = useState('');
  const [whatChangesAfter, setWhatChangesAfter] = useState('');
  const [severity, setSeverity] = useState<Severity>('moderate');
  const [conditions, setConditions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !whatCannotBeUndone.trim() || !whatChangesAfter.trim()) return;

    setIsSubmitting(true);
    try {
      await createThreshold.mutateAsync({
        title: title.trim(),
        description: `${whatCannotBeUndone.substring(0, 100)}...`,
        caseId,
        category,
        severity,
        whatCannotBeUndone: whatCannotBeUndone.trim(),
        whatChangesAfter: whatChangesAfter.trim(),
        conditions: conditions.trim() || undefined,
      });
      onClose();
    } catch (error) {
      console.error('Failed to create threshold:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-primary/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
        <h2 className="font-display text-2xl text-primary mb-2">Ajouter un seuil</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Écris des faits, pas des conseils. L'objectif est la clarté.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-display text-foreground mb-2">
              Seuil — intitulé <span className="text-destructive">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: signature, rupture, publication..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-display text-foreground mb-2">Catégorie</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ThresholdCategory)}
              className="w-full px-3 py-2 border border-border bg-background"
            >
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-display text-foreground mb-2">
              Ce qui ne pourra plus être défait <span className="text-destructive">*</span>
            </label>
            <Textarea
              value={whatCannotBeUndone}
              onChange={(e) => setWhatCannotBeUndone(e.target.value)}
              placeholder="Décris ce qui devient irréversible..."
              className="min-h-[100px]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-display text-foreground mb-2">
              Ce qui change durablement après <span className="text-destructive">*</span>
            </label>
            <Textarea
              value={whatChangesAfter}
              onChange={(e) => setWhatChangesAfter(e.target.value)}
              placeholder="Décris les changements durables..."
              className="min-h-[100px]"
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-display text-foreground mb-2">Gravité</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as Severity)}
                className="w-full px-3 py-2 border border-border bg-background"
              >
                {Object.entries(SEVERITY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-display text-foreground mb-2">Conditions</label>
              <Input
                value={conditions}
                onChange={(e) => setConditions(e.target.value)}
                placeholder="Optionnel..."
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isSubmitting} className="bg-primary text-primary-foreground">
              {isSubmitting ? 'Création...' : 'Ajouter le seuil'}
            </Button>
            <Button type="button" variant="ghost" onClick={onClose}>Annuler</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
