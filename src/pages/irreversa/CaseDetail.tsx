import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useIrreversaCases } from '@/hooks/useIrreversaCases';
import { useUserCases } from '@/hooks/useUserCases';
import { useSubscription } from '@/hooks/useSubscription';
import { ThresholdTimeline } from '@/components/ThresholdTimeline';
import { ConsequencesView } from '@/components/irreversa/ConsequencesView';
import { ThresholdsList } from '@/components/irreversa/ThresholdsList';
import { ExportsTab } from '@/components/irreversa/ExportsTab';
import { AddThresholdModal } from '@/components/irreversa/AddThresholdModal';
import { UpgradeModal } from '@/components/UpgradeModal';
import { SilvaCaseTab } from '@/components/silva/SilvaCaseTab';
import { AIAssistButton } from '@/components/ai/AIAssistButton';
import { AIAssistPanel } from '@/components/ai/AIAssistPanel';
import { AIHistoryModal } from '@/components/ai/AIHistoryModal';
import { useAIFormPrefill, type IrreversaFormData } from '@/hooks/useAIFormPrefill';
import { DOMAIN_LABELS } from '@/types/database';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Leaf, Folder } from 'lucide-react';
import type { AIProposal } from '@/hooks/useAIAssist';

type TabType = 'timeline' | 'consequences' | 'thresholds' | 'exports' | 'silva';

export default function CaseDetail() {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading, isSubscribed } = useAuth();
  const { 
    thresholds, 
    isLoading, 
    getThresholdsByCase,
    crossThreshold,
    addConsequence,
  } = useIrreversaCases(user?.id);
  const { cases } = useUserCases(user?.id);
  const { plan, limits, canExport, isPro } = useSubscription(user?.id);

  // Find current case from cases list
  const currentCase = cases.find(c => c.id === caseId);

  const [activeTab, setActiveTab] = useState<TabType>('timeline');
  const [showAddThreshold, setShowAddThreshold] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showAIHistory, setShowAIHistory] = useState(false);
  
  // AI form prefill hook
  const { 
    prefillData, 
    showFormWithPrefill, 
    handleAIAccept, 
    clearPrefill 
  } = useAIFormPrefill<IrreversaFormData>();

  // Handle AI proposal acceptance
  const onAIAccept = (proposal: AIProposal) => {
    handleAIAccept(proposal, 'irreversa');
    setShowAIPanel(false);
    setShowAddThreshold(true);
  };

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

  const tabs: { id: TabType; label: string; icon?: React.ReactNode; proOnly?: boolean }[] = [
    { id: 'timeline', label: 'Timeline' },
    { id: 'consequences', label: 'Conséquences' },
    { id: 'thresholds', label: `Seuils (${caseThresholds.length})` },
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
      <header className="border-b border-primary/20">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/irreversa/cases" className="text-xs font-body text-muted-foreground hover:text-foreground transition-colors">
            ← Mes dossiers
          </Link>
          <span className="font-display text-lg tracking-[0.15em] text-primary">IRREVERSA</span>
          <Link to="/dashboard" className="text-xs font-body text-muted-foreground hover:text-foreground transition-colors">
            Dashboard
          </Link>
        </div>
      </header>

      {/* Case header */}
      <div className="border-b border-border/50 bg-card/20">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Folder className="w-4 h-4 text-primary/60" />
                <span className="text-xs text-muted-foreground uppercase tracking-wide">Dossier</span>
              </div>
              <h1 className="font-display text-2xl tracking-wide text-foreground mb-2">
                {currentCase?.title || 'Dossier IRREVERSA'}
              </h1>
              {currentCase?.description && (
                <p className="text-sm text-muted-foreground mb-2">{currentCase.description}</p>
              )}
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
          <div className="flex items-center gap-6 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  relative py-4 text-xs font-display tracking-[0.15em] uppercase transition-colors whitespace-nowrap flex items-center gap-1.5
                  ${activeTab === tab.id 
                    ? tab.id === 'silva' ? 'text-silva' : 'text-primary' 
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
                  <span className={`absolute bottom-0 left-0 right-0 h-px ${tab.id === 'silva' ? 'bg-silva' : 'bg-primary'}`} />
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
      )}

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

        {activeTab === 'silva' && user && caseId && (
          <SilvaCaseTab
            caseId={caseId}
            caseTitle={currentCase?.title || 'Dossier IRREVERSA'}
            userId={user.id}
            isSubscribed={isSubscribed}
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

      {/* Add threshold modal - with prefill support */}
      {showAddThreshold && (
        <AddThresholdModal
          caseId={caseId}
          onClose={() => {
            setShowAddThreshold(false);
            clearPrefill();
          }}
          prefillData={prefillData}
        />
      )}

      {/* AI Panel */}
      <AIAssistPanel
        open={showAIPanel}
        onOpenChange={setShowAIPanel}
        module="irreversa"
        caseId={caseId}
        caseContext={{ title: currentCase?.title || 'Dossier IRREVERSA' }}
        userInput={{ thresholds: caseThresholds }}
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
