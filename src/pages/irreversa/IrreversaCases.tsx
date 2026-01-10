import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useCases } from '@/hooks/useCases';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { useSubscription } from '@/hooks/useSubscription';
import { DOMAIN_LABELS, Case } from '@/types/database';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { UpgradeModal } from '@/components/UpgradeModal';
import { useToast } from '@/hooks/use-toast';

export default function IrreversaCases() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { user, loading: authLoading, checkSubscription } = useAuth();
  const { personalWorkspace, getOrCreatePersonalWorkspace } = useWorkspaces(user?.id);
  const [workspaceId, setWorkspaceId] = useState<string | undefined>();
  const { cases, isLoading, getActiveCases } = useCases(workspaceId);
  const { plan, limits, canCreateCase } = useSubscription(user?.id);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [domainFilter, setDomainFilter] = useState<string>('all');

  // Handle Stripe success redirect
  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast({
        title: "🎉 Bienvenue Pro !",
        description: "Votre abonnement est actif. Profitez de tous les avantages.",
      });
      checkSubscription();
      // Clean URL
      navigate('/irreversa/cases', { replace: true });
    }
  }, [searchParams]);

  // Ensure we have a workspace
  useEffect(() => {
    const initWorkspace = async () => {
      if (user && !workspaceId) {
        if (personalWorkspace) {
          setWorkspaceId(personalWorkspace.id);
        } else {
          const ws = await getOrCreatePersonalWorkspace();
          setWorkspaceId(ws.id);
        }
      }
    };
    initWorkspace();
  }, [user, personalWorkspace, workspaceId]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/exposition');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || isLoading || !workspaceId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="text-primary/50 font-display tracking-widest text-sm animate-pulse">
          IRREVERSA
        </span>
      </div>
    );
  }

  const activeCases = getActiveCases();
  const isAtLimit = plan === 'free' && activeCases.length >= limits.cases;

  // Filter cases
  const filteredCases = activeCases.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDomain = domainFilter === 'all' || c.domain === domainFilter;
    return matchesSearch && matchesDomain;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-primary/20">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/irreversa" className="font-display text-lg tracking-[0.15em] text-primary hover:text-primary/80 transition-colors">
            IRREVERSA
          </Link>
          {plan === 'free' && (
            <span className="text-xs px-3 py-1 bg-primary/10 text-primary border border-primary/20">
              Free: {activeCases.length}/{limits.cases} dossier
            </span>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl tracking-wide text-foreground mb-2">
              Mes dossiers
            </h1>
            <p className="text-muted-foreground text-sm">
              Retrouvez vos dossiers IRREVERSA et leurs seuils.
            </p>
          </div>
          
          {isAtLimit ? (
            <UpgradeModal 
              trigger={
                <Button variant="outline" className="border-primary/30 text-primary">
                  🔒 Passer Pro pour plus de dossiers
                </Button>
              }
            />
          ) : (
            <Link to="/irreversa/cases/new">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Nouveau dossier
              </Button>
            </Link>
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
          <div className="text-center py-24 border border-dashed border-primary/20">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full border border-primary/20 flex items-center justify-center">
              <span className="text-2xl text-primary/40">◼</span>
            </div>
            <p className="text-muted-foreground font-body mb-6">
              {searchQuery || domainFilter !== 'all' 
                ? 'Aucun dossier ne correspond à votre recherche.'
                : 'Aucun dossier pour l\'instant.'
              }
            </p>
            {!isAtLimit && (
              <Link to="/irreversa/cases/new">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Créer votre premier dossier
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredCases.map((caseItem, index) => (
              <CaseCard key={caseItem.id} caseItem={caseItem} index={index} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-primary/20 py-6 mt-12">
        <div className="max-w-5xl mx-auto px-6 flex justify-between items-center">
          <Link to="/" className="text-xs font-display tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors">
            ← Territoires
          </Link>
          <span className="text-xs text-muted-foreground/50">
            Outil de structuration
          </span>
        </div>
      </footer>
    </div>
  );
}

function CaseCard({ caseItem, index }: { caseItem: Case; index: number }) {
  return (
    <Link 
      to={`/irreversa/cases/${caseItem.id}`}
      className="block p-6 border border-primary/20 bg-card/30 hover:bg-card/50 transition-colors animate-fade-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-display text-lg text-foreground">{caseItem.title}</h3>
            {caseItem.domain && (
              <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary/70">
                {DOMAIN_LABELS[caseItem.domain]}
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
            <span>•</span>
            <span>
              Mis à jour le {format(new Date(caseItem.updated_at), 'd MMM', { locale: fr })}
            </span>
          </div>
        </div>
        <div className="text-primary/40">→</div>
      </div>
    </Link>
  );
}
