import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useAbsencesDB } from '@/hooks/useAbsencesDB';
import { useUserCases } from '@/hooks/useUserCases';
import { useSubscription } from '@/hooks/useSubscription';
import { UpgradeModal } from '@/components/UpgradeModal';
import { AbsenceMatrix } from '@/components/nulla/AbsenceMatrix';
import { VulnerabilityMap } from '@/components/nulla/VulnerabilityMap';
import { AbsencesList } from '@/components/nulla/AbsencesList';
import { NullaExportsTab } from '@/components/nulla/NullaExportsTab';
import { AddAbsenceModal } from '@/components/nulla/AddAbsenceModal';
import { SilvaCaseTab } from '@/components/silva/SilvaCaseTab';
import { AIAssistButton } from '@/components/ai/AIAssistButton';
import { AIAssistPanel } from '@/components/ai/AIAssistPanel';
import { AIHistoryModal } from '@/components/ai/AIHistoryModal';
import { TagManager } from '@/components/tags/TagManager';
import { ShareCaseModal } from '@/components/collaboration/ShareCaseModal';
import { useAIFormPrefill, type NullaFormData } from '@/hooks/useAIFormPrefill';
import { Leaf, Folder } from 'lucide-react';
import type { AIProposal } from '@/hooks/useAIAssist';

type TabType = 'matrix' | 'map' | 'absences' | 'exports' | 'silva';

// Free plan limits for NULLA
const NULLA_FREE_LIMITS = {
  absencesPerCase: 5,
};

export default function NullaCaseDetail() {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading, isSubscribed } = useAuth();
  const { absences, isLoading, addAbsence, addEffect, deleteAbsence, updateAbsence } = useAbsencesDB(user?.id);
  const { cases } = useUserCases(user?.id);
  const { plan, canExport, isPro } = useSubscription(user?.id);

  // Find current case
  const currentCase = cases.find(c => c.id === caseId);

  const [activeTab, setActiveTab] = useState<TabType>('matrix');
  const [showAddAbsence, setShowAddAbsence] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showAIHistory, setShowAIHistory] = useState(false);

  // AI form prefill hook
  const { 
    prefillData, 
    handleAIAccept, 
    clearPrefill 
  } = useAIFormPrefill<NullaFormData>();

  // Handle AI proposal acceptance
  const onAIAccept = (proposal: AIProposal) => {
    handleAIAccept(proposal, 'nulla');
    setShowAIPanel(false);
    setShowAddAbsence(true);
  };

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

  const tabs: { id: TabType; label: string; icon?: React.ReactNode; proOnly?: boolean }[] = [
    { id: 'matrix', label: 'Matrice' },
    { id: 'map', label: 'Carte' },
    { id: 'absences', label: `Absences (${caseAbsences.length})` },
    { id: 'exports', label: 'Exports' },
    { id: 'silva', label: 'SILVA', icon: <Leaf className="w-3 h-3" />, proOnly: true },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background"
    >
      {/* Header */}
      <header className="border-b border-nulla/20">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/nulla/cases" className="text-xs font-body text-muted-foreground hover:text-foreground transition-colors">
            ← Mes dossiers
          </Link>
          <span className="font-display text-lg tracking-[0.15em] text-nulla">NULLA</span>
          <Link to="/dashboard" className="text-xs font-body text-muted-foreground hover:text-foreground transition-colors">
            Dashboard
          </Link>
        </div>
      </header>

      {/* Case header */}
      <div className="border-b border-border/50 bg-card/20">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Folder className="w-4 h-4 text-nulla/60" />
                <span className="text-xs text-muted-foreground uppercase tracking-wide">Dossier</span>
              </div>
              <h1 className="font-display text-2xl tracking-wide text-foreground mb-2">
                {currentCase?.title || 'Dossier NULLA'}
              </h1>
              {currentCase?.description && (
                <p className="text-sm text-muted-foreground mb-2">{currentCase.description}</p>
              )}
              <p className="text-sm text-muted-foreground mb-3">
                {highImpactCount} absence{highImpactCount !== 1 ? 's' : ''} critique{highImpactCount !== 1 ? 's' : ''} · {totalEffects} effet{totalEffects !== 1 ? 's' : ''} documenté{totalEffects !== 1 ? 's' : ''}
              </p>
              
              {/* Tags */}
              {caseId && <TagManager caseId={caseId} />}
            </div>
            <div className="flex items-center gap-2">
              {caseId && currentCase && (
                <ShareCaseModal 
                  caseId={caseId}
                  caseTitle={currentCase.title}
                  isOwner={currentCase.user_id === user?.id}
                />
              )}
              {plan === 'free' && (
                <span className="text-xs px-3 py-1 bg-nulla/10 text-nulla border border-nulla/20">
                  Free: {caseAbsences.length}/{NULLA_FREE_LIMITS.absencesPerCase} absences
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border/50 sticky top-0 bg-background z-10">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center gap-6 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  relative py-4 text-xs font-display tracking-[0.15em] uppercase transition-colors whitespace-nowrap flex items-center gap-1.5
                  ${activeTab === tab.id 
                    ? tab.id === 'silva' ? 'text-silva' : 'text-nulla' 
                    : 'text-muted-foreground hover:text-foreground'
                  }
                  ${tab.proOnly && !isSubscribed ? 'opacity-50' : ''}
                `}
              >
                {tab.icon}
                {tab.label}
                {tab.proOnly && !isSubscribed && (
                  <span className="text-[10px] px-1 py-0.5 bg-muted/30 text-muted-foreground rounded ml-1">Pro</span>
                )}
                {activeTab === tab.id && (
                  <span className={`absolute bottom-0 left-0 right-0 h-px ${tab.id === 'silva' ? 'bg-silva' : 'bg-nulla'}`} />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky CTA (hide on SILVA tab) */}
      {activeTab !== 'silva' && (
        <div className="sticky top-[57px] z-10 bg-background border-b border-border/30">
          <div className="max-w-5xl mx-auto px-6 py-3 flex justify-between items-center">
            <AIAssistButton onClick={() => setShowAIPanel(true)} />
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
      )}

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
            onEdit={(data) => updateAbsence.mutateAsync(data)}
            onDelete={(id) => deleteAbsence.mutateAsync(id)}
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

        {activeTab === 'silva' && user && caseId && (
          <SilvaCaseTab
            caseId={caseId}
            caseTitle={currentCase?.title || 'Dossier NULLA'}
            userId={user.id}
            isSubscribed={isSubscribed}
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

      {/* Add absence modal - with prefill support */}
      {showAddAbsence && (
        <AddAbsenceModal
          caseId={caseId}
          onClose={() => {
            setShowAddAbsence(false);
            clearPrefill();
          }}
          onSubmit={async (data) => {
            await addAbsence.mutateAsync(data);
            setShowAddAbsence(false);
            clearPrefill();
          }}
          prefillData={prefillData}
        />
      )}

      {/* AI Panel */}
      <AIAssistPanel
        open={showAIPanel}
        onOpenChange={setShowAIPanel}
        module="nulla"
        caseId={caseId}
        caseContext={{ title: currentCase?.title || 'Dossier NULLA' }}
        userInput={{ absences: caseAbsences }}
        isSubscribed={isSubscribed}
        onAccept={onAIAccept}
        onViewHistory={() => {
          setShowAIPanel(false);
          setShowAIHistory(true);
        }}
      />

      {/* AI History */}
      {user && (
        <AIHistoryModal
          open={showAIHistory}
          onOpenChange={setShowAIHistory}
          caseId={caseId}
          userId={user.id}
        />
      )}
    </motion.div>
  );
}
