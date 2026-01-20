import { useState } from 'react';
import { Template, ModuleType, MODULE_LABELS } from '@/types/database';
import { useTemplates } from '@/hooks/useTemplates';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, MoreHorizontal, Edit2, Copy, Trash2, FileText, Star, Layers } from 'lucide-react';
import { toast } from 'sonner';

interface TemplateManagerProps {
  isAdmin?: boolean;
}

export function TemplateManager({ isAdmin = false }: TemplateManagerProps) {
  const {
    templates,
    isLoading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    getByModule,
  } = useTemplates();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [activeModule, setActiveModule] = useState<ModuleType | 'all'>('all');

  // Form state
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formModule, setFormModule] = useState<ModuleType>('irreversa');
  const [formIsPremium, setFormIsPremium] = useState(false);
  const [formStructure, setFormStructure] = useState('{}');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setFormName('');
    setFormDescription('');
    setFormModule('irreversa');
    setFormIsPremium(false);
    setFormStructure('{}');
  };

  const openEditDialog = (template: Template) => {
    setEditingTemplate(template);
    setFormName(template.name);
    setFormDescription(template.description || '');
    setFormModule(template.module);
    setFormIsPremium(template.is_premium);
    setFormStructure(JSON.stringify(template.structure, null, 2));
  };

  const handleCreate = async () => {
    if (!formName.trim()) {
      toast.error('Nom requis');
      return;
    }

    let structure: Record<string, unknown> = {};
    try {
      structure = JSON.parse(formStructure);
    } catch {
      toast.error('Structure JSON invalide');
      return;
    }

    setIsSubmitting(true);
    try {
      await createTemplate.mutateAsync({
        name: formName.trim(),
        description: formDescription.trim() || undefined,
        module: formModule,
        isPremium: formIsPremium,
        structure,
      });
      setIsCreateOpen(false);
      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingTemplate || !formName.trim()) {
      toast.error('Nom requis');
      return;
    }

    let structure: Record<string, unknown> = {};
    try {
      structure = JSON.parse(formStructure);
    } catch {
      toast.error('Structure JSON invalide');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateTemplate.mutateAsync({
        id: editingTemplate.id,
        name: formName.trim(),
        description: formDescription.trim() || undefined,
        module: formModule,
        isPremium: formIsPremium,
        structure,
      });
      setEditingTemplate(null);
      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteTemplate.mutateAsync(deleteId);
    setDeleteId(null);
  };

  const handleDuplicate = async (id: string) => {
    await duplicateTemplate.mutateAsync(id);
  };

  const filteredTemplates = activeModule === 'all'
    ? templates
    : getByModule(activeModule as ModuleType);

  const modules: (ModuleType | 'all')[] = ['all', 'irreversa', 'nulla', 'thresh', 'silva'];

  const getModuleColor = (mod: ModuleType) => {
    switch (mod) {
      case 'irreversa': return 'border-red-500/30 text-red-500 bg-red-500/10';
      case 'nulla': return 'border-blue-500/30 text-blue-500 bg-blue-500/10';
      case 'thresh': return 'border-amber-500/30 text-amber-500 bg-amber-500/10';
      case 'silva': return 'border-green-500/30 text-green-500 bg-green-500/10';
      default: return 'border-muted-foreground/30 text-muted-foreground bg-muted/10';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="border-border/50 bg-card/30 animate-pulse">
            <CardHeader>
              <div className="h-5 bg-muted rounded w-1/3" />
              <div className="h-4 bg-muted rounded w-2/3" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display tracking-wide text-foreground">Templates</h2>
          <p className="text-sm text-muted-foreground">
            {templates.length} template{templates.length !== 1 ? 's' : ''} disponible{templates.length !== 1 ? 's' : ''}
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau template
          </Button>
        )}
      </div>

      {/* Module filter tabs */}
      <Tabs value={activeModule} onValueChange={(v) => setActiveModule(v as ModuleType | 'all')}>
        <TabsList className="grid grid-cols-5 w-full max-w-md">
          {modules.map(mod => (
            <TabsTrigger key={mod} value={mod} className="text-xs">
              {mod === 'all' ? 'Tous' : MODULE_LABELS[mod]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Templates grid */}
      {filteredTemplates.length === 0 ? (
        <Card className="border-dashed border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground text-center mb-4">
              {activeModule === 'all'
                ? 'Aucun template disponible'
                : `Aucun template ${MODULE_LABELS[activeModule as ModuleType]}`}
            </p>
            {isAdmin && (
              <Button variant="outline" onClick={() => setIsCreateOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Créer un template
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="border-border/50 bg-card/50 hover:bg-card transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-base font-medium">{template.name}</CardTitle>
                      {template.is_premium && (
                        <Badge variant="outline" className="border-yellow-500/30 text-yellow-500 bg-yellow-500/10">
                          <Star className="w-3 h-3 mr-1" />
                          Pro
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getModuleColor(template.module)}>
                        {MODULE_LABELS[template.module]}
                      </Badge>
                    </div>
                  </div>
                  {isAdmin && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(template)}>
                          <Edit2 className="w-4 h-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(template.id)}>
                          <Copy className="w-4 h-4 mr-2" />
                          Dupliquer
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeleteId(template.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {template.description ? (
                  <CardDescription className="text-sm line-clamp-2">
                    {template.description}
                  </CardDescription>
                ) : (
                  <CardDescription className="text-sm text-muted-foreground/50 italic">
                    Pas de description
                  </CardDescription>
                )}
                {Object.keys(template.structure).length > 0 && (
                  <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                    <Layers className="w-3 h-3" />
                    <span>{Object.keys(template.structure).length} champ(s)</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={isCreateOpen} onOpenChange={(open) => { setIsCreateOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nouveau template</DialogTitle>
            <DialogDescription>
              Créez un template réutilisable pour vos dossiers.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="create-name">Nom *</Label>
              <Input
                id="create-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Nom du template"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-description">Description</Label>
              <Textarea
                id="create-description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Description du template..."
                className="min-h-[80px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-module">Module *</Label>
                <Select value={formModule} onValueChange={(v) => setFormModule(v as ModuleType)}>
                  <SelectTrigger id="create-module">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="irreversa">IRREVERSA</SelectItem>
                    <SelectItem value="nulla">NULLA</SelectItem>
                    <SelectItem value="thresh">THRESH</SelectItem>
                    <SelectItem value="silva">SILVA</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Premium</Label>
                <div className="flex items-center gap-2 h-10">
                  <Switch
                    checked={formIsPremium}
                    onCheckedChange={setFormIsPremium}
                  />
                  <span className="text-sm text-muted-foreground">
                    {formIsPremium ? 'Oui' : 'Non'}
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-structure">Structure (JSON)</Label>
              <Textarea
                id="create-structure"
                value={formStructure}
                onChange={(e) => setFormStructure(e.target.value)}
                placeholder="{}"
                className="min-h-[100px] font-mono text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreate} disabled={isSubmitting}>
              {isSubmitting ? 'Création...' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editingTemplate} onOpenChange={(open) => { if (!open) { setEditingTemplate(null); resetForm(); } }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Modifier le template</DialogTitle>
            <DialogDescription>
              Modifiez les propriétés du template.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nom *</Label>
              <Input
                id="edit-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Nom du template"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Description du template..."
                className="min-h-[80px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-module">Module *</Label>
                <Select value={formModule} onValueChange={(v) => setFormModule(v as ModuleType)}>
                  <SelectTrigger id="edit-module">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="irreversa">IRREVERSA</SelectItem>
                    <SelectItem value="nulla">NULLA</SelectItem>
                    <SelectItem value="thresh">THRESH</SelectItem>
                    <SelectItem value="silva">SILVA</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Premium</Label>
                <div className="flex items-center gap-2 h-10">
                  <Switch
                    checked={formIsPremium}
                    onCheckedChange={setFormIsPremium}
                  />
                  <span className="text-sm text-muted-foreground">
                    {formIsPremium ? 'Oui' : 'Non'}
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-structure">Structure (JSON)</Label>
              <Textarea
                id="edit-structure"
                value={formStructure}
                onChange={(e) => setFormStructure(e.target.value)}
                placeholder="{}"
                className="min-h-[100px] font-mono text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTemplate(null)}>
              Annuler
            </Button>
            <Button onClick={handleUpdate} disabled={isSubmitting}>
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce template ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le template sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
