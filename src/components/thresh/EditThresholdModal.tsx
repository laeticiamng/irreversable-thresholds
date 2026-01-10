import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { X, Plus } from 'lucide-react';
import { THRESH_TYPE_LABELS, ThreshType, InvisibleThreshold } from '@/types/database';

interface EditThresholdModalProps {
  threshold: InvisibleThreshold & { tags?: string[]; intensity?: number; context?: string };
  onClose: () => void;
  onSubmit: (data: {
    id: string;
    title?: string;
    description?: string;
    threshType?: ThreshType;
    tags?: string[];
    intensity?: number;
    context?: string;
  }) => Promise<void>;
}

export function EditThresholdModal({ threshold, onClose, onSubmit }: EditThresholdModalProps) {
  const [title, setTitle] = useState(threshold.title);
  const [description, setDescription] = useState(threshold.description);
  const [threshType, setThreshType] = useState<ThreshType>(threshold.thresh_type);
  const [tags, setTags] = useState<string[]>(threshold.tags || []);
  const [newTag, setNewTag] = useState('');
  const [intensity, setIntensity] = useState(threshold.intensity || 3);
  const [context, setContext] = useState(threshold.context || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        id: threshold.id,
        title: title.trim(),
        description: description.trim(),
        threshType,
        tags,
        intensity,
        context: context.trim() || undefined,
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
        className="bg-background border border-amber-500/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl text-amber-500">Modifier le seuil</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label className="font-display">
              Phrase de bascule <span className="text-destructive">*</span>
            </Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="C'est le moment où..."
              required
            />
          </div>

          {/* Thresh Type */}
          <div className="space-y-2">
            <Label className="font-display">Type de seuil</Label>
            <select
              value={threshType}
              onChange={(e) => setThreshType(e.target.value as ThreshType)}
              className="w-full px-3 py-2 border border-amber-500/20 bg-background text-foreground"
            >
              {Object.entries(THRESH_TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          {/* Intensity */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="font-display">Intensité ressentie</Label>
              <span className="text-sm text-amber-500 font-medium">{intensity}/5</span>
            </div>
            <Slider
              value={[intensity]}
              onValueChange={(v) => setIntensity(v[0])}
              min={1}
              max={5}
              step={1}
              className="w-full"
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className="font-display">Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map(tag => (
                <Badge 
                  key={tag} 
                  variant="outline" 
                  className="border-amber-500/30 text-amber-500 cursor-pointer hover:bg-amber-500/10"
                  onClick={() => handleRemoveTag(tag)}
                >
                  {tag}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Ajouter un tag..."
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              />
              <Button type="button" variant="outline" onClick={handleAddTag}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="font-display">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décris ce que tu ressens..."
              className="min-h-[80px]"
            />
          </div>

          {/* Context */}
          <div className="space-y-2">
            <Label className="font-display">Contexte</Label>
            <Textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Contexte additionnel..."
              className="min-h-[60px]"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting} 
              className="bg-amber-500 hover:bg-amber-600 text-black"
            >
              {isSubmitting ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
            <Button type="button" variant="ghost" onClick={onClose}>Annuler</Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}