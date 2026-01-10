import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ThreshType, THRESH_TYPE_LABELS, Template } from '@/types/database';
import { useTemplates } from '@/hooks/useTemplates';
import { Sparkles, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface AddThresholdModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caseId: string;
  onAdd: (data: { title: string; description: string; threshType: ThreshType; caseId?: string }) => Promise<unknown>;
  isSubscribed: boolean;
}

export function AddThresholdModal({ open, onOpenChange, caseId, onAdd, isSubscribed }: AddThresholdModalProps) {
  const { templates } = useTemplates('thresh');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [threshType, setThreshType] = useState<ThreshType | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  // Filter available templates based on subscription
  const availableTemplates = templates.filter(t => isSubscribed || !t.is_premium);

  const handleTemplateSelect = (template: Template) => {
    const structure = template.structure as Record<string, unknown>;
    setTitle(structure.title as string || '');
    setDescription(structure.description as string || '');
    setThreshType((structure.thresh_type as ThreshType) || '');
    setShowTemplates(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !threshType) {
      toast.error('Titre et type sont requis');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAdd({
        title: title.trim(),
        description: description.trim(),
        threshType,
        caseId,
      });
      toast.success('Seuil ajouté');
      onOpenChange(false);
      resetForm();
    } catch (error) {
      toast.error('Erreur lors de l\'ajout');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setThreshType('');
    setShowTemplates(false);
  };

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg border-amber-500/20 bg-background">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-amber-500">
            Ajouter un seuil
          </DialogTitle>
        </DialogHeader>

        {showTemplates ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Choisis un template pour pré-remplir le formulaire.
            </p>
            <div className="grid gap-3 max-h-80 overflow-y-auto">
              {availableTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className="p-4 border border-amber-500/20 bg-card/30 hover:bg-card/50 transition-all text-left"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-display text-foreground">{template.name}</span>
                    {template.is_premium && (
                      <Sparkles className="w-3 h-3 text-amber-500" />
                    )}
                  </div>
                  {template.description && (
                    <p className="text-xs text-muted-foreground">{template.description}</p>
                  )}
                </button>
              ))}
            </div>
            <Button 
              variant="ghost" 
              onClick={() => setShowTemplates(false)}
              className="w-full text-muted-foreground"
            >
              Annuler
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Template button */}
            {availableTemplates.length > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowTemplates(true)}
                className="w-full border-amber-500/20 text-amber-500 hover:bg-amber-500/10"
              >
                <FileText className="w-4 h-4 mr-2" />
                Utiliser un template
              </Button>
            )}

            <div className="space-y-2">
              <Label htmlFor="title" className="text-foreground">
                Ce qui est ressenti *
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Charge de travail insoutenable"
                className="bg-card/50 border-amber-500/20 focus:border-amber-500/40"
                required
              />
              <p className="text-xs text-muted-foreground">
                Décris le seuil que tu sens venir ou que tu as identifié.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Type de seuil *</Label>
              <Select value={threshType} onValueChange={(v) => setThreshType(v as ThreshType)}>
                <SelectTrigger className="bg-card/50 border-amber-500/20">
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(THRESH_TYPE_LABELS) as [ThreshType, string][]).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-foreground">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décris ce qui se passe, ce que tu ressens, les signes..."
                className="bg-card/50 border-amber-500/20 focus:border-amber-500/40 min-h-[100px]"
              />
              <p className="text-xs text-muted-foreground">
                Décris factuellement. Pas d'opinion, juste ce que tu observes.
              </p>
            </div>

            <div className="flex items-center justify-end gap-4 pt-4 border-t border-amber-500/10">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => onOpenChange(false)}
                className="text-muted-foreground"
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !title.trim() || !threshType}
                className="bg-amber-500 hover:bg-amber-600 text-black font-display tracking-wider"
              >
                {isSubmitting ? 'Ajout...' : 'Ajouter'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
