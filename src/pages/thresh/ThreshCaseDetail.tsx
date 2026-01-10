import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useUserCases } from '@/hooks/useUserCases';
import { useInvisibleThresholds } from '@/hooks/useInvisibleThresholds';
import { UpgradeModal } from '@/components/UpgradeModal';
import { ThresholdsList } from '@/components/thresh/ThresholdsList';
import { ThresholdsTimeline } from '@/components/thresh/ThresholdsTimeline';
import { ThreshExportsTab } from '@/components/thresh/ThreshExportsTab';
import { AddThresholdModal } from '@/components/thresh/AddThresholdModal';
import { SilvaCaseTab } from '@/components/silva/SilvaCaseTab';
import { AIAssistButton } from '@/components/ai/AIAssistButton';
import { AIAssistPanel } from '@/components/ai/AIAssistPanel';
import { AIHistoryModal } from '@/components/ai/AIHistoryModal';
import { TagManager } from '@/components/tags/TagManager';
import { ShareCaseModal } from '@/components/collaboration/ShareCaseModal';
import { useAIFormPrefill, type ThreshFormData } from '@/hooks/useAIFormPrefill';
import { Plus, ArrowLeft, Leaf } from 'lucide-react';
import type { AIProposal } from '@/hooks/useAIAssist';

const FREE_THRESHOLD_LIMIT = 5;

export default function ThreshCaseDetail() {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading, isSubscribed } = useAuth();
  const { cases, isLoading: casesLoading } = useUserCases(user?.id);
  const { thresholds, isLoading: thresholdsLoading, addThreshold, markAsSensed, deleteThreshold, updateThreshold } = useInvisibleThresholds(user?.id);
  
  const [activeTab, setActiveTab] = useState('thresholds');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showAIHistory, setShowAIHistory] = useState(false);

  // AI form prefill hook
  const { 
    prefillData, 
    handleAIAccept, 
    clearPrefill 
  } = useAIFormPrefill<ThreshFormData>();

  // Handle AI proposal acceptance
  const onAIAccept = (proposal: AIProposal) => {
    handleAIAccept(proposal, 'thresh');
    setShowAIPanel(false);
    setShowAddModal(true);
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/exposition');
    }
  }, [user, authLoading, navigate]);

  const currentCase = cases.find(c => c.id === caseId);
  const caseThresholds = thresholds.filter(t => t.case_id === caseId);
  const pendingThresholds = caseThresholds.filter(t => !t.sensed_at);
  const sensedThresholds = caseThresholds.filter(t => t.sensed_at);

  const canAddThreshold = isSubscribed || caseThresholds.length < FREE_THRESHOLD_LIMIT;

  const handleAddThreshold = () => {
    setShowAddModal(true);
  };

  if (authLoading || casesLoading || thresholdsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="text-amber-500/50 font-display tracking-widest text-sm animate-pulse">THRESH</span>
      </div>
    );
  }

  if (!currentCase) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <p className="text-muted-foreground mb-4">Dossier non trouvé</p>
        <Link to="/thresh/cases">
          <Button variant="ghost" className="text-amber-500">Retour aux dossiers</Button>
        </Link>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col bg-background"
    >
      {/* Navigation */}
      <nav className="border-b border-amber-500/20">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/thresh/cases" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <Link to="/thresh/home" className="font-display text-lg tracking-[0.15em] text-amber-500 hover:text-amber-400 transition-colors">
              THRESH
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-xs font-body text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
            {!isSubscribed && (
              <UpgradeModal 
                trigger={
                  <Button variant="ghost" size="sm" className="text-amber-500 hover:text-amber-400">
                    Débloquer Pro
                  </Button>
                }
              />
            )}
          </div>
        </div>
      </nav>

      {/* Case Header */}
      <header className="border-b border-amber-500/10 bg-card/30">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="font-display text-2xl md:text-3xl tracking-wide text-foreground mb-2">{currentCase.title}</h1>
              {currentCase.description && (
                <p className="text-muted-foreground text-sm max-w-2xl">{currentCase.description}</p>
              )}
              <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground/60">
                <span>{caseThresholds.length} seuil{caseThresholds.length !== 1 ? 's' : ''}</span>
                <span>•</span>
                <span>{sensedThresholds.length} ressenti{sensedThresholds.length !== 1 ? 's' : ''}</span>
                {!isSubscribed && (
                  <>
                    <span>•</span>
                    <span className="text-amber-500/60">Free: {FREE_THRESHOLD_LIMIT - caseThresholds.length} seuils restants</span>
                  </>
                )}
              </div>
              
              {/* Tags */}
              <div className="mt-4">
                <TagManager caseId={caseId!} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ShareCaseModal 
                caseId={caseId!}
                caseTitle={currentCase.title}
                isOwner={currentCase.user_id === user?.id}
              />
              <AIAssistButton onClick={() => setShowAIPanel(true)} />
              {activeTab !== 'silva' && (
                <Button 
                  onClick={handleAddThreshold}
                  disabled={!canAddThreshold}
                  className="bg-amber-500 hover:bg-amber-600 text-black font-display tracking-wider"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un seuil
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-card/50 border border-amber-500/20 mb-8">
            <TabsTrigger value="thresholds" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-500">
              Seuils ({caseThresholds.length})
            </TabsTrigger>
            <TabsTrigger value="timeline" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-500">
              Timeline
            </TabsTrigger>
            <TabsTrigger value="exports" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-500">
              Exports
            </TabsTrigger>
            <TabsTrigger value="silva" className="data-[state=active]:bg-silva/20 data-[state=active]:text-silva flex items-center gap-1.5">
              <Leaf className="w-3 h-3" />
              SILVA
              {!isSubscribed && (
                <span className="text-[10px] px-1 py-0.5 bg-muted/30 text-muted-foreground rounded ml-1">Pro</span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="thresholds">
            <ThresholdsList 
              thresholds={caseThresholds}
              onSense={(id) => markAsSensed.mutate(id)}
              onAddThreshold={handleAddThreshold}
              onEdit={(data) => updateThreshold.mutateAsync(data)}
              onDelete={(id) => deleteThreshold.mutateAsync(id)}
            />
          </TabsContent>

          <TabsContent value="timeline">
            <ThresholdsTimeline 
              pendingThresholds={pendingThresholds}
              sensedThresholds={sensedThresholds}
            />
          </TabsContent>

          <TabsContent value="exports">
            <ThreshExportsTab 
              caseData={currentCase}
              thresholds={caseThresholds}
              isSubscribed={isSubscribed}
              onUpgrade={() => {}}
            />
          </TabsContent>

          <TabsContent value="silva">
            {user && caseId && (
              <SilvaCaseTab
                caseId={caseId}
                caseTitle={currentCase.title}
                userId={user.id}
                isSubscribed={isSubscribed}
              />
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-amber-500/20 py-6">
        <div className="max-w-5xl mx-auto px-6 flex justify-between items-center">
          <Link to="/thresh/cases" className="text-xs font-display tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors">
            ← Mes dossiers
          </Link>
          <span className="text-xs font-display tracking-[0.2em] uppercase text-muted-foreground/50">
            {sensedThresholds.length} ressenti{sensedThresholds.length !== 1 ? 's' : ''}
          </span>
        </div>
      </footer>

      <AddThresholdModal
        open={showAddModal}
        onOpenChange={(open) => {
          setShowAddModal(open);
          if (!open) clearPrefill();
        }}
        caseId={caseId!}
        onAdd={addThreshold.mutateAsync}
        isSubscribed={isSubscribed}
        prefillData={prefillData}
      />

      {/* AI Panel */}
      <AIAssistPanel
        open={showAIPanel}
        onOpenChange={setShowAIPanel}
        module="thresh"
        caseId={caseId}
        caseContext={{ title: currentCase.title }}
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
