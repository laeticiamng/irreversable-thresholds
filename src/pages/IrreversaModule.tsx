import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ThresholdCard } from '@/components/ThresholdCard';
import { CreateThresholdForm } from '@/components/CreateThresholdForm';
import { CrossingCeremony } from '@/components/CrossingCeremony';
import { ThresholdTimeline } from '@/components/ThresholdTimeline';
import { ExportButton } from '@/components/ExportButton';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useThresholdsDB } from '@/hooks/useThresholdsDB';
import { Threshold } from '@/types/database';

type TabType = 'pending' | 'crossed' | 'timeline';

export default function IrreversaModule() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { 
    isLoading, 
    addThreshold, 
    crossThreshold, 
    getPendingThresholds, 
    getCrossedThresholds,
    thresholds,
  } = useThresholdsDB(user?.id);
  
  const [activeTab, setActiveTab] = useState<TabType>('pending');
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="text-primary/50 font-display tracking-widest text-sm animate-pulse">
          IRREVERSA
        </span>
      </div>
    );
  }

  const tabs: { id: TabType; label: string; count?: number }[] = [
    { id: 'pending', label: 'En attente', count: pendingThresholds.length },
    { id: 'crossed', label: 'Franchis', count: crossedThresholds.length },
    { id: 'timeline', label: 'Timeline' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <nav className="border-b border-primary/20">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link 
            to="/irreversa" 
            className="font-display text-lg tracking-[0.15em] text-primary hover:text-primary/80 transition-colors"
          >
            IRREVERSA
          </Link>
          <div className="flex items-center gap-4">
            <ExportButton 
              module="irreversa" 
              data={thresholds}
              filename="irreversa-seuils"
            />
          </div>
        </div>
      </nav>

      {/* Tabs */}
      <div className="border-b border-border/50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-6">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  relative py-4 text-xs font-display tracking-[0.15em] uppercase transition-colors
                  ${activeTab === tab.id 
                    ? 'text-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                  }
                `}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className="ml-2 text-muted-foreground/60">({tab.count})</span>
                )}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-px bg-primary" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="font-display text-3xl tracking-wide text-foreground mb-2">
              {activeTab === 'pending' && 'Seuils en attente'}
              {activeTab === 'crossed' && 'Seuils franchis'}
              {activeTab === 'timeline' && 'Chronologie'}
            </h1>
            <p className="text-muted-foreground text-sm font-body">
              {activeTab === 'pending' && 'Ce qui n\'a pas encore été franchi.'}
              {activeTab === 'crossed' && 'Ce qui est fait ne peut être défait.'}
              {activeTab === 'timeline' && 'L\'avant et l\'après. Le temps qui ne revient pas.'}
            </p>
          </div>
          {activeTab === 'pending' && !isCreating && (
            <Button variant="monument" onClick={() => setIsCreating(true)}>
              Nouveau seuil
            </Button>
          )}
        </div>

        {/* Tab Content */}
        {activeTab === 'timeline' ? (
          <ThresholdTimeline thresholds={thresholds} />
        ) : (
          <>
            {/* Create form */}
            {isCreating && activeTab === 'pending' && (
              <div className="mb-12 border border-primary/20 p-8 bg-card/50">
                <h2 className="font-display text-xl tracking-wide text-primary mb-6">
                  Inscrire un nouveau seuil
                </h2>
                <CreateThresholdForm 
                  onSubmit={handleCreate} 
                  onCancel={() => setIsCreating(false)} 
                />
              </div>
            )}

            {/* Thresholds list */}
            {(activeTab === 'pending' ? pendingThresholds : crossedThresholds).length === 0 && !isCreating ? (
              <div className="text-center py-24 border border-dashed border-primary/20">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full border border-primary/20 flex items-center justify-center">
                  <span className="text-2xl text-primary/40">◼</span>
                </div>
                <p className="text-muted-foreground font-body mb-6">
                  {activeTab === 'pending' 
                    ? 'Aucun seuil en attente.' 
                    : 'Aucun seuil franchi pour l\'instant.'
                  }
                </p>
                {activeTab === 'pending' && (
                  <Button variant="monument" onClick={() => setIsCreating(true)}>
                    Inscrire le premier seuil
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid gap-4">
                {(activeTab === 'pending' ? pendingThresholds : crossedThresholds).map((threshold, index) => (
                  <div 
                    key={threshold.id} 
                    className="animate-fade-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <ThresholdCard 
                      threshold={threshold} 
                      onCross={activeTab === 'pending' ? () => setCrossingThreshold(threshold) : undefined}
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-primary/20 py-6">
        <div className="max-w-4xl mx-auto px-6 flex justify-between items-center">
          <Link 
            to="/" 
            className="text-xs font-display tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Territoires
          </Link>
          <span className="text-xs font-display tracking-[0.2em] uppercase text-muted-foreground/50">
            {crossedThresholds.length} scellé{crossedThresholds.length !== 1 ? 's' : ''}
          </span>
        </div>
      </footer>

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
