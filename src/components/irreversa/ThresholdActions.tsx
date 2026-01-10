import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Edit2, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Threshold, CATEGORY_LABELS, SEVERITY_LABELS, ThresholdCategory, Severity } from '@/types/database';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ThresholdActionsProps {
  threshold: Threshold;
  onEdit: (data: { id: string; title?: string; description?: string; category?: ThresholdCategory; severity?: Severity }) => void;
  onDelete: (id: string) => void;
}

export function ThresholdActions({ threshold, onEdit, onDelete }: ThresholdActionsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editData, setEditData] = useState({
    title: threshold.title,
    description: threshold.description,
    category: threshold.category || 'autre',
    severity: threshold.severity || 'moderate',
  });

  const handleSave = () => {
    onEdit({
      id: threshold.id,
      title: editData.title,
      description: editData.description,
      category: editData.category as ThresholdCategory,
      severity: editData.severity as Severity,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      title: threshold.title,
      description: threshold.description,
      category: threshold.category || 'autre',
      severity: threshold.severity || 'moderate',
    });
    setIsEditing(false);
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div
            key="editing"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 pt-4 border-t border-border/30"
          >
            <Input
              value={editData.title}
              onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Titre"
              className="border-primary/20"
            />
            <Textarea
              value={editData.description}
              onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Description"
              className="border-primary/20 min-h-[80px]"
            />
            <div className="flex gap-3">
              <select
                value={editData.category}
                onChange={(e) => setEditData(prev => ({ ...prev, category: e.target.value as ThresholdCategory }))}
                className="flex-1 px-3 py-2 border border-primary/20 bg-background text-foreground text-sm"
              >
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              <select
                value={editData.severity}
                onChange={(e) => setEditData(prev => ({ ...prev, severity: e.target.value as Severity }))}
                className="flex-1 px-3 py-2 border border-primary/20 bg-background text-foreground text-sm"
              >
                {Object.entries(SEVERITY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={handleCancel}>
                <X className="w-4 h-4 mr-1" /> Annuler
              </Button>
              <Button size="sm" onClick={handleSave} className="bg-primary text-primary-foreground">
                <Check className="w-4 h-4 mr-1" /> Enregistrer
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="actions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-2 pt-3"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Edit2 className="w-4 h-4 mr-1" /> Modifier
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-1" /> Supprimer
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce seuil ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le seuil "{threshold.title}" et toutes ses conséquences seront définitivement supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(threshold.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
