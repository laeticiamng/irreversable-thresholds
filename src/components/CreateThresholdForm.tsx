import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface CreateThresholdFormProps {
  onSubmit: (title: string, description: string) => void;
  onCancel: () => void;
}

export function CreateThresholdForm({ onSubmit, onCancel }: CreateThresholdFormProps) {
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
        <label className="block text-xs font-display tracking-[0.2em] uppercase text-muted-foreground">
          Nom du seuil
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ce qui ne pourra être défait"
          className="w-full bg-transparent border-b border-border py-3 text-lg font-display text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
          autoFocus
        />
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-display tracking-[0.2em] uppercase text-muted-foreground">
          Ce que cela signifie
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Décrivez l'irréversibilité de ce seuil. Pourquoi ne pourrez-vous pas revenir en arrière ?"
          rows={4}
          className="w-full bg-transparent border border-border p-4 text-sm font-body text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors resize-none"
        />
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="button" variant="stone" onClick={onCancel}>
          Annuler
        </Button>
        <Button 
          type="submit" 
          variant="monument"
          disabled={!title.trim() || !description.trim()}
        >
          Inscrire ce seuil
        </Button>
      </div>
    </form>
  );
}
