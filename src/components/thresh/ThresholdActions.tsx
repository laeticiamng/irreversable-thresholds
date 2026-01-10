import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Edit2, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { InvisibleThreshold, THRESH_TYPE_LABELS, ThreshType } from '@/types/database';
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
  threshold: InvisibleThreshold & { tags?: string[]; intensity?: number; context?: string };
  onEdit: (data: { id: string; title?: string; description?: string; threshType?: ThreshType }) => void;
  onDelete: (id: string) => void;
}

export function ThresholdActions({ threshold, onEdit, onDelete }: ThresholdActionsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editData, setEditData] = useState({
    title: threshold.title,
    description: threshold.description,
    threshType: threshold.thresh_type,
  });

  const handleSave = () => {
    onEdit({
      id: threshold.id,
      title: editData.title,
      description: editData.description,
      threshType: editData.threshType,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      title: threshold.title,
      description: threshold.description,
      threshType: threshold.thresh_type,
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
            <select
              value={editData.threshType}
              onChange={(e) => setEditData(prev => ({ ...prev, threshType: e.target.value as ThreshType }))}
              className="w-full px-3 py-2 border border-primary/20 bg-background text-foreground text-sm"
            >
              {Object.entries(THRESH_TYPE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
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
              Cette action est irréversible. Le seuil "{threshold.title}" sera définitivement supprimé.
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
