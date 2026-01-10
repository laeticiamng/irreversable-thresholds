import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { InvisibleThresholdCard } from '@/components/InvisibleThresholdCard';
import { CreateInvisibleThresholdForm } from '@/components/CreateInvisibleThresholdForm';
import { SensingCeremony } from '@/components/SensingCeremony';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useInvisibleThresholds } from '@/hooks/useInvisibleThresholds';
import { InvisibleThreshold, ThreshType } from '@/types/database';

export default function Thresholds() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { 
    isLoading, 
    addThreshold, 
    markAsSensed, 
    getPendingThresholds, 
    getSensedThresholds 
  } = useInvisibleThresholds(user?.id);
  
  const [isCreating, setIsCreating] = useState(false);
  const [sensingThreshold, setSensingThreshold] = useState<InvisibleThreshold | null>(null);
  const [showSensed, setShowSensed] = useState(false);

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

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-amber-500/50 font-display tracking-widest text-sm animate-pulse">
          SEUILS
        </span>
      </div>
    );
  }

  const displayedThresholds = showSensed ? sensedThresholds : pendingThresholds;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="border-b border-amber-500/20">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/thresh" className="font-display text-lg tracking-[0.15em] text-amber-500 hover:text-amber-400 transition-colors">
            THRESH
          </Link>
          <div className="flex items-center gap-6">
            <button
              onClick={() => setShowSensed(false)}
              className={`text-xs font-display tracking-[0.15em] uppercase transition-colors ${
                !showSensed ? 'text-amber-500' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              En attente ({pendingThresholds.length})
            </button>
            <button
              onClick={() => setShowSensed(true)}
              className={`text-xs font-display tracking-[0.15em] uppercase transition-colors ${
                showSensed ? 'text-amber-500' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Ressentis ({sensedThresholds.length})
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="font-display text-3xl tracking-wide text-foreground mb-2">
              {showSensed ? 'Seuils ressentis' : 'Seuils en attente'}
            </h1>
            <p className="text-muted-foreground text-sm font-body">
              {showSensed 
                ? 'Ce qui a été reconnu. Ce qui a basculé.'
                : 'Ce qui n\'a pas encore été ressenti.'
              }
            </p>
          </div>
          {!isCreating && !showSensed && (
            <Button 
              variant="monument" 
              onClick={() => setIsCreating(true)}
              className="border-amber-500/30 text-amber-500 hover:border-amber-500"
            >
              Nouveau seuil
            </Button>
          )}
        </div>

        {/* Create form */}
        {isCreating && (
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
              <span className="text-2xl text-amber-500/40">◉</span>
            </div>
            <p className="text-muted-foreground font-body mb-6">
              {showSensed 
                ? 'Aucun seuil ressenti pour l\'instant.'
                : 'Aucun seuil en attente.'
              }
            </p>
            {!showSensed && (
              <Button 
                variant="monument" 
                onClick={() => setIsCreating(true)}
                className="border-amber-500/30 text-amber-500 hover:border-amber-500"
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
                  onSense={!showSensed ? () => setSensingThreshold(threshold) : undefined}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-amber-500/20 py-6">
        <div className="max-w-4xl mx-auto px-6 flex justify-between items-center">
          <Link 
            to="/" 
            className="text-xs font-display tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Accueil
          </Link>
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
