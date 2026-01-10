import { useState } from 'react';
import { useTags } from '@/hooks/useTags';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Tag, Check, Edit2, X } from 'lucide-react';
import { toast } from 'sonner';

const TAG_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#64748b',
];

export function TagsList() {
  const { user } = useAuth();
  const { tags, createTag, updateTag, deleteTag, isLoading } = useTags(user?.id);
  
  const [newTagName, setNewTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState(TAG_COLORS[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');

  const handleCreate = async () => {
    if (!newTagName.trim()) return;
    try {
      await createTag.mutateAsync({ name: newTagName.trim(), color: selectedColor });
      setNewTagName('');
      toast.success('Tag créé');
    } catch (error) {
      toast.error('Erreur lors de la création');
    }
  };

  const handleStartEdit = (tag: { id: string; name: string; color: string }) => {
    setEditingId(tag.id);
    setEditName(tag.name);
    setEditColor(tag.color);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editName.trim()) return;
    try {
      await updateTag.mutateAsync({ id: editingId, name: editName.trim(), color: editColor });
      setEditingId(null);
      toast.success('Tag modifié');
    } catch (error) {
      toast.error('Erreur lors de la modification');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce tag ? Il sera retiré de tous les dossiers.')) return;
    try {
      await deleteTag.mutateAsync(id);
      toast.success('Tag supprimé');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  if (isLoading) {
    return (
      <Card className="border-border/50">
        <CardContent className="py-8 text-center">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-card/20">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-display">
          <Tag className="w-5 h-5" />
          Mes Tags
          {tags.length > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {tags.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Create new tag */}
        <div className="p-4 rounded-lg bg-muted/30 border border-border/30 space-y-3">
          <div className="flex gap-2">
            <Input
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="Nouveau tag..."
              className="flex-1"
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
            <Button
              onClick={handleCreate}
              disabled={!newTagName.trim() || createTag.isPending}
              size="sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              Créer
            </Button>
          </div>
          <div className="flex items-center gap-1">
            {TAG_COLORS.map(color => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`w-6 h-6 rounded-full transition-transform ${
                  selectedColor === color ? 'ring-2 ring-offset-2 ring-primary scale-110' : ''
                }`}
                style={{ backgroundColor: color }}
              >
                {selectedColor === color && (
                  <Check className="w-3 h-3 text-white mx-auto" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tags list */}
        {tags.length === 0 ? (
          <div className="text-center py-8">
            <Tag className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Aucun tag créé</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Les tags permettent d'organiser tes dossiers
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {tags.map(tag => (
              <div
                key={tag.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-border/30 hover:bg-muted/20 transition-colors"
              >
                {editingId === tag.id ? (
                  <>
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 h-8"
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                    />
                    <div className="flex gap-1">
                      {TAG_COLORS.slice(0, 5).map(color => (
                        <button
                          key={color}
                          onClick={() => setEditColor(color)}
                          className={`w-5 h-5 rounded-full ${editColor === color ? 'ring-2 ring-primary' : ''}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <Button size="sm" onClick={handleSaveEdit}>
                      <Check className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                      <X className="w-3 h-3" />
                    </Button>
                  </>
                ) : (
                  <>
                    <div
                      className="w-4 h-4 rounded-full shrink-0"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="flex-1 text-sm">{tag.name}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => handleStartEdit(tag)}
                    >
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(tag.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
