import { useState } from 'react';
import { Absence, AbsenceEffect, EFFECT_LABELS } from '@/types/absence';
import { Button } from '@/components/ui/button';

interface AddEffectFormProps {
  absence: Absence;
  onSubmit: (type: AbsenceEffect['type'], description: string) => void;
  onCancel: () => void;
}

const EFFECT_TYPES: AbsenceEffect['type'][] = ['prevents', 'enables', 'forces', 'preserves'];

export function AddEffectForm({ absence, onSubmit, onCancel }: AddEffectFormProps) {
  const [selectedType, setSelectedType] = useState<AbsenceEffect['type'] | null>(null);
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedType && description.trim()) {
      onSubmit(selectedType, description.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="max-w-lg w-full animate-fade-up">
        <div className="border border-nulla/20 p-8 bg-card">
          <h2 className="font-display text-2xl tracking-wide text-nulla mb-2">
            Observer un effet
          </h2>
          <p className="text-muted-foreground text-sm font-body mb-6">
            Que produit l'absence de <span className="text-nulla">"{absence.title}"</span> ?
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Effect type selection */}
            <div className="space-y-3">
              <label className="block text-xs font-display tracking-[0.2em] uppercase text-nulla/60">
                Type d'effet
              </label>
              <div className="grid grid-cols-2 gap-2">
                {EFFECT_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedType(type)}
                    className={`p-3 border text-left transition-all duration-300 ${
                      selectedType === type
                        ? 'border-nulla bg-nulla/10 text-nulla'
                        : 'border-border text-muted-foreground hover:border-nulla/40'
                    }`}
                  >
                    <span className="text-xs font-display tracking-[0.15em] uppercase">
                      {EFFECT_LABELS[type]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            {selectedType && (
              <div className="space-y-2 animate-fade-up">
                <label className="block text-xs font-display tracking-[0.2em] uppercase text-nulla/60">
                  Description de l'effet
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={`Cette absence ${EFFECT_LABELS[selectedType].toLowerCase()}...`}
                  rows={3}
                  className="w-full bg-transparent border border-nulla/20 p-4 text-sm font-body text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-nulla/40 transition-colors resize-none"
                  autoFocus
                />
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Button type="button" variant="stone" onClick={onCancel}>
                Annuler
              </Button>
              <Button 
                type="submit" 
                variant="void"
                disabled={!selectedType || !description.trim()}
              >
                Enregistrer l'effet
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
