import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Case, SignalType, SIGNAL_TYPE_LABELS } from '@/types/database';
import { Radio, Eye, Lightbulb, Zap, MapPin } from 'lucide-react';
import { toast } from 'sonner';

const SIGNAL_TYPE_ICONS: Record<SignalType, React.ReactNode> = {
  observation: <Eye className="w-4 h-4" />,
  fait: <Radio className="w-4 h-4" />,
  intuition: <Lightbulb className="w-4 h-4" />,
  tension: <Zap className="w-4 h-4" />,
  contexte: <MapPin className="w-4 h-4" />,
};

const SIGNAL_TYPE_DESCRIPTIONS: Record<SignalType, string> = {
  observation: 'Ce que tu vois, entends, perçois directement',
  fait: 'Un élément objectif, vérifiable',
  intuition: 'Un pressentiment, une sensation diffuse',
  tension: 'Une friction, un malaise, un conflit latent',
  contexte: 'Le cadre dans lequel les choses se passent',
};

interface SignalCaptureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cases: Case[];
  onAdd: (data: {
    content: string;
    signalType: SignalType;
    intensity?: number;
    occurredAt?: string;
    caseId?: string;
  }) => Promise<unknown>;
}

export function SignalCaptureModal({ open, onOpenChange, cases, onAdd }: SignalCaptureModalProps) {
  const [content, setContent] = useState('');
  const [signalType, setSignalType] = useState<SignalType>('observation');
  const [intensity, setIntensity] = useState<number>(3);
  const [occurredAt, setOccurredAt] = useState('');
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const threshCases = cases.filter(c =>
    c.metadata && typeof c.metadata === 'object' && (c.metadata as Record<string, unknown>).module === 'thresh'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error('Contenu requis');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAdd({
        content: content.trim(),
        signalType,
        intensity,
        occurredAt: occurredAt || undefined,
        caseId: selectedCaseId || undefined,
      });
      toast.success('Signal enregistré');
      resetForm();
    } catch {
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setContent('');
    setSignalType('observation');
    setIntensity(3);
    setOccurredAt('');
    setSelectedCaseId('');
  };

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  const intensityLabels = ['Très faible', 'Faible', 'Modéré', 'Fort', 'Très fort'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg border-amber-500/20 bg-background">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-amber-500 flex items-center gap-2">
            <Radio className="w-5 h-5" />
            Capturer un signal
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type de signal */}
          <div className="space-y-3">
            <Label className="text-foreground">Type de signal *</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.entries(SIGNAL_TYPE_LABELS) as [SignalType, string][]).map(([type, label]) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSignalType(type)}
                  className={`
                    p-3 border rounded-lg text-left transition-all
                    ${signalType === type
                      ? 'border-amber-500 bg-amber-500/10'
                      : 'border-amber-500/20 hover:border-amber-500/40 bg-card/30'
                    }
                  `}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={signalType === type ? 'text-amber-500' : 'text-muted-foreground'}>
                      {SIGNAL_TYPE_ICONS[type]}
                    </span>
                    <span className={`text-sm font-medium ${signalType === type ? 'text-amber-500' : 'text-foreground'}`}>
                      {label}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    {SIGNAL_TYPE_DESCRIPTIONS[type]}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Contenu */}
          <div className="space-y-2">
            <Label htmlFor="content" className="text-foreground">
              Contenu *
            </Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, 500))}
              placeholder="Décris ce que tu perçois..."
              className="bg-card/50 border-amber-500/20 focus:border-amber-500/40 min-h-[100px]"
              required
              autoFocus
            />
            <p className="text-xs text-muted-foreground flex justify-between">
              <span>Sois précis, factuel si possible</span>
              <span>{content.length}/500</span>
            </p>
          </div>

          {/* Intensité */}
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
              <span>1 = à peine perceptible</span>
              <span>5 = impossible à ignorer</span>
            </div>
          </div>

          {/* Date d'occurrence */}
          <div className="space-y-2">
            <Label htmlFor="occurred_at" className="text-foreground">
              Quand ? <span className="text-muted-foreground text-xs">(optionnel)</span>
            </Label>
            <Input
              id="occurred_at"
              type="datetime-local"
              value={occurredAt}
              onChange={(e) => setOccurredAt(e.target.value)}
              className="bg-card/50 border-amber-500/20 focus:border-amber-500/40"
            />
            <p className="text-xs text-muted-foreground">
              Si différent de maintenant
            </p>
          </div>

          {/* Associer à un dossier */}
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

          {/* Aperçu du type sélectionné */}
          <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="border-amber-500/30 text-amber-500">
                {SIGNAL_TYPE_ICONS[signalType]}
                <span className="ml-1">{SIGNAL_TYPE_LABELS[signalType]}</span>
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {signalType === 'observation' && 'Les observations sont les données brutes de ta perception.'}
              {signalType === 'fait' && 'Les faits sont vérifiables et objectifs.'}
              {signalType === 'intuition' && 'Les intuitions méritent d\'être notées, même sans preuve.'}
              {signalType === 'tension' && 'Les tensions signalent souvent un seuil qui approche.'}
              {signalType === 'contexte' && 'Le contexte aide à comprendre les autres signaux.'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-4 pt-4 border-t border-amber-500/10">
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
              disabled={isSubmitting || !content.trim()}
              className="bg-amber-500 hover:bg-amber-600 text-black font-display tracking-wider"
            >
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer le signal'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
