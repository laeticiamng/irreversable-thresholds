import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CATEGORY_LABELS, SEVERITY_LABELS, ThresholdCategory, Severity, Threshold } from '@/types/database';
import { X } from 'lucide-react';

interface EditThresholdModalProps {
  threshold: Threshold;
  onClose: () => void;
  onSubmit: (data: {
    id: string;
    title?: string;
    description?: string;
    category?: ThresholdCategory;
    severity?: Severity;
    whatCannotBeUndone?: string;
    whatChangesAfter?: string;
    conditions?: string;
    notes?: string;
  }) => Promise<void>;
}

export function EditThresholdModal({ threshold, onClose, onSubmit }: EditThresholdModalProps) {
  const [title, setTitle] = useState(threshold.title);
  const [category, setCategory] = useState<ThresholdCategory>(threshold.category || 'autre');
  const [whatCannotBeUndone, setWhatCannotBeUndone] = useState(threshold.what_cannot_be_undone || '');
  const [whatChangesAfter, setWhatChangesAfter] = useState(threshold.what_changes_after || '');
  const [severity, setSeverity] = useState<Severity>(threshold.severity || 'moderate');
  const [conditions, setConditions] = useState(threshold.conditions || '');
  const [notes, setNotes] = useState(threshold.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        id: threshold.id,
        title: title.trim(),
        description: whatCannotBeUndone.substring(0, 100) + '...',
        category,
        severity,
        whatCannotBeUndone: whatCannotBeUndone.trim(),
        whatChangesAfter: whatChangesAfter.trim(),
        conditions: conditions.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (error) {
      console.error('Failed to update threshold:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="bg-background border border-primary/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl text-primary">Modifier le seuil</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

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
              Ce qui ne pourra plus être défait
            </label>
            <Textarea
              value={whatCannotBeUndone}
              onChange={(e) => setWhatCannotBeUndone(e.target.value)}
              placeholder="Décris ce qui devient irréversible..."
              className="min-h-[100px]"
            />
          </div>

          <div>
            <label className="block text-sm font-display text-foreground mb-2">
              Ce qui change durablement après
            </label>
            <Textarea
              value={whatChangesAfter}
              onChange={(e) => setWhatChangesAfter(e.target.value)}
              placeholder="Décris les changements durables..."
              className="min-h-[100px]"
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

          <div>
            <label className="block text-sm font-display text-foreground mb-2">Notes</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes additionnelles..."
              className="min-h-[80px]"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isSubmitting} className="bg-primary text-primary-foreground">
              {isSubmitting ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
            <Button type="button" variant="ghost" onClick={onClose}>Annuler</Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}