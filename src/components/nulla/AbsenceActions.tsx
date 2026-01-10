import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Absence } from '@/types/database';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';

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

interface AbsenceActionsProps {
  absence: Absence & { category?: string; impact_level?: string; counterfactual?: string; evidence_needed?: string };
  onEdit: (data: {
    id: string;
    title?: string;
    description?: string;
    category?: string;
    impactLevel?: string;
    counterfactual?: string;
    evidenceNeeded?: string;
  }) => void;
  onDelete: (id: string) => void;
}

export function AbsenceActions({ absence, onEdit, onDelete }: AbsenceActionsProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editTitle, setEditTitle] = useState(absence.title);
  const [editDescription, setEditDescription] = useState(absence.description);
  const [editCategory, setEditCategory] = useState((absence as any).category || 'autre');
  const [editImpactLevel, setEditImpactLevel] = useState((absence as any).impact_level || 'moderate');
  const [editCounterfactual, setEditCounterfactual] = useState((absence as any).counterfactual || '');
  const [editEvidenceNeeded, setEditEvidenceNeeded] = useState((absence as any).evidence_needed || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleEdit = async () => {
    setIsLoading(true);
    try {
      await onEdit({
        id: absence.id,
        title: editTitle,
        description: editDescription,
        category: editCategory,
        impactLevel: editImpactLevel,
        counterfactual: editCounterfactual || undefined,
        evidenceNeeded: editEvidenceNeeded || undefined,
      });
      setShowEditDialog(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Modifier
          </DropdownMenuItem>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer cette absence ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action est irréversible. L'absence "{absence.title}" et tous ses effets seront définitivement supprimés.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => onDelete(absence.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Supprimer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-nulla">Modifier l'absence</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Ce qui manque</Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Effet concret</Label>
              <Textarea
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category">Catégorie</Label>
              <select
                id="edit-category"
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                className="w-full px-3 py-2 border border-border bg-background text-foreground"
              >
                {CATEGORY_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Niveau d'impact</Label>
              <div className="flex gap-2">
                {IMPACT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setEditImpactLevel(opt.value)}
                    className={`flex-1 py-2 text-sm border transition-colors ${
                      editImpactLevel === opt.value
                        ? 'border-nulla bg-nulla/10 text-nulla'
                        : 'border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-counterfactual">Si cela existait... (optionnel)</Label>
              <Textarea
                id="edit-counterfactual"
                value={editCounterfactual}
                onChange={(e) => setEditCounterfactual(e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-evidence">Preuve / accès requis (optionnel)</Label>
              <Input
                id="edit-evidence"
                value={editEvidenceNeeded}
                onChange={(e) => setEditEvidenceNeeded(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowEditDialog(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleEdit} 
              disabled={isLoading || !editTitle.trim()}
              className="bg-nulla hover:bg-nulla/90 text-primary-foreground"
            >
              {isLoading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}