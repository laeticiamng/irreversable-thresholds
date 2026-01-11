import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Case } from '@/types/database';
import { Zap, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

// Standard tags as per spec
const STANDARD_TAGS = [
  'Tension', 'Saturation', 'Flou', 'Clarté', 'Élan', 
  'Peur', 'Doute', 'Opportunité', 'Fatigue', 'Calme', 
  'Rupture', 'Stabilisation'
] as const;

interface QuickCaptureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cases: Case[];
  onAdd: (data: { 
    title: string; 
    description: string; 
    tags: string[]; 
    intensity: number; 
    context?: string;
    caseId?: string;
  }) => Promise<unknown>;
  isSubscribed: boolean;
}

export function QuickCaptureModal({ open, onOpenChange, cases, onAdd, isSubscribed }: QuickCaptureModalProps) {
  const [phrase, setPhrase] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [intensity, setIntensity] = useState<number>(3);
  const [context, setContext] = useState('');
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [customTag, setCustomTag] = useState('');
  const [showCustomTagInput, setShowCustomTagInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const threshCases = cases.filter(c => 
    c.metadata && typeof c.metadata === 'object' && (c.metadata as Record<string, unknown>).module === 'thresh'
  );

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else if (selectedTags.length < 3) {
      setSelectedTags([...selectedTags, tag]);
    } else {
      toast.error('Maximum 3 tags');
    }
  };

  const addCustomTag = () => {
    if (customTag.trim() && selectedTags.length < 3) {
      setSelectedTags([...selectedTags, customTag.trim()]);
      setCustomTag('');
      setShowCustomTagInput(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phrase.trim()) {
      toast.error('Phrase requise');
      return;
    }
    if (selectedTags.length === 0) {
      toast.error('Sélectionne au moins 1 tag');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAdd({
        title: phrase.trim(),
        description: '',
        tags: selectedTags,
        intensity,
        context: context.trim() || undefined,
        caseId: selectedCaseId || undefined,
      });
      toast.success('Enregistré');
      resetForm();
      // Keep modal open for quick successive entries
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setPhrase('');
    setSelectedTags([]);
    setIntensity(3);
    setContext('');
    setSelectedCaseId('');
    setCustomTag('');
    setShowCustomTagInput(false);
  };

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  const intensityLabels = ['Léger', 'Faible', 'Modéré', 'Fort', 'Très fort'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg border-amber-500/20 bg-background">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-amber-500 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Capture rapide
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Phrase - obligatoire */}
          <div className="space-y-2">
            <Label htmlFor="phrase" className="text-foreground">
              Phrase *
            </Label>
            <Input
              id="phrase"
              value={phrase}
              onChange={(e) => setPhrase(e.target.value.slice(0, 120))}
              placeholder="Je sens que..."
              className="bg-card/50 border-amber-500/20 focus:border-amber-500/40 text-lg"
              required
              autoFocus
            />
            <p className="text-xs text-muted-foreground flex justify-between">
              <span>Max 120 caractères</span>
              <span>{phrase.length}/120</span>
            </p>
          </div>

          {/* Tags - obligatoire (1-3) */}
          <div className="space-y-2">
            <Label className="text-foreground">
              Tags * <span className="text-muted-foreground text-xs">(1-3 tags)</span>
            </Label>
            <div className="flex flex-wrap gap-2">
              {STANDARD_TAGS.map(tag => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className={`cursor-pointer transition-all ${
                    selectedTags.includes(tag) 
                      ? 'bg-amber-500 text-black hover:bg-amber-600' 
                      : 'border-amber-500/30 text-muted-foreground hover:border-amber-500 hover:text-amber-500'
                  }`}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
              {isSubscribed && (
                showCustomTagInput ? (
                  <div className="flex items-center gap-1">
                    <Input
                      value={customTag}
                      onChange={(e) => setCustomTag(e.target.value)}
                      placeholder="Tag..."
                      className="h-6 w-24 text-xs bg-card/50 border-amber-500/20"
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTag())}
                    />
                    <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={addCustomTag}>
                      <Plus className="w-3 h-3" />
                    </Button>
                    <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setShowCustomTagInput(false)}>
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <Badge
                    variant="outline"
                    className="cursor-pointer border-dashed border-amber-500/30 text-amber-500/60 hover:border-amber-500 hover:text-amber-500"
                    onClick={() => setShowCustomTagInput(true)}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Tag custom
                  </Badge>
                )
              )}
            </div>
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                <span className="text-xs text-muted-foreground">Sélectionnés:</span>
                {selectedTags.map(tag => (
                  <Badge key={tag} className="bg-amber-500/20 text-amber-500 text-xs">
                    {tag}
                    <button type="button" onClick={() => toggleTag(tag)} className="ml-1">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Intensité - obligatoire */}
          <div className="space-y-3">
            <Label className="text-foreground">
              Intensité: <span className="text-amber-500">{intensityLabels[intensity - 1]}</span>
            </Label>
            <Slider
              value={[intensity]}
              onValueChange={(v) => setIntensity(v[0])}
              min={1}
              max={5}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 = léger</span>
              <span>5 = très fort</span>
            </div>
          </div>

          {/* Contexte - optionnel */}
          <div className="space-y-2">
            <Label htmlFor="context" className="text-foreground">
              Contexte <span className="text-muted-foreground text-xs">(optionnel)</span>
            </Label>
            <Textarea
              id="context"
              value={context}
              onChange={(e) => setContext(e.target.value.slice(0, 280))}
              placeholder="Qu'est-ce qui se passait à ce moment..."
              className="bg-card/50 border-amber-500/20 focus:border-amber-500/40 min-h-[60px]"
              maxLength={280}
            />
            <p className="text-xs text-muted-foreground text-right">{context.length}/280</p>
          </div>

          {/* Associer à un dossier - optionnel */}
          <div className="space-y-2">
            <Label className="text-foreground">
              Associer à un dossier <span className="text-muted-foreground text-xs">(optionnel)</span>
            </Label>
            <Select value={selectedCaseId || "none"} onValueChange={(val) => setSelectedCaseId(val === "none" ? "" : val)}>
              <SelectTrigger className="bg-card/50 border-amber-500/20">
                <SelectValue placeholder="Aucun dossier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Aucun dossier</SelectItem>
                {threshCases.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Micro-copy */}
          <div className="p-3 bg-amber-500/5 border border-amber-500/10 text-xs text-muted-foreground">
            <p>Aucune preuve nécessaire.</p>
            <p>Ici, on note. On n'interprète pas à ta place.</p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-4 pt-4 border-t border-amber-500/10">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => onOpenChange(false)}
              className="text-muted-foreground"
            >
              Fermer
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !phrase.trim() || selectedTags.length === 0}
              className="bg-amber-500 hover:bg-amber-600 text-black font-display tracking-wider"
            >
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
