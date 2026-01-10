import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface CreateAbsenceFormProps {
  onSubmit: (title: string, description: string) => void;
  onCancel: () => void;
}

export function CreateAbsenceForm({ onSubmit, onCancel }: CreateAbsenceFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && description.trim()) {
      onSubmit(title.trim(), description.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-up">
      <div className="space-y-2">
        <label className="block text-xs font-display tracking-[0.2em] uppercase text-nulla/60">
          Ce qui n'existe pas
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nommez l'absence"
          className="w-full bg-transparent border-b border-nulla/30 py-3 text-lg font-display text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-nulla transition-colors"
          autoFocus
        />
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-display tracking-[0.2em] uppercase text-nulla/60">
          Pourquoi cette absence structure
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Décrivez ce vide. Pas pour le combler — pour le reconnaître."
          rows={4}
          className="w-full bg-transparent border border-nulla/20 p-4 text-sm font-body text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-nulla/40 transition-colors resize-none"
        />
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="button" variant="stone" onClick={onCancel}>
          Annuler
        </Button>
        <Button 
          type="submit" 
          variant="void"
          disabled={!title.trim() || !description.trim()}
        >
          Déclarer cette absence
        </Button>
      </div>
    </form>
  );
}
