import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { useTemplates } from '@/hooks/useTemplates';

const CATEGORY_OPTIONS = [
  { value: 'ressource', label: 'Ressource' },
  { value: 'preuve', label: 'Preuve / Document' },
  { value: 'acces', label: 'Accès' },
  { value: 'competence', label: 'Compétence' },
  { value: 'protection', label: 'Protection' },
  { value: 'information', label: 'Information' },
  { value: 'relation', label: 'Relation / Soutien' },
  { value: 'stabilite', label: 'Stabilité' },
  { value: 'autre', label: 'Autre' },
];

const IMPACT_OPTIONS = [
  { value: 'low', label: 'Faible' },
  { value: 'moderate', label: 'Modéré' },
  { value: 'high', label: 'Élevé' },
];

interface AddAbsenceModalProps {
  caseId?: string;
  onClose: () => void;
  onSubmit: (data: { title: string; description: string }) => Promise<void>;
}

export function AddAbsenceModal({ caseId, onClose, onSubmit }: AddAbsenceModalProps) {
  const { templates } = useTemplates('nulla');
  const [loading, setLoading] = useState(false);
  
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('autre');
  const [effect, setEffect] = useState('');
  const [impactLevel, setImpactLevel] = useState('moderate');
  const [counterfactual, setCounterfactual] = useState('');
  const [evidenceNeeded, setEvidenceNeeded] = useState('');

  const [showTemplates, setShowTemplates] = useState(true);

  const handleTemplateSelect = (template: any) => {
    const structure = template.structure as any;
    if (structure.category) setCategory(structure.category);
    if (structure.example_title) setTitle(structure.example_title);
    if (structure.example_effect) setEffect(structure.example_effect);
    setShowTemplates(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !effect.trim()) return;

    setLoading(true);
    try {
      // Note: We're passing description as the effect since the current DB structure uses description
      await onSubmit({
        title: title.trim(),
        description: effect.trim(),
      });
    } finally {
      setLoading(false);
    }
  };

  const freeTemplates = templates.filter(t => !t.is_premium);
  const premiumTemplates = templates.filter(t => t.is_premium);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-background border border-nulla/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <h2 className="font-display text-xl text-nulla">Déclarer une absence</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Templates section */}
        {showTemplates && templates.length > 0 && (
          <div className="p-6 border-b border-border/50 bg-card/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-display text-muted-foreground">Utiliser un template</h3>
              <button 
                onClick={() => setShowTemplates(false)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Passer
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {freeTemplates.map(t => (
                <button
                  key={t.id}
                  onClick={() => handleTemplateSelect(t)}
                  className="p-3 text-left border border-nulla/20 hover:bg-nulla/10 transition-colors"
                >
                  <span className="text-sm text-foreground">{t.name}</span>
                  <span className="block text-xs text-muted-foreground mt-1">{t.description}</span>
                </button>
              ))}
              {premiumTemplates.slice(0, 2).map(t => (
                <button
                  key={t.id}
                  onClick={() => handleTemplateSelect(t)}
                  className="p-3 text-left border border-nulla/10 opacity-60 relative"
                  disabled
                >
                  <span className="absolute top-2 right-2 text-xs px-1.5 py-0.5 bg-nulla/20 text-nulla">PRO</span>
                  <span className="text-sm text-foreground">{t.name}</span>
                  <span className="block text-xs text-muted-foreground mt-1">{t.description}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="font-display">
              Ce qui manque <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Pas de couverture santé"
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="font-display">
              Catégorie <span className="text-red-500">*</span>
            </Label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-border bg-background text-foreground"
            >
              {CATEGORY_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Effect */}
          <div className="space-y-2">
            <Label htmlFor="effect" className="font-display">
              Effet concret <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="effect"
              value={effect}
              onChange={(e) => setEffect(e.target.value)}
              placeholder="Commence par 'Cela rend impossible / très difficile…'"
              rows={3}
              required
            />
            <p className="text-xs text-muted-foreground">
              Décris un effet concret, pas une opinion.
            </p>
          </div>

          {/* Impact level */}
          <div className="space-y-2">
            <Label className="font-display">
              Niveau d'impact <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2">
              {IMPACT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setImpactLevel(opt.value)}
                  className={`flex-1 py-2 text-sm border transition-colors ${
                    impactLevel === opt.value
                      ? 'border-nulla bg-nulla/10 text-nulla'
                      : 'border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Counterfactual (optional) */}
          <div className="space-y-2">
            <Label htmlFor="counterfactual" className="font-display">
              Si cela existait... <span className="text-muted-foreground">(optionnel)</span>
            </Label>
            <Textarea
              id="counterfactual"
              value={counterfactual}
              onChange={(e) => setCounterfactual(e.target.value)}
              placeholder="Qu'est-ce qui changerait ?"
              rows={2}
            />
          </div>

          {/* Evidence needed (optional) */}
          <div className="space-y-2">
            <Label htmlFor="evidence" className="font-display">
              Preuve / accès requis <span className="text-muted-foreground">(optionnel)</span>
            </Label>
            <Input
              id="evidence"
              value={evidenceNeeded}
              onChange={(e) => setEvidenceNeeded(e.target.value)}
              placeholder="Document, accès, ou preuve nécessaire"
            />
          </div>

          {/* Micro-copy */}
          <div className="p-4 bg-card/50 border border-border/30">
            <p className="text-xs text-muted-foreground">
              💡 <strong>Rappel :</strong> Décris une absence factuelle. 
              Aucun conseil — uniquement la clarté.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
            <Button type="button" variant="ghost" onClick={onClose}>
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !title.trim() || !effect.trim()}
              className="bg-nulla hover:bg-nulla/90 text-primary-foreground"
            >
              {loading ? 'Création...' : 'Créer l\'absence'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
