import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useUserCases } from '@/hooks/useUserCases';
import { useSubscription } from '@/hooks/useSubscription';
import { DOMAIN_LABELS, Case } from '@/types/database';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { UpgradeModal } from '@/components/UpgradeModal';
import { GlobalNav } from '@/components/GlobalNav';
import { useToast } from '@/hooks/use-toast';
import { Archive, RotateCcw, Trash2 } from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function NullaCases() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { user, loading: authLoading, checkSubscription } = useAuth();
  const { cases, isLoading, archiveCase, restoreCase, deleteCase } = useUserCases(user?.id);
  const { plan, limits } = useSubscription(user?.id);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [domainFilter, setDomainFilter] = useState<string>('all');
  const [showArchived, setShowArchived] = useState(false);

  // Handle Stripe success redirect
  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast({
        title: "🎉 Bienvenue Pro !",
        description: "Votre abonnement est actif. Profitez de tous les avantages.",
      });
      checkSubscription();
      navigate('/nulla/cases', { replace: true });
    }
  }, [searchParams]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/exposition');
    }
  }, [user, authLoading, navigate]);

  // Filter NULLA cases
  const nullaCases = cases.filter(c => {
    const meta = c.metadata as Record<string, unknown> | null;
    return meta?.module === 'nulla';
  });
  
  const activeCases = nullaCases.filter(c => c.status === 'active');
  const archivedCases = nullaCases.filter(c => c.status === 'archived');
  const displayedCases = showArchived ? archivedCases : activeCases;

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="text-nulla/50 font-display tracking-widest text-sm animate-pulse">
          NULLA
        </span>
      </div>
    );
  }

  const isAtLimit = plan === 'free' && activeCases.length >= limits.cases;

  // Filter cases
  const filteredCases = displayedCases.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDomain = domainFilter === 'all' || c.domain === domainFilter;
    return matchesSearch && matchesDomain;
  });

  return (
    <div className="min-h-screen bg-background">
      <GlobalNav />

      {/* Sub-header */}
      <header className="border-b border-nulla/20 pt-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <Link to="/nulla/home" className="font-display text-lg tracking-[0.15em] text-nulla hover:text-nulla/80 transition-colors">
            NULLA
          </Link>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            {plan === 'free' && (
              <span className="text-xs px-2 sm:px-3 py-1 bg-nulla/10 text-nulla border border-nulla/20">
                Free: {activeCases.length}/{limits.cases}
              </span>
            )}
            <Button
              variant={showArchived ? 'outline' : 'ghost'}
              size="sm"
              onClick={() => setShowArchived(!showArchived)}
              className="text-xs"
            >
              <Archive className="w-3 h-3 mr-1" />
              {showArchived ? `Actifs (${activeCases.length})` : `Archives (${archivedCases.length})`}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl tracking-wide text-foreground mb-2">
              {showArchived ? 'Dossiers archivés' : 'Mes dossiers NULLA'}
            </h1>
            <p className="text-muted-foreground text-sm">
              {showArchived ? 'Dossiers archivés' : 'Retrouvez vos diagnostics d\'absences structurantes.'}
            </p>
          </div>
          
          {!showArchived && (
            isAtLimit ? (
              <UpgradeModal 
                trigger={
                  <Button variant="outline" className="border-nulla/30 text-nulla">
                    🔒 Passer Pro pour plus de dossiers
                  </Button>
                }
              />
            ) : (
              <Link to="/nulla/cases/new">
                <Button className="bg-nulla hover:bg-nulla/90 text-primary-foreground">
                  Nouveau dossier
                </Button>
              </Link>
            )
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <Input
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="md:w-64"
          />
          <select
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
            className="px-3 py-2 border border-border bg-background text-foreground text-sm"
          >
            <option value="all">Tous les domaines</option>
            {Object.entries(DOMAIN_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        {/* Cases list */}
        {filteredCases.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-nulla/20">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full border border-nulla/20 flex items-center justify-center">
              <span className="text-2xl text-nulla/40">∅</span>
            </div>
            <p className="text-muted-foreground font-body mb-6">
              {searchQuery || domainFilter !== 'all' 
                ? 'Aucun dossier ne correspond à votre recherche.'
                : showArchived 
                  ? 'Aucun dossier archivé.'
                  : 'Aucun dossier pour l\'instant.'
              }
            </p>
            {!isAtLimit && !showArchived && (
              <Link to="/nulla/cases/new">
                <Button className="bg-nulla hover:bg-nulla/90 text-primary-foreground">
                  Créer votre premier dossier
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredCases.map((caseItem, index) => (
              <CaseCard 
                key={caseItem.id} 
                caseItem={caseItem} 
                index={index}
                showArchived={showArchived}
                onArchive={() => archiveCase.mutate(caseItem.id)}
                onRestore={() => restoreCase.mutate(caseItem.id)}
                onDelete={() => deleteCase.mutate(caseItem.id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-nulla/20 py-6 mt-8 sm:mt-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs">
          <Link to="/" className="font-display tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors">
            ← Territoires
          </Link>
          <span className="text-muted-foreground/50">
            Outil de lucidité
          </span>
        </div>
      </footer>
    </div>
  );
}

function CaseCard({ 
  caseItem, 
  index, 
  showArchived, 
  onArchive, 
  onRestore,
  onDelete,
}: { 
  caseItem: Case; 
  index: number; 
  showArchived: boolean;
  onArchive: () => void;
  onRestore: () => void;
  onDelete: () => void;
}) {
  return (
    <Link 
      to={`/nulla/cases/${caseItem.id}`}
      className="block p-6 border border-nulla/20 bg-card/30 hover:bg-card/50 transition-colors animate-fade-up group"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-display text-lg text-foreground">{caseItem.title}</h3>
            {caseItem.domain && (
              <span className="text-xs px-2 py-0.5 bg-nulla/10 text-nulla/70">
                {DOMAIN_LABELS[caseItem.domain as keyof typeof DOMAIN_LABELS]}
              </span>
            )}
          </div>
          {caseItem.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {caseItem.description}
            </p>
          )}
          <div className="flex items-center gap-4 text-xs text-muted-foreground/60">
            <span>
              Créé le {format(new Date(caseItem.created_at), 'd MMM yyyy', { locale: fr })}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {showArchived ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                onRestore();
              }}
              className="text-nulla hover:text-nulla/80"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                onArchive();
              }}
              className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground"
            >
              <Archive className="w-4 h-4" />
            </Button>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={(e) => e.preventDefault()}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer ce dossier ?</AlertDialogTitle>
                <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete} className="bg-destructive">Supprimer</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <div className="text-nulla/40">→</div>
        </div>
      </div>
    </Link>
  );
}
