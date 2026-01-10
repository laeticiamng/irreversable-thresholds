import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useUserCases } from '@/hooks/useUserCases';
import { useSubscription } from '@/hooks/useSubscription';
import { GlobalNav } from '@/components/GlobalNav';
import { DOMAIN_LABELS, Case } from '@/types/database';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { UpgradeModal } from '@/components/UpgradeModal';
import { useToast } from '@/hooks/use-toast';
import { Archive, ArchiveRestore, Trash2 } from 'lucide-react';
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

export default function IrreversaCases() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { user, loading: authLoading, checkSubscription } = useAuth();
  const { cases, isLoading, archiveCase, restoreCase, deleteCase } = useUserCases(user?.id);
  const { plan, limits } = useSubscription(user?.id);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [domainFilter, setDomainFilter] = useState<string>('all');
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast({
        title: "🎉 Bienvenue Pro !",
        description: "Votre abonnement est actif.",
      });
      checkSubscription();
      navigate('/irreversa/cases', { replace: true });
    }
  }, [searchParams]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/exposition');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="text-primary/50 font-display tracking-widest text-sm animate-pulse">
          IRREVERSA
        </span>
      </div>
    );
  }

  const irreversaCases = cases.filter(c => {
    const meta = c.metadata as Record<string, unknown> | null;
    return meta?.module === 'irreversa' || !meta?.module;
  });
  
  const activeCases = irreversaCases.filter(c => c.status === 'active');
  const archivedCases = irreversaCases.filter(c => c.status === 'archived');
  const displayedCases = showArchived ? archivedCases : activeCases;
  const isAtLimit = plan === 'free' && activeCases.length >= limits.cases;

  const filteredCases = displayedCases.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDomain = domainFilter === 'all' || c.domain === domainFilter;
    return matchesSearch && matchesDomain;
  });

  return (
    <div className="min-h-screen bg-background">
      <GlobalNav />
      
      <header className="border-b border-primary/20 pt-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <Link to="/irreversa/home" className="font-display text-lg tracking-[0.15em] text-primary">
            IRREVERSA
          </Link>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowArchived(!showArchived)}
              className={showArchived ? 'text-primary' : 'text-muted-foreground'}
            >
              <Archive className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">{showArchived ? 'Actifs' : 'Archives'}</span> ({archivedCases.length})
            </Button>
            {plan === 'free' && (
              <span className="text-xs px-2 sm:px-3 py-1 bg-primary/10 text-primary border border-primary/20">
                {activeCases.length}/{limits.cases}
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl tracking-wide text-foreground mb-2">
              {showArchived ? 'Dossiers archivés' : 'Mes dossiers'}
            </h1>
            <p className="text-muted-foreground text-sm">
              Retrouvez vos dossiers IRREVERSA.
            </p>
          </div>
          
          {!showArchived && (isAtLimit ? (
            <UpgradeModal 
              trigger={
                <Button variant="outline" className="border-primary/30 text-primary">
                  🔒 Passer Pro
                </Button>
              }
            />
          ) : (
            <Link to="/irreversa/cases/new">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Nouveau dossier
              </Button>
            </Link>
          ))}
        </div>

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

        {filteredCases.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-primary/20">
            <p className="text-muted-foreground mb-6">Aucun dossier.</p>
            {!showArchived && !isAtLimit && (
              <Link to="/irreversa/cases/new">
                <Button className="bg-primary text-primary-foreground">Créer un dossier</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredCases.map((caseItem, index) => (
              <div 
                key={caseItem.id}
                className="p-6 border border-primary/20 bg-card/30 hover:bg-card/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <Link to={`/irreversa/cases/${caseItem.id}`} className="flex-1">
                    <h3 className="font-display text-lg text-foreground mb-2">{caseItem.title}</h3>
                    {caseItem.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{caseItem.description}</p>
                    )}
                    <span className="text-xs text-muted-foreground/60">
                      {format(new Date(caseItem.created_at), 'd MMM yyyy', { locale: fr })}
                    </span>
                  </Link>
                  
                  <div className="flex items-center gap-2">
                    {showArchived ? (
                      <Button variant="ghost" size="sm" onClick={() => restoreCase.mutate(caseItem.id)}>
                        <ArchiveRestore className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" onClick={() => archiveCase.mutate(caseItem.id)}>
                        <Archive className="w-4 h-4" />
                      </Button>
                    )}
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
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
                          <AlertDialogAction onClick={() => deleteCase.mutate(caseItem.id)} className="bg-destructive">
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-primary/20 py-6 mt-8 sm:mt-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">← Territoires</Link>
          <span className="text-muted-foreground/50">Outil de structuration</span>
        </div>
      </footer>
    </div>
  );
}
