import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { ThresholdCard } from '@/components/ThresholdCard';
import { CreateThresholdForm } from '@/components/CreateThresholdForm';
import { CrossingCeremony } from '@/components/CrossingCeremony';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useThresholdsDB } from '@/hooks/useThresholdsDB';
import { Threshold } from '@/types/database';

export default function Pending() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isLoading, addThreshold, crossThreshold, getPendingThresholds, getCrossedThresholds } = useThresholdsDB(user?.id);
  const [isCreating, setIsCreating] = useState(false);
  const [crossingThreshold, setCrossingThreshold] = useState<Threshold | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const pendingThresholds = getPendingThresholds();
  const crossedThresholds = getCrossedThresholds();

  const handleCreate = async (title: string, description: string) => {
    await addThreshold.mutateAsync({ title, description });
    setIsCreating(false);
  };

  const confirmCross = async () => {
    if (crossingThreshold) {
      await crossThreshold.mutateAsync(crossingThreshold.id);
      setCrossingThreshold(null);
    }
  };

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
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="font-display text-3xl tracking-wide text-foreground mb-2">Seuils en attente</h1>
            <p className="text-muted-foreground text-sm font-body">Ce qui n'a pas encore été franchi.</p>
          </div>
          {!isCreating && <Button variant="monument" onClick={() => setIsCreating(true)}>Nouveau seuil</Button>}
        </div>

        {isCreating && (
          <div className="mb-12 border border-border p-8 bg-card">
            <h2 className="font-display text-xl tracking-wide text-foreground mb-6">Inscrire un nouveau seuil</h2>
            <CreateThresholdForm onSubmit={handleCreate} onCancel={() => setIsCreating(false)} />
          </div>
        )}

        {pendingThresholds.length === 0 && !isCreating ? (
          <div className="text-center py-24 border border-dashed border-border">
            <p className="text-muted-foreground font-body mb-6">Aucun seuil en attente.</p>
            <Button variant="monument" onClick={() => setIsCreating(true)}>Inscrire le premier seuil</Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {pendingThresholds.map((threshold, index) => (
              <div key={threshold.id} className="animate-fade-up" style={{ animationDelay: `${index * 100}ms` }}>
                <ThresholdCard threshold={threshold} onCross={() => setCrossingThreshold(threshold)} />
              </div>
            ))}
          </div>
        )}
      </main>

      {crossingThreshold && (
        <CrossingCeremony threshold={crossingThreshold} onConfirm={confirmCross} onCancel={() => setCrossingThreshold(null)} />
      )}
    </div>
  );
}
