import { useState } from 'react';
import { Template, CaseDomain, TimeHorizon } from '@/types/database';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';

interface TemplatePreviewModalProps {
  template: Template | null;
  isOpen: boolean;
  onClose: () => void;
  onUse: (data: TemplateApplyData) => void;
}

export interface TemplateApplyData {
  title: string;
  description: string;
  domain: CaseDomain;
  timeHorizon?: TimeHorizon;
}

export function TemplatePreviewModal({ template, isOpen, onClose, onUse }: TemplatePreviewModalProps) {
  if (!template) return null;

  const structure = template.structure as Record<string, string>;
  
  const [title, setTitle] = useState(structure.example_title || '');
  const [description, setDescription] = useState(structure.example_description || '');
  const domain = (structure.category as CaseDomain) || 'autre';

  const handleUse = () => {
    onUse({
      title,
      description,
      domain,
      timeHorizon: structure.time_horizon as TimeHorizon | undefined,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {template.name}
            {template.is_premium && (
              <Badge variant="secondary" className="text-xs">
                Premium
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {template.description}
          </p>

          <div className="space-y-3 pt-2">
            <div>
              <Label className="text-xs text-muted-foreground">Titre suggéré</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titre du dossier"
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Contexte suggéré</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description du contexte"
                className="mt-1 min-h-[100px]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-border/50">
            <Button variant="ghost" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              Annuler
            </Button>
            <Button onClick={handleUse} disabled={!title.trim()}>
              <Check className="w-4 h-4 mr-2" />
              Utiliser ce modèle
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
