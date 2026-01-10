import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useUserCases } from '@/hooks/useUserCases';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { CaseDomain, TimeHorizon, DOMAIN_LABELS, TIME_HORIZON_LABELS } from '@/types/database';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function CreateThreshCase() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { workspaces } = useWorkspaces(user?.id);
  const personalWorkspace = workspaces.find(w => w.is_personal);
  const { createCase } = useUserCases(user?.id);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [domain, setDomain] = useState<CaseDomain | ''>('');
  const [timeHorizon, setTimeHorizon] = useState<TimeHorizon | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/exposition');
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Le titre est requis');
      return;
    }

    if (!personalWorkspace) {
      toast.error('Aucun workspace trouvé');
      return;
    }

    setIsSubmitting(true);
    try {
      const newCase = await createCase.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        metadata: { module: 'thresh', domain, time_horizon: timeHorizon }
      });
      
      toast.success('Dossier créé');
      navigate(`/thresh/cases/${newCase.id}`);
    } catch (error) {
      toast.error('Erreur lors de la création');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="text-amber-500/50 font-display tracking-widest text-sm animate-pulse">THRESH</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation */}
      <nav className="border-b border-amber-500/20">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link to="/thresh/cases" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <Link to="/thresh/home" className="font-display text-lg tracking-[0.15em] text-amber-500 hover:text-amber-400 transition-colors">
            THRESH
          </Link>
        </div>
      </nav>

      {/* Form */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-12">
        <div className="mb-8">
          <h1 className="font-display text-3xl tracking-wide text-foreground mb-2">Nouveau dossier THRESH</h1>
          <p className="text-muted-foreground text-sm">Décris le contexte dans lequel tu vas identifier des seuils invisibles.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-foreground">Titre du dossier *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Limites de charge de travail"
              className="bg-card/50 border-amber-500/20 focus:border-amber-500/40"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground">Contexte (optionnel)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décris brièvement le contexte de ce dossier..."
              className="bg-card/50 border-amber-500/20 focus:border-amber-500/40 min-h-[120px]"
            />
            <p className="text-xs text-muted-foreground">Le contexte aide à mieux comprendre les seuils que tu vas identifier.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-foreground">Domaine (optionnel)</Label>
              <Select value={domain} onValueChange={(v) => setDomain(v as CaseDomain)}>
                <SelectTrigger className="bg-card/50 border-amber-500/20">
                  <SelectValue placeholder="Sélectionner un domaine" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(DOMAIN_LABELS) as [CaseDomain, string][]).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Horizon temporel (optionnel)</Label>
              <Select value={timeHorizon} onValueChange={(v) => setTimeHorizon(v as TimeHorizon)}>
                <SelectTrigger className="bg-card/50 border-amber-500/20">
                  <SelectValue placeholder="Sélectionner un horizon" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(TIME_HORIZON_LABELS) as [TimeHorizon, string][]).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-6 border-t border-amber-500/10">
            <Link to="/thresh/cases">
              <Button type="button" variant="ghost" className="text-muted-foreground">Annuler</Button>
            </Link>
            <Button 
              type="submit" 
              disabled={isSubmitting || !title.trim()}
              className="bg-amber-500 hover:bg-amber-600 text-black font-display tracking-wider"
            >
              {isSubmitting ? 'Création...' : 'Créer le dossier'}
            </Button>
          </div>
        </form>
      </main>

      {/* Footer */}
      <footer className="border-t border-amber-500/20 py-6">
        <div className="max-w-2xl mx-auto px-6">
          <p className="text-xs text-muted-foreground/60 text-center">Outil de lucidité. Pas de promesse. Pas de décision à ta place.</p>
        </div>
      </footer>
    </div>
  );
}
