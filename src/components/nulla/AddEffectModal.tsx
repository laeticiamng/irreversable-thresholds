import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { AbsenceEffect } from '@/types/database';

const EFFECT_TYPES: { value: AbsenceEffect['effect_type']; label: string; description: string; color: string }[] = [
  { value: 'prevents', label: 'Empêche', description: 'Rend quelque chose impossible', color: 'text-destructive border-destructive/30' },
  { value: 'enables', label: 'Rend possible', description: 'Permet quelque chose de négatif', color: 'text-emerald-500 border-emerald-500/30' },
  { value: 'forces', label: 'Force à contourner', description: 'Oblige à trouver une alternative', color: 'text-amber-500 border-amber-500/30' },
  { value: 'preserves', label: 'Préserve', description: 'Maintient un statu quo', color: 'text-blue-500 border-blue-500/30' },
];

interface AddEffectModalProps {
  absenceId: string;
  absenceTitle: string;
  onClose: () => void;
  onSubmit: (data: { 
    absenceId: string;
    effectType: AbsenceEffect['effect_type']; 
    description: string;
  }) => Promise<unknown>;
}

export function AddEffectModal({ absenceId, absenceTitle, onClose, onSubmit }: AddEffectModalProps) {
  const [loading, setLoading] = useState(false);
  const [effectType, setEffectType] = useState<AbsenceEffect['effect_type']>('prevents');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setLoading(true);
    try {
      await onSubmit({
        absenceId,
        effectType,
        description: description.trim(),
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const selectedType = EFFECT_TYPES.find(t => t.value === effectType);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="bg-background border border-nulla/20 w-full max-w-lg m-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <div>
            <h2 className="font-display text-xl text-nulla">Ajouter un effet</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Pour : {absenceTitle}
            </p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Effect Type */}
          <div className="space-y-3">
            <Label className="font-display">Type d'effet</Label>
            <div className="grid grid-cols-2 gap-2">
              {EFFECT_TYPES.map(type => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setEffectType(type.value)}
                  className={`p-3 text-left border transition-all ${
                    effectType === type.value
                      ? `${type.color} bg-current/5`
                      : 'border-border/50 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span className={`block font-display text-sm ${effectType === type.value ? type.color.split(' ')[0] : ''}`}>
                    {type.label}
                  </span>
                  <span className="block text-xs text-muted-foreground mt-0.5">
                    {type.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="font-display">
              Description de l'effet <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={`${selectedType?.label} : décris l'effet concret...`}
              rows={3}
              required
            />
            <p className="text-xs text-muted-foreground">
              Décris un effet factuel et observable.
            </p>
          </div>

          {/* Preview */}
          {description && (
            <div className="p-3 bg-card/50 border-l-2 border-nulla/30">
              <span className={`text-xs font-display uppercase mr-2 ${selectedType?.color.split(' ')[0]}`}>
                {selectedType?.label}:
              </span>
              <span className="text-sm text-muted-foreground">{description}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
            <Button type="button" variant="ghost" onClick={onClose}>
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !description.trim()}
              className="bg-nulla hover:bg-nulla/90 text-primary-foreground"
            >
              {loading ? 'Ajout...' : 'Ajouter l\'effet'}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}