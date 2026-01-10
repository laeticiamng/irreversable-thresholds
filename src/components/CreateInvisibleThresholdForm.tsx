import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ThreshType, THRESH_TYPE_LABELS } from '@/types/database';

interface CreateInvisibleThresholdFormProps {
  onSubmit: (title: string, description: string, threshType: ThreshType) => void;
  onCancel: () => void;
}

const THRESH_TYPES: ThreshType[] = [
  'trop', 
  'pas_assez', 
  'rupture', 
  'evidence', 
  'saturation', 
  'acceptabilite', 
  'tolerance'
];

export function CreateInvisibleThresholdForm({ onSubmit, onCancel }: CreateInvisibleThresholdFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [threshType, setThreshType] = useState<ThreshType | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && description.trim() && threshType) {
      onSubmit(title.trim(), description.trim(), threshType);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-up">
      {/* Threshold type selection */}
      <div className="space-y-3">
        <label className="block text-xs font-display tracking-[0.2em] uppercase text-amber-500/60">
          Type de seuil
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {THRESH_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setThreshType(type)}
              className={`p-3 border text-left transition-all duration-300 ${
                threshType === type
                  ? 'border-amber-500 bg-amber-500/10 text-amber-500'
                  : 'border-border text-muted-foreground hover:border-amber-500/40'
              }`}
            >
              <span className="text-xs font-display tracking-wider uppercase">
                {THRESH_TYPE_LABELS[type].replace('Seuil de ', '').replace("Seuil d'", '')}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-display tracking-[0.2em] uppercase text-amber-500/60">
          Ce qui bascule
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nommez le seuil"
          className="w-full bg-transparent border-b border-amber-500/30 py-3 text-lg font-display text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-amber-500 transition-colors"
          autoFocus
        />
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-display tracking-[0.2em] uppercase text-amber-500/60">
          À quoi le reconnaît-on
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ce seuil n'a pas de valeur, pas d'unité. Comment savez-vous qu'il est là ?"
          rows={4}
          className="w-full bg-transparent border border-amber-500/20 p-4 text-sm font-body text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-amber-500/40 transition-colors resize-none"
        />
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="button" variant="stone" onClick={onCancel}>
          Annuler
        </Button>
        <Button 
          type="submit" 
          variant="monument"
          disabled={!title.trim() || !description.trim() || !threshType}
          className="border-amber-500/30 text-amber-500 hover:border-amber-500 hover:text-amber-500"
        >
          Inscrire ce seuil
        </Button>
      </div>
    </form>
  );
}
