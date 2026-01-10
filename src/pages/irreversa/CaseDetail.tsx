import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useIrreversaCases } from '@/hooks/useIrreversaCases';
import { useSubscription } from '@/hooks/useSubscription';
import { ThresholdTimeline } from '@/components/ThresholdTimeline';
import { ConsequencesView } from '@/components/irreversa/ConsequencesView';
import { ThresholdsList } from '@/components/irreversa/ThresholdsList';
import { ExportsTab } from '@/components/irreversa/ExportsTab';
import { AddThresholdModal } from '@/components/irreversa/AddThresholdModal';
import { UpgradeModal } from '@/components/UpgradeModal';
import { DOMAIN_LABELS } from '@/types/database';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

type TabType = 'timeline' | 'consequences' | 'thresholds' | 'exports';

export default function CaseDetail() {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { 
    thresholds, 
    isLoading, 
    getThresholdsByCase,
    crossThreshold,
    addConsequence,
  } = useIrreversaCases(user?.id);
  const { plan, limits, canExport, isPro } = useSubscription(user?.id);

  const [activeTab, setActiveTab] = useState<TabType>('timeline');
  const [showAddThreshold, setShowAddThreshold] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/exposition');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="text-primary/50 font-display tracking-widest text-sm animate-pulse">
          IRREVERSA
        </span>
      </div>
    );
  }

  // For now, we show all thresholds (case filtering will be added when cases are linked)
  const caseThresholds = caseId ? getThresholdsByCase(caseId) : thresholds;
  const isAtThresholdLimit = plan === 'free' && caseThresholds.length >= limits.thresholdsPerCase;

  const tabs: { id: TabType; label: string }[] = [
    { id: 'timeline', label: 'Timeline' },
    { id: 'consequences', label: 'Conséquences' },
    { id: 'thresholds', label: `Seuils (${caseThresholds.length})` },
    { id: 'exports', label: 'Exports' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-primary/20">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/irreversa/cases" className="text-xs font-body text-muted-foreground hover:text-foreground transition-colors">
            ← Mes dossiers
          </Link>
          <span className="font-display text-lg tracking-[0.15em] text-primary">IRREVERSA</span>
          <div className="w-24" />
        </div>
      </header>

      {/* Case header */}
      <div className="border-b border-border/50 bg-card/20">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl tracking-wide text-foreground mb-2">
                Dossier IRREVERSA
              </h1>
              <p className="text-sm text-muted-foreground">
                {caseThresholds.filter(t => t.is_crossed).length} seuils franchis · {caseThresholds.filter(t => !t.is_crossed).length} en attente
              </p>
            </div>
            {plan === 'free' && (
              <span className="text-xs px-3 py-1 bg-primary/10 text-primary border border-primary/20">
                Free: {caseThresholds.length}/{limits.thresholdsPerCase} seuils
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border/50 sticky top-0 bg-background z-10">
        <div className="max-w-5xl mx-auto px-6">
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
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-px bg-primary" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="sticky top-[57px] z-10 bg-background border-b border-border/30">
        <div className="max-w-5xl mx-auto px-6 py-3 flex justify-end">
          {isAtThresholdLimit ? (
            <UpgradeModal 
              trigger={
                <Button variant="outline" className="border-primary/30 text-primary">
                  🔒 Passer Pro pour plus de seuils
                </Button>
              }
            />
          ) : (
            <Button 
              onClick={() => setShowAddThreshold(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              + Ajouter un seuil
            </Button>
          )}
        </div>
      </div>

      {/* Tab content */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        {activeTab === 'timeline' && (
          <ThresholdTimeline thresholds={caseThresholds} />
        )}

        {activeTab === 'consequences' && (
          <ConsequencesView 
            thresholds={caseThresholds} 
            onAddConsequence={addConsequence.mutateAsync}
          />
        )}

        {activeTab === 'thresholds' && (
          <ThresholdsList 
            thresholds={caseThresholds}
            onCross={crossThreshold.mutateAsync}
            onAddThreshold={() => setShowAddThreshold(true)}
            isAtLimit={isAtThresholdLimit}
          />
        )}

        {activeTab === 'exports' && (
          <ExportsTab 
            thresholds={caseThresholds}
            canExport={canExport}
            isPro={isPro}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/30 py-6 mt-12">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-xs text-muted-foreground/50">
            Outil de structuration. Pas de promesse. Pas de décision à ta place.
          </p>
        </div>
      </footer>

      {/* Add threshold modal */}
      {showAddThreshold && (
        <AddThresholdModal
          caseId={caseId}
          onClose={() => setShowAddThreshold(false)}
        />
      )}
    </div>
  );
}
