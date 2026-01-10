import { Threshold } from '@/types/database';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ThresholdTimelineProps {
  thresholds: Threshold[];
}

export function ThresholdTimeline({ thresholds }: ThresholdTimelineProps) {
  // Sort by date (crossed_at or created_at)
  const sortedThresholds = [...thresholds].sort((a, b) => {
    const dateA = a.crossed_at || a.created_at;
    const dateB = b.crossed_at || b.created_at;
    return new Date(dateA).getTime() - new Date(dateB).getTime();
  });

  // Separate into before (pending) and after (crossed)
  const pending = sortedThresholds.filter(t => !t.is_crossed);
  const crossed = sortedThresholds.filter(t => t.is_crossed);

  if (thresholds.length === 0) {
    return (
      <div className="text-center py-24 border border-dashed border-primary/20">
        <p className="text-muted-foreground font-body">
          Aucun seuil à visualiser.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline visualization */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-0">
        
        {/* AVANT - Pending */}
        <div className="flex-1 lg:pr-8">
          <div className="text-center mb-8">
            <span className="text-xs font-display tracking-[0.3em] uppercase text-muted-foreground/60">
              AVANT
            </span>
            <p className="text-xs text-muted-foreground/40 mt-1">
              En attente de franchissement
            </p>
          </div>
          
          <div className="space-y-4">
            {pending.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-border/30 rounded-none">
                <p className="text-muted-foreground/50 text-sm">
                  Aucun seuil en attente
                </p>
              </div>
            ) : (
              pending.map((threshold, index) => (
                <div 
                  key={threshold.id}
                  className="p-4 border border-border/50 bg-card/30 animate-fade-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-display text-sm tracking-wide text-foreground/80">
                        {threshold.title}
                      </h3>
                      <p className="text-xs text-muted-foreground/60 mt-1 line-clamp-2">
                        {threshold.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-muted-foreground/40">
                        {format(new Date(threshold.created_at), 'd MMM', { locale: fr })}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                    <span className="text-xs text-muted-foreground/40">En attente</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Central divider - The moment of crossing */}
        <div className="hidden lg:flex flex-col items-center py-8">
          <div className="flex-1 w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent" />
          <div className="my-4 w-12 h-12 rounded-full border-2 border-primary/40 flex items-center justify-center bg-background">
            <span className="text-primary text-lg">◼</span>
          </div>
          <div className="flex-1 w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent" />
        </div>
        
        {/* Mobile divider */}
        <div className="lg:hidden flex items-center justify-center py-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          <div className="mx-4 w-10 h-10 rounded-full border-2 border-primary/40 flex items-center justify-center bg-background">
            <span className="text-primary">◼</span>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        </div>

        {/* APRÈS - Crossed */}
        <div className="flex-1 lg:pl-8">
          <div className="text-center mb-8">
            <span className="text-xs font-display tracking-[0.3em] uppercase text-primary/70">
              APRÈS
            </span>
            <p className="text-xs text-muted-foreground/40 mt-1">
              Irréversiblement franchi
            </p>
          </div>
          
          <div className="space-y-4">
            {crossed.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-primary/20 rounded-none">
                <p className="text-muted-foreground/50 text-sm">
                  Aucun seuil franchi
                </p>
              </div>
            ) : (
              crossed.map((threshold, index) => (
                <div 
                  key={threshold.id}
                  className="p-4 border border-primary/30 bg-primary/5 animate-fade-up"
                  style={{ animationDelay: `${(pending.length + index) * 100}ms` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-display text-sm tracking-wide text-foreground">
                        {threshold.title}
                      </h3>
                      <p className="text-xs text-muted-foreground/70 mt-1 line-clamp-2">
                        {threshold.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-primary/70">
                        {threshold.crossed_at && format(new Date(threshold.crossed_at), 'd MMM yyyy', { locale: fr })}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-xs text-primary/60">Scellé</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="mt-16 pt-8 border-t border-border/30">
        <div className="grid grid-cols-3 gap-8 text-center">
          <div>
            <span className="text-2xl font-display text-muted-foreground/40">{pending.length}</span>
            <p className="text-xs text-muted-foreground/40 mt-1">en attente</p>
          </div>
          <div>
            <span className="text-2xl font-display text-primary">{crossed.length}</span>
            <p className="text-xs text-primary/60 mt-1">franchis</p>
          </div>
          <div>
            <span className="text-2xl font-display text-foreground/60">{thresholds.length}</span>
            <p className="text-xs text-muted-foreground/40 mt-1">total</p>
          </div>
        </div>
      </div>
    </div>
  );
}
