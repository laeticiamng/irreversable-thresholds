import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { TemplateManager } from '@/components/templates/TemplateManager';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Crown } from 'lucide-react';

export default function Templates() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { subscription, isLoading: subLoading } = useSubscription(user?.id);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || subLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="text-primary/50 font-display tracking-widest text-sm animate-pulse">
          TEMPLATES
        </span>
      </div>
    );
  }

  const isAdmin = subscription?.plan === 'enterprise' || subscription?.plan === 'team';

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
              TEMPLATES
            </span>
          </div>
          {!isAdmin && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Crown className="w-4 h-4 text-yellow-500" />
              <span>Team ou Enterprise pour créer des templates</span>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
        <TemplateManager isAdmin={isAdmin} />
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6">
        <div className="max-w-6xl mx-auto px-6 text-center text-xs text-muted-foreground">
          Les templates permettent de structurer vos dossiers de manière cohérente.
        </div>
      </footer>
    </div>
  );
}
