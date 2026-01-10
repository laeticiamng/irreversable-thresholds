import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useSilvaSpaces } from '@/hooks/useSilvaSpaces';
import { useCases } from '@/hooks/useCases';
import { UpgradeModal } from '@/components/UpgradeModal';
import { Leaf, FolderOpen, Lock, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useEffect } from 'react';

export default function SilvaSpaces() {
  const navigate = useNavigate();
  const { user, loading: authLoading, isSubscribed } = useAuth();
  const { spaces, getGlobalSpace, getCaseSpaces, isLoading } = useSilvaSpaces(user?.id);
  const { cases } = useCases(user?.id);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/exposition');
    }
  }, [user, authLoading, navigate]);

  const globalSpace = getGlobalSpace();
  const caseSpaces = getCaseSpaces();

  // Get case info for each case space
  const caseSpacesWithInfo = caseSpaces.map(space => {
    const caseInfo = cases.find(c => c.id === space.case_id);
    return { ...space, caseInfo };
  });

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Leaf className="w-6 h-6 text-foreground/20 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/20">
        <div className="max-w-3xl mx-auto px-8 py-6 flex items-center justify-between">
          <Link to="/silva/home" className="font-display text-sm tracking-[0.2em] text-foreground/40 hover:text-foreground/60 transition-colors">
            SILVA
          </Link>
          {!isSubscribed && (
            <UpgradeModal 
              trigger={
                <Button variant="ghost" size="sm" className="text-foreground/30 text-xs">
                  Pro
                </Button>
              }
            />
          )}
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-8 py-12">
        <h1 className="font-display text-xl text-foreground/60 mb-8 tracking-wide">Mes espaces SILVA</h1>

        <div className="space-y-4">
          {/* Global Space */}
          <Link 
            to="/silva/space"
            className="block p-6 border border-border/20 bg-card/10 hover:bg-card/20 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full border border-border/20 flex items-center justify-center">
                  <Leaf className="w-4 h-4 text-foreground/30" />
                </div>
                <div>
                  <h3 className="font-display text-foreground/70 group-hover:text-foreground transition-colors">
                    Espace Global
                  </h3>
                  {globalSpace && (
                    <p className="text-xs text-foreground/30">
                      Modifié {formatDistanceToNow(new Date(globalSpace.updated_at), { addSuffix: true, locale: fr })}
                    </p>
                  )}
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-foreground/20 group-hover:text-foreground/40 transition-colors" />
            </div>
          </Link>

          {/* Separator */}
          <div className="py-4 flex items-center gap-4">
            <div className="flex-1 h-px bg-border/10" />
            <span className="text-xs text-foreground/20">Par dossier</span>
            <div className="flex-1 h-px bg-border/10" />
          </div>

          {/* Case Spaces */}
          {!isSubscribed ? (
            <div className="p-8 border border-border/20 bg-card/5 text-center">
              <Lock className="w-6 h-6 text-foreground/20 mx-auto mb-4" />
              <p className="text-sm text-foreground/40 mb-4">
                SILVA par dossier est disponible en Pro
              </p>
              <UpgradeModal 
                trigger={
                  <Button variant="ghost" className="text-foreground/40 hover:text-foreground/60 text-xs">
                    Débloquer Pro
                  </Button>
                }
              />
            </div>
          ) : caseSpacesWithInfo.length === 0 ? (
            <div className="p-8 border border-dashed border-border/20 text-center">
              <FolderOpen className="w-6 h-6 text-foreground/20 mx-auto mb-4" />
              <p className="text-sm text-foreground/30">
                Aucun espace SILVA par dossier.
              </p>
              <p className="text-xs text-foreground/20 mt-2">
                Ouvre un dossier et accède à son espace SILVA.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {caseSpacesWithInfo.map((space) => (
                <Link 
                  key={space.id}
                  to={`/silva/space?case=${space.case_id}`}
                  className="block p-4 border border-border/10 bg-card/5 hover:bg-card/15 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm text-foreground/60 group-hover:text-foreground/80 transition-colors">
                        {space.caseInfo?.title || 'Dossier'}
                      </h3>
                      <p className="text-xs text-foreground/25">
                        Modifié {formatDistanceToNow(new Date(space.updated_at), { addSuffix: true, locale: fr })}
                      </p>
                    </div>
                    <ArrowRight className="w-3 h-3 text-foreground/15 group-hover:text-foreground/30 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/10 py-6">
        <div className="max-w-3xl mx-auto px-8 flex justify-between items-center">
          <Link to="/silva/home" className="text-xs text-foreground/20 hover:text-foreground/40">
            ← SILVA Home
          </Link>
          <Link to="/" className="text-xs text-foreground/20 hover:text-foreground/40">
            Territoires
          </Link>
        </div>
      </footer>
    </div>
  );
}
