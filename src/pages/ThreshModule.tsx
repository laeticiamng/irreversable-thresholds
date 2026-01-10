import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { InvisibleThresholdCard } from '@/components/InvisibleThresholdCard';
import { CreateInvisibleThresholdForm } from '@/components/CreateInvisibleThresholdForm';
import { SensingCeremony } from '@/components/SensingCeremony';
import { ExportButton } from '@/components/ExportButton';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useInvisibleThresholds } from '@/hooks/useInvisibleThresholds';
import { InvisibleThreshold, ThreshType, THRESH_TYPE_LABELS } from '@/types/database';

type TabType = 'pending' | 'sensed' | 'types';

export default function ThreshModule() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { 
    thresholds,
    isLoading, 
    addThreshold, 
    markAsSensed, 
    getPendingThresholds, 
    getSensedThresholds 
  } = useInvisibleThresholds(user?.id);
  
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [isCreating, setIsCreating] = useState(false);
  const [sensingThreshold, setSensingThreshold] = useState<InvisibleThreshold | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const pendingThresholds = getPendingThresholds();
  const sensedThresholds = getSensedThresholds();

  const handleCreate = async (title: string, description: string, threshType: ThreshType) => {
    await addThreshold.mutateAsync({ title, description, threshType });
    setIsCreating(false);
  };

  const confirmSense = async () => {
    if (sensingThreshold) {
      await markAsSensed.mutateAsync(sensingThreshold.id);
      setSensingThreshold(null);
    }
  };

  // Count by type
  const typeCounts = thresholds.reduce((acc, t) => {
    acc[t.thresh_type] = (acc[t.thresh_type] || 0) + 1;
    return acc;
  }, {} as Record<ThreshType, number>);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="text-amber-500/50 font-display tracking-widest text-sm animate-pulse">
          THRESH
        </span>
      </div>
    );
  }

  const tabs: { id: TabType; label: string; count?: number }[] = [
    { id: 'pending', label: 'En attente', count: pendingThresholds.length },
    { id: 'sensed', label: 'Ressentis', count: sensedThresholds.length },
    { id: 'types', label: 'Par type' },
  ];

  const displayedThresholds = activeTab === 'sensed' ? sensedThresholds : pendingThresholds;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <nav className="border-b border-amber-500/20">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link 
            to="/thresh" 
            className="font-display text-lg tracking-[0.15em] text-amber-500 hover:text-amber-400 transition-colors"
          >
            THRESH
          </Link>
          <div className="flex items-center gap-4">
            <ExportButton 
              module="thresh" 
              data={thresholds}
              filename="thresh-seuils"
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
                    ? 'text-amber-500' 
                    : 'text-muted-foreground hover:text-foreground'
                  }
                `}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className="ml-2 text-muted-foreground/60">({tab.count})</span>
                )}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-px bg-amber-500" />
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
              {activeTab === 'sensed' && 'Seuils ressentis'}
              {activeTab === 'types' && 'Par type de seuil'}
            </h1>
            <p className="text-muted-foreground text-sm font-body">
              {activeTab === 'pending' && 'Ce qui n\'a pas encore été ressenti.'}
              {activeTab === 'sensed' && 'Ce qui a été reconnu. Ce qui a basculé.'}
              {activeTab === 'types' && 'Trop, pas assez, rupture, évidence, saturation...'}
            </p>
          </div>
          {activeTab === 'pending' && !isCreating && (
            <Button 
              variant="ghost"
              onClick={() => setIsCreating(true)}
              className="border border-amber-500/30 text-amber-500 hover:bg-amber-500/10"
            >
              Nouveau seuil
            </Button>
          )}
        </div>

        {/* Tab Content */}
        {activeTab === 'types' ? (
          <div className="grid md:grid-cols-2 gap-4">
            {(Object.entries(THRESH_TYPE_LABELS) as [ThreshType, string][]).map(([type, label]) => (
              <div 
                key={type} 
                className="p-6 border border-amber-500/20 bg-card/30 hover:bg-card/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display text-amber-500">{label}</h3>
                  <span className="text-2xl font-display text-amber-500/60">
                    {typeCounts[type] || 0}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground/60">
                  {type === 'trop' && 'Quand c\'est trop.'}
                  {type === 'pas_assez' && 'Quand ce n\'est pas assez.'}
                  {type === 'rupture' && 'Quand ça casse.'}
                  {type === 'evidence' && 'Quand c\'est soudain évident.'}
                  {type === 'saturation' && 'Quand on ne peut plus absorber.'}
                  {type === 'acceptabilite' && 'Quand ça devient inacceptable.'}
                  {type === 'tolerance' && 'Quand on ne tolère plus.'}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Create form */}
            {isCreating && activeTab === 'pending' && (
              <div className="mb-12 border border-amber-500/20 p-8 bg-card/50">
                <h2 className="font-display text-xl tracking-wide text-amber-500 mb-6">
                  Inscrire un seuil invisible
                </h2>
                <CreateInvisibleThresholdForm 
                  onSubmit={handleCreate} 
                  onCancel={() => setIsCreating(false)} 
                />
              </div>
            )}

            {/* Thresholds list */}
            {displayedThresholds.length === 0 && !isCreating ? (
              <div className="text-center py-24 border border-dashed border-amber-500/20">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full border border-amber-500/20 flex items-center justify-center">
                  <span className="text-2xl text-amber-500/40">≈</span>
                </div>
                <p className="text-muted-foreground font-body mb-6">
                  {activeTab === 'sensed' 
                    ? 'Aucun seuil ressenti pour l\'instant.'
                    : 'Aucun seuil en attente.'
                  }
                </p>
                {activeTab === 'pending' && (
                  <Button 
                    variant="ghost"
                    onClick={() => setIsCreating(true)}
                    className="border border-amber-500/30 text-amber-500 hover:bg-amber-500/10"
                  >
                    Inscrire le premier seuil
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid gap-4">
                {displayedThresholds.map((threshold, index) => (
                  <div 
                    key={threshold.id} 
                    className="animate-fade-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <InvisibleThresholdCard 
                      threshold={threshold} 
                      onSense={activeTab === 'pending' ? () => setSensingThreshold(threshold) : undefined}
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-amber-500/20 py-6">
        <div className="max-w-4xl mx-auto px-6 flex justify-between items-center">
          <Link 
            to="/" 
            className="text-xs font-display tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Territoires
          </Link>
          <span className="text-xs font-display tracking-[0.2em] uppercase text-muted-foreground/50">
            {sensedThresholds.length} ressenti{sensedThresholds.length !== 1 ? 's' : ''}
          </span>
        </div>
      </footer>

      {/* Sensing ceremony modal */}
      {sensingThreshold && (
        <SensingCeremony
          threshold={sensingThreshold}
          onConfirm={confirmSense}
          onCancel={() => setSensingThreshold(null)}
        />
      )}
    </div>
  );
}
