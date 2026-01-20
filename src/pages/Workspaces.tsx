import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { Workspace } from '@/types/database';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ArrowLeft, Plus, Folder, Users, MoreHorizontal, Settings, User, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function Workspaces() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { workspaces, isLoading, createWorkspace, personalWorkspace } = useWorkspaces(user?.id);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleCreate = async () => {
    if (!formName.trim()) {
      toast.error('Nom requis');
      return;
    }

    setIsSubmitting(true);
    try {
      await createWorkspace.mutateAsync({
        name: formName.trim(),
        description: formDescription.trim() || undefined,
      });
      setIsCreateOpen(false);
      setFormName('');
      setFormDescription('');
      toast.success('Espace de travail créé');
    } catch {
      toast.error('Erreur lors de la création');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="text-primary/50 font-display tracking-widest text-sm animate-pulse">
          ESPACES
        </span>
      </div>
    );
  }

  const sharedWorkspaces = workspaces.filter(w => !w.is_personal);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <nav className="border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
            </Link>
            <span className="font-display text-lg tracking-[0.15em] text-primary">
              ESPACES DE TRAVAIL
            </span>
          </div>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nouvel espace
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
        <div className="space-y-8">
          {/* Personal Workspace */}
          {personalWorkspace && (
            <section>
              <h2 className="text-lg font-display tracking-wide mb-4 text-foreground">
                Espace personnel
              </h2>
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{personalWorkspace.name}</CardTitle>
                        <CardDescription className="text-xs">
                          Votre espace privé par défaut
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-primary/30 text-primary">
                      Personnel
                    </Badge>
                  </div>
                </CardHeader>
              </Card>
            </section>
          )}

          {/* Shared Workspaces */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display tracking-wide text-foreground">
                Espaces partagés
              </h2>
              <span className="text-sm text-muted-foreground">
                {sharedWorkspaces.length} espace{sharedWorkspaces.length !== 1 ? 's' : ''}
              </span>
            </div>

            {sharedWorkspaces.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Folder className="w-12 h-12 text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground text-center mb-4">
                    Aucun espace partagé
                  </p>
                  <p className="text-sm text-muted-foreground/60 text-center mb-4">
                    Les espaces partagés permettent de collaborer avec d'autres utilisateurs.
                  </p>
                  <Button variant="outline" onClick={() => setIsCreateOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Créer un espace
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sharedWorkspaces.map((workspace) => (
                  <WorkspaceCard key={workspace.id} workspace={workspace} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Create dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvel espace de travail</DialogTitle>
            <DialogDescription>
              Créez un espace pour organiser vos dossiers et collaborer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ws-name">Nom *</Label>
              <Input
                id="ws-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Mon espace de travail"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ws-description">Description</Label>
              <Textarea
                id="ws-description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Description de l'espace..."
                className="min-h-[80px]"
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

      {/* Footer */}
      <footer className="border-t border-border/50 py-6">
        <div className="max-w-6xl mx-auto px-6 text-center text-xs text-muted-foreground">
          Les espaces de travail organisent vos dossiers et facilitent la collaboration.
        </div>
      </footer>
    </div>
  );
}

function WorkspaceCard({ workspace }: { workspace: Workspace }) {
  return (
    <Card className="border-border/50 hover:bg-card/50 transition-colors">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
              <Folder className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-base">{workspace.name}</CardTitle>
              {workspace.description && (
                <CardDescription className="text-xs line-clamp-1">
                  {workspace.description}
                </CardDescription>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Settings className="w-4 h-4 mr-2" />
                Paramètres
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Users className="w-4 h-4 mr-2" />
                Membres
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>
              {formatDistanceToNow(new Date(workspace.created_at), { addSuffix: true, locale: fr })}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
