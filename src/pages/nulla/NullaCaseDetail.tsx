import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useAbsencesDB } from '@/hooks/useAbsencesDB';
import { useSubscription } from '@/hooks/useSubscription';
import { UpgradeModal } from '@/components/UpgradeModal';
import { AbsenceMatrix } from '@/components/nulla/AbsenceMatrix';
import { VulnerabilityMap } from '@/components/nulla/VulnerabilityMap';
import { AbsencesList } from '@/components/nulla/AbsencesList';
import { NullaExportsTab } from '@/components/nulla/NullaExportsTab';
import { AddAbsenceModal } from '@/components/nulla/AddAbsenceModal';

type TabType = 'matrix' | 'map' | 'absences' | 'exports';

// Free plan limits for NULLA
const NULLA_FREE_LIMITS = {
  absencesPerCase: 5,
};

export default function NullaCaseDetail() {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { absences, isLoading, addAbsence, addEffect } = useAbsencesDB(user?.id);
  const { plan, canExport, isPro } = useSubscription(user?.id);

  const [activeTab, setActiveTab] = useState<TabType>('matrix');
  const [showAddAbsence, setShowAddAbsence] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/exposition');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="text-nulla/50 font-display tracking-widest text-sm animate-pulse">
          NULLA
        </span>
      </div>
    );
  }

  // Filter absences for this case (or all if no caseId)
  const caseAbsences = caseId 
    ? absences.filter(a => a.case_id === caseId)
    : absences;
  
  const isAtLimit = plan === 'free' && caseAbsences.length >= NULLA_FREE_LIMITS.absencesPerCase;

  // Count by impact
  const highImpactCount = caseAbsences.filter(a => (a as any).impact_level === 'high').length;
  const totalEffects = caseAbsences.reduce((sum, a) => sum + (a.effects?.length || 0), 0);

  const tabs: { id: TabType; label: string }[] = [
    { id: 'matrix', label: 'Matrice' },
    { id: 'map', label: 'Carte' },
    { id: 'absences', label: `Absences (${caseAbsences.length})` },
    { id: 'exports', label: 'Exports' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-nulla/20">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/nulla/cases" className="text-xs font-body text-muted-foreground hover:text-foreground transition-colors">
            ← Mes dossiers
          </Link>
          <span className="font-display text-lg tracking-[0.15em] text-nulla">NULLA</span>
          <div className="w-24" />
        </div>
      </header>

      {/* Case header */}
      <div className="border-b border-border/50 bg-card/20">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl tracking-wide text-foreground mb-2">
                Dossier NULLA
              </h1>
              <p className="text-sm text-muted-foreground">
                {highImpactCount} absence{highImpactCount !== 1 ? 's' : ''} critique{highImpactCount !== 1 ? 's' : ''} · {totalEffects} effet{totalEffects !== 1 ? 's' : ''} documenté{totalEffects !== 1 ? 's' : ''}
              </p>
            </div>
            {plan === 'free' && (
              <span className="text-xs px-3 py-1 bg-nulla/10 text-nulla border border-nulla/20">
                Free: {caseAbsences.length}/{NULLA_FREE_LIMITS.absencesPerCase} absences
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
                    ? 'text-nulla' 
                    : 'text-muted-foreground hover:text-foreground'
                  }
                `}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-px bg-nulla" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="sticky top-[57px] z-10 bg-background border-b border-border/30">
        <div className="max-w-5xl mx-auto px-6 py-3 flex justify-end">
          {isAtLimit ? (
            <UpgradeModal 
              trigger={
                <Button variant="outline" className="border-nulla/30 text-nulla">
                  🔒 Passer Pro pour plus d'absences
                </Button>
              }
            />
          ) : (
            <Button 
              onClick={() => setShowAddAbsence(true)}
              className="bg-nulla hover:bg-nulla/90 text-primary-foreground"
            >
              + Ajouter une absence
            </Button>
          )}
        </div>
      </div>

      {/* Tab content */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        {activeTab === 'matrix' && (
          <AbsenceMatrix 
            absences={caseAbsences}
            onAddEffect={(absenceId, type, desc) => 
              addEffect.mutateAsync({ absenceId, effectType: type, description: desc })
            }
          />
        )}

        {activeTab === 'map' && (
          <VulnerabilityMap absences={caseAbsences} />
        )}

        {activeTab === 'absences' && (
          <AbsencesList 
            absences={caseAbsences}
            onAddAbsence={() => setShowAddAbsence(true)}
            isAtLimit={isAtLimit}
          />
        )}

        {activeTab === 'exports' && (
          <NullaExportsTab 
            absences={caseAbsences}
            canExport={canExport}
            isPro={isPro}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/30 py-6 mt-12">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-xs text-muted-foreground/50">
            Outil de lucidité. Pas de promesse. Pas de décision à ta place.
          </p>
        </div>
      </footer>

      {/* Add absence modal */}
      {showAddAbsence && (
        <AddAbsenceModal
          caseId={caseId}
          onClose={() => setShowAddAbsence(false)}
          onSubmit={async (data) => {
            await addAbsence.mutateAsync(data);
            setShowAddAbsence(false);
          }}
        />
      )}
    </div>
  );
}
