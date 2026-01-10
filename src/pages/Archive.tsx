import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { ThresholdCard } from '@/components/ThresholdCard';
import { useAuth } from '@/hooks/useAuth';
import { useThresholdsDB } from '@/hooks/useThresholdsDB';

export default function Archive() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isLoading, getPendingThresholds, getCrossedThresholds } = useThresholdsDB(user?.id);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const pendingThresholds = getPendingThresholds();
  const crossedThresholds = getCrossedThresholds();

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-muted-foreground font-display tracking-widest text-sm animate-pulse">CHARGEMENT</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation pendingCount={pendingThresholds.length} crossedCount={crossedThresholds.length} />
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12">
        <div className="mb-12">
          <h1 className="font-display text-3xl tracking-wide text-foreground mb-2">Les franchis</h1>
          <p className="text-muted-foreground text-sm font-body">Ce qui a été fait ne peut être défait.</p>
        </div>

        {crossedThresholds.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-border">
            <p className="text-muted-foreground font-body">Aucun seuil franchi pour l'instant.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {crossedThresholds.map((threshold, index) => (
              <div key={threshold.id} className="animate-fade-up" style={{ animationDelay: `${index * 100}ms` }}>
                <ThresholdCard threshold={threshold} />
              </div>
            ))}
          </div>
        )}
      </main>
      <footer className="border-t border-border py-8">
        <p className="text-center text-xs text-muted-foreground font-display tracking-[0.2em]">
          {crossedThresholds.length} SEUIL{crossedThresholds.length !== 1 ? 'S' : ''} SCELLÉ{crossedThresholds.length !== 1 ? 'S' : ''}
        </p>
      </footer>
    </div>
  );
}
