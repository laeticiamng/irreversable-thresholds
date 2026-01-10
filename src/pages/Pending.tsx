import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { ThresholdCard } from '@/components/ThresholdCard';
import { CreateThresholdForm } from '@/components/CreateThresholdForm';
import { CrossingCeremony } from '@/components/CrossingCeremony';
import { Button } from '@/components/ui/button';
import { useThresholds } from '@/hooks/useThresholds';
import { Threshold } from '@/types/threshold';

export default function Pending() {
  const { addThreshold, crossThreshold, getPendingThresholds, getCrossedThresholds, isLoaded } = useThresholds();
  const [isCreating, setIsCreating] = useState(false);
  const [crossingThreshold, setCrossingThreshold] = useState<Threshold | null>(null);

  const pendingThresholds = getPendingThresholds();
  const crossedThresholds = getCrossedThresholds();

  const handleCreate = (title: string, description: string) => {
    addThreshold(title, description);
    setIsCreating(false);
  };

  const handleCross = (threshold: Threshold) => {
    setCrossingThreshold(threshold);
  };

  const confirmCross = () => {
    if (crossingThreshold) {
      crossThreshold(crossingThreshold.id);
      setCrossingThreshold(null);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-muted-foreground font-display tracking-widest text-sm animate-pulse">
          CHARGEMENT
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation pendingCount={pendingThresholds.length} crossedCount={crossedThresholds.length} />

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="font-display text-3xl tracking-wide text-foreground mb-2">
              Seuils en attente
            </h1>
            <p className="text-muted-foreground text-sm font-body">
              Ce qui n'a pas encore été franchi. Ce qui peut encore ne pas l'être.
            </p>
          </div>
          {!isCreating && (
            <Button variant="monument" onClick={() => setIsCreating(true)}>
              Nouveau seuil
            </Button>
          )}
        </div>

        {/* Create form */}
        {isCreating && (
          <div className="mb-12 border border-border p-8 bg-card">
            <h2 className="font-display text-xl tracking-wide text-foreground mb-6">
              Inscrire un nouveau seuil
            </h2>
            <CreateThresholdForm 
              onSubmit={handleCreate} 
              onCancel={() => setIsCreating(false)} 
            />
          </div>
        )}

        {/* Thresholds list */}
        {pendingThresholds.length === 0 && !isCreating ? (
          <div className="text-center py-24 border border-dashed border-border">
            <p className="text-muted-foreground font-body mb-6">
              Aucun seuil en attente.
            </p>
            <Button variant="monument" onClick={() => setIsCreating(true)}>
              Inscrire le premier seuil
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {pendingThresholds.map((threshold, index) => (
              <div 
                key={threshold.id} 
                className="animate-fade-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ThresholdCard 
                  threshold={threshold} 
                  onCross={() => handleCross(threshold)}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Crossing ceremony modal */}
      {crossingThreshold && (
        <CrossingCeremony
          threshold={crossingThreshold}
          onConfirm={confirmCross}
          onCancel={() => setCrossingThreshold(null)}
        />
      )}
    </div>
  );
}
