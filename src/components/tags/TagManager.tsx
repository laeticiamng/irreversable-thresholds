import { useState } from 'react';
import { useTags, useCaseTags } from '@/hooks/useTags';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, X, Tag, Check } from 'lucide-react';
import { toast } from 'sonner';

interface TagManagerProps {
  caseId: string;
}

const TAG_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#64748b',
];

export function TagManager({ caseId }: TagManagerProps) {
  const { user } = useAuth();
  const { tags: allTags, createTag } = useTags(user?.id);
  const { tags: caseTags, addTagToCase, removeTagFromCase } = useCaseTags(caseId);
  const [isOpen, setIsOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState(TAG_COLORS[0]);

  const availableTags = allTags.filter(
    tag => !caseTags.some(ct => ct.id === tag.id)
  );

  const handleCreateAndAdd = async () => {
    if (!newTagName.trim()) return;
    
    try {
      const newTag = await createTag.mutateAsync({ 
        name: newTagName.trim(), 
        color: selectedColor 
      });
      await addTagToCase.mutateAsync(newTag.id);
      setNewTagName('');
      toast.success('Tag créé et ajouté');
    } catch (error) {
      toast.error('Erreur lors de la création du tag');
    }
  };

  const handleAddExisting = async (tagId: string) => {
    try {
      await addTagToCase.mutateAsync(tagId);
    } catch (error) {
      toast.error('Erreur lors de l\'ajout du tag');
    }
  };

  const handleRemove = async (tagId: string) => {
    try {
      await removeTagFromCase.mutateAsync(tagId);
    } catch (error) {
      toast.error('Erreur lors de la suppression du tag');
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {caseTags.map(tag => (
        <Badge
          key={tag.id}
          variant="secondary"
          className="group flex items-center gap-1 pr-1"
          style={{ backgroundColor: `${tag.color}20`, borderColor: tag.color, color: tag.color }}
        >
          {tag.name}
          <button
            onClick={() => handleRemove(tag.id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-background/50 rounded"
          >
            <X className="w-3 h-3" />
          </button>
        </Badge>
      ))}

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
            <Plus className="w-3 h-3 mr-1" />
            Tag
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3" align="start">
          <div className="space-y-3">
            {/* Available tags */}
            {availableTags.length > 0 && (
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Tags existants</span>
                <div className="flex flex-wrap gap-1">
                  {availableTags.map(tag => (
                    <button
                      key={tag.id}
                      onClick={() => handleAddExisting(tag.id)}
                      className="flex items-center gap-1 px-2 py-0.5 rounded text-xs transition-colors hover:bg-muted"
                      style={{ color: tag.color }}
                    >
                      <Tag className="w-3 h-3" />
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Create new tag */}
            <div className="space-y-2 pt-2 border-t border-border/50">
              <span className="text-xs text-muted-foreground">Nouveau tag</span>
              <Input
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Nom du tag..."
                className="h-8 text-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleCreateAndAdd()}
              />
              <div className="flex items-center gap-1">
                {TAG_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-5 h-5 rounded-full transition-transform ${
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
              <Button
                size="sm"
                className="w-full"
                onClick={handleCreateAndAdd}
                disabled={!newTagName.trim() || createTag.isPending}
              >
                Créer et ajouter
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
