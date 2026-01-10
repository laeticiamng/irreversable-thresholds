import { Navigation } from '@/components/Navigation';
import { ThresholdCard } from '@/components/ThresholdCard';
import { useThresholds } from '@/hooks/useThresholds';

export default function Archive() {
  const { getPendingThresholds, getCrossedThresholds, isLoaded } = useThresholds();

  const pendingThresholds = getPendingThresholds();
  const crossedThresholds = getCrossedThresholds();

  // Sort by most recently crossed first
  const sortedCrossed = [...crossedThresholds].sort((a, b) => {
    if (!a.crossedAt || !b.crossedAt) return 0;
    return b.crossedAt.getTime() - a.crossedAt.getTime();
  });

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
        <div className="mb-12">
          <h1 className="font-display text-3xl tracking-wide text-foreground mb-2">
            Les franchis
          </h1>
          <p className="text-muted-foreground text-sm font-body">
            Ce qui a été fait ne peut être défait. Ces seuils sont scellés.
          </p>
        </div>

        {/* Archive */}
        {sortedCrossed.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-border">
            <p className="text-muted-foreground font-body">
              Aucun seuil franchi pour l'instant.
            </p>
            <p className="text-muted-foreground/60 text-sm font-body mt-2">
              Quand vous franchirez un seuil, il apparaîtra ici, pour toujours.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {/* Inscription quote */}
            <div className="text-center py-8 mb-8">
              <blockquote className="font-display text-lg italic text-muted-foreground">
                "Ce qui est écrit est écrit."
              </blockquote>
            </div>

            {/* Crossed thresholds */}
            <div className="grid gap-4">
              {sortedCrossed.map((threshold, index) => (
                <div 
                  key={threshold.id} 
                  className="animate-fade-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <ThresholdCard threshold={threshold} />
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer inscription */}
      <footer className="border-t border-border py-8">
        <p className="text-center text-xs text-muted-foreground font-display tracking-[0.2em]">
          {crossedThresholds.length} SEUIL{crossedThresholds.length !== 1 ? 'S' : ''} SCELLÉ{crossedThresholds.length !== 1 ? 'S' : ''}
        </p>
      </footer>
    </div>
  );
}
