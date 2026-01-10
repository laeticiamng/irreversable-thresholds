import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useCases } from '@/hooks/useCases';
import { UpgradeModal } from '@/components/UpgradeModal';
import { Search, Plus, Calendar, FolderOpen } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const FREE_CASE_LIMIT = 1;

export default function ThreshCases() {
  const navigate = useNavigate();
  const { user, loading: authLoading, isSubscribed } = useAuth();
  const { cases, isLoading } = useCases(user?.id);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/exposition');
    }
  }, [user, authLoading, navigate]);

  // Filter THRESH-related cases (using metadata or domain)
  const threshCases = cases.filter(c => 
    c.metadata && typeof c.metadata === 'object' && (c.metadata as Record<string, unknown>).module === 'thresh'
  );

  const filteredCases = threshCases.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const canCreateCase = isSubscribed || threshCases.length < FREE_CASE_LIMIT;

  const handleNewCase = () => {
    navigate('/thresh/cases/new');
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="text-amber-500/50 font-display tracking-widest text-sm animate-pulse">
          THRESH
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation */}
      <nav className="border-b border-amber-500/20">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link 
            to="/thresh/home" 
            className="font-display text-lg tracking-[0.15em] text-amber-500 hover:text-amber-400 transition-colors"
          >
            THRESH
          </Link>
          <div className="flex items-center gap-4">
            {!isSubscribed && (
              <UpgradeModal 
                trigger={
                  <Button variant="ghost" size="sm" className="text-amber-500 hover:text-amber-400">
                    Débloquer Pro
                  </Button>
                }
              />
                Débloquer Pro
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl tracking-wide text-foreground mb-2">
              Mes dossiers THRESH
            </h1>
            <p className="text-muted-foreground text-sm">
              {threshCases.length} dossier{threshCases.length !== 1 ? 's' : ''}
              {!isSubscribed && (
                <span className="ml-2 text-amber-500/60">
                  (Free: {FREE_CASE_LIMIT} dossier max)
                </span>
              )}
            </p>
          </div>
          <Button 
            onClick={handleNewCase}
            className="bg-amber-500 hover:bg-amber-600 text-black font-display tracking-wider"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau dossier
          </Button>
        </div>

        {/* Search */}
        {threshCases.length > 0 && (
          <div className="relative mb-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un dossier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card/50 border-amber-500/20 focus:border-amber-500/40"
            />
          </div>
        )}

        {/* Cases List */}
        {filteredCases.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-amber-500/20">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full border border-amber-500/20 flex items-center justify-center">
              <FolderOpen className="w-6 h-6 text-amber-500/40" />
            </div>
            <p className="text-muted-foreground font-body mb-6">
              {searchQuery ? 'Aucun dossier trouvé.' : 'Aucun dossier THRESH pour l\'instant.'}
            </p>
            {!searchQuery && (
              <Button 
                onClick={handleNewCase}
                className="bg-amber-500 hover:bg-amber-600 text-black font-display tracking-wider"
              >
                Créer le premier dossier
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredCases.map((caseItem, index) => (
              <Link 
                key={caseItem.id} 
                to={`/thresh/cases/${caseItem.id}`}
                className="block animate-fade-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="p-6 border border-amber-500/20 bg-card/30 hover:bg-card/50 transition-all group">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-lg text-foreground group-hover:text-amber-500 transition-colors truncate">
                        {caseItem.title}
                      </h3>
                      {caseItem.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {caseItem.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground/60">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDistanceToNow(new Date(caseItem.updated_at), { 
                            addSuffix: true, 
                            locale: fr 
                          })}
                        </span>
                        {caseItem.domain && (
                          <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded">
                            {caseItem.domain}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-amber-500/40 group-hover:text-amber-500 transition-colors">
                      →
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-amber-500/20 py-6">
        <div className="max-w-4xl mx-auto px-6 flex justify-between items-center">
          <Link 
            to="/thresh/home" 
            className="text-xs font-display tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors"
          >
            ← THRESH Home
          </Link>
          <Link 
            to="/" 
            className="text-xs font-display tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors"
          >
            Territoires
          </Link>
        </div>
      </footer>
    </div>
  );
}
