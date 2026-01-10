import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Check, X, Edit2, History, AlertCircle, Loader2, Lock, HelpCircle, ArrowRight } from 'lucide-react';
import { useAIAssist, AIModule, AIAction, AI_ACTIONS_CONFIG, AIProposal } from '@/hooks/useAIAssist';
import { AIUpgradePrompt } from '@/components/ai/AIUpgradePrompt';
import { AI_MICROCOPY, AI_ACTION_HELP } from '@/lib/ai-microcopy';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface AIAssistPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  module: AIModule;
  caseId?: string;
  caseContext: Record<string, any>;
  userInput: Record<string, any>;
  isSubscribed: boolean;
  onAccept: (proposal: AIProposal) => void;
  onViewHistory?: () => void;
}

export function AIAssistPanel({
  open,
  onOpenChange,
  module,
  caseId,
  caseContext,
  userInput,
  isSubscribed,
  onAccept,
  onViewHistory,
}: AIAssistPanelProps) {
  const {
    isLoading,
    proposals,
    usage,
    error,
    callAI,
    acceptProposal,
    rejectProposal,
    modifyProposal,
    resetProposals,
    getActionsForModule,
  } = useAIAssist();

  const [selectedAction, setSelectedAction] = useState<AIAction | null>(null);
  const [editingProposal, setEditingProposal] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<'limit' | 'pro_action'>('limit');

  const actions = getActionsForModule(module);

  useEffect(() => {
    if (open && actions.length > 0 && !selectedAction) {
      setSelectedAction(actions[0].id);
    }
  }, [open, actions, selectedAction]);

  useEffect(() => {
    if (!open) {
      resetProposals();
      setSelectedAction(null);
      setEditingProposal(null);
    }
  }, [open, resetProposals]);

  const handleExecute = async () => {
    if (!selectedAction) return;
    await callAI(module, selectedAction, caseContext, userInput, caseId);
  };

  const handleAccept = (proposal: AIProposal) => {
    acceptProposal(proposal.id);
    onAccept(proposal);
  };

  const handleStartEdit = (proposal: AIProposal) => {
    setEditingProposal(proposal.id);
    setEditContent(JSON.stringify(proposal.content, null, 2));
  };

  const handleSaveEdit = (proposalId: string) => {
    try {
      const parsed = JSON.parse(editContent);
      modifyProposal(proposalId, parsed);
      setEditingProposal(null);
      
      const modifiedProposal = proposals.find(p => p.id === proposalId);
      if (modifiedProposal) {
        onAccept({ ...modifiedProposal, status: 'modified', modifiedContent: parsed });
      }
    } catch (e) {
      // Invalid JSON
    }
  };

  const moduleColors: Record<AIModule, string> = {
    irreversa: 'text-primary border-primary/30',
    nulla: 'text-nulla border-nulla/30',
    thresh: 'text-amber-500 border-amber-500/30',
  };

  const moduleNames: Record<AIModule, string> = {
    irreversa: 'IRREVERSA',
    nulla: 'NULLA',
    thresh: 'THRESH',
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg border-l border-border/50">
        <SheetHeader className="pb-4 border-b border-border/30">
          <SheetTitle className="flex items-center gap-2 font-display tracking-wider">
            <Sparkles className="w-4 h-4 text-primary" />
            Aide IA
            <Badge variant="outline" className={`ml-2 text-xs ${moduleColors[module]}`}>
              {moduleNames[module]}
            </Badge>
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-8rem)] pr-4">
          <div className="space-y-6 py-4">
            {/* 1. Action Selection */}
            <section>
              <h3 className="text-xs font-display tracking-wider text-muted-foreground mb-3">
                ACTION IA
              </h3>
              <div className="flex flex-wrap gap-2">
                {actions.map(action => {
                  const isLocked = action.isPro && !isSubscribed;
                  return (
                    <Button
                      key={action.id}
                      variant={selectedAction === action.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => !isLocked && setSelectedAction(action.id)}
                      disabled={isLocked}
                      className={`text-xs ${selectedAction === action.id ? '' : 'opacity-70'}`}
                    >
                      {isLocked && <Lock className="w-3 h-3 mr-1" />}
                      {action.label}
                      {action.isPro && (
                        <Badge variant="secondary" className="ml-1.5 text-[10px] py-0">
                          Pro
                        </Badge>
                      )}
                    </Button>
                  );
                })}
              </div>
              {selectedAction && (
                <p className="text-xs text-muted-foreground mt-2">
                  {actions.find(a => a.id === selectedAction)?.description}
                </p>
              )}
            </section>

            {/* 2. Context Preview */}
            <section>
              <h3 className="text-xs font-display tracking-wider text-muted-foreground mb-3">
                CONTEXTE ENVOYÉ
              </h3>
              <div className="p-3 bg-muted/30 rounded border border-border/30 text-xs font-mono">
                <div className="text-muted-foreground mb-1">Dossier :</div>
                <div className="text-foreground mb-2">
                  {caseContext.title || 'Aucun dossier'}
                </div>
                <div className="text-muted-foreground mb-1">Données :</div>
                <div className="text-foreground truncate">
                  {Object.keys(userInput).length} champ(s)
                </div>
              </div>
              <Button
                onClick={handleExecute}
                disabled={isLoading || !selectedAction}
                className="w-full mt-3"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyse en cours...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Lancer l'analyse
                  </>
                )}
              </Button>
            </section>

            {/* Error display */}
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-destructive">{error}</p>
                  {(error.includes('Pro') || error.includes('Limite')) && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="mt-2 text-xs"
                      onClick={() => {
                        setUpgradeReason(error.includes('Pro') ? 'pro_action' : 'limit');
                        setShowUpgradePrompt(true);
                      }}
                    >
                      Passer Pro
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* 3. Proposals */}
            <AnimatePresence mode="wait">
              {proposals.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                  <h3 className="text-xs font-display tracking-wider text-muted-foreground mb-3">
                    PROPOSITIONS IA
                  </h3>
                  <div className="space-y-3">
                    {proposals.map((proposal, index) => (
                      <motion.div
                        key={proposal.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: index * 0.1, type: 'spring', stiffness: 300, damping: 25 }}
                        className={`p-4 border rounded-lg transition-colors ${
                          proposal.status === 'accepted' ? 'border-green-500/50 bg-green-500/5' :
                          proposal.status === 'rejected' ? 'border-destructive/50 bg-destructive/5 opacity-50' :
                          proposal.status === 'modified' ? 'border-amber-500/50 bg-amber-500/5' :
                          'border-border/50 bg-card/50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="secondary" className="text-xs">
                            Proposition {index + 1}
                          </Badge>
                          {proposal.status !== 'pending' && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                            >
                              <Badge 
                                variant={proposal.status === 'accepted' ? 'default' : 'outline'}
                                className={`text-[10px] ${
                                  proposal.status === 'accepted' ? 'bg-green-500' :
                                  proposal.status === 'modified' ? 'bg-amber-500' : ''
                                }`}
                              >
                                {proposal.status === 'accepted' ? '✓ Accepté' :
                                 proposal.status === 'rejected' ? '✗ Refusé' : '✎ Modifié'}
                              </Badge>
                            </motion.div>
                          )}
                        </div>

                        {editingProposal === proposal.id ? (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-2"
                          >
                            <Textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className="font-mono text-xs min-h-[150px]"
                            />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleSaveEdit(proposal.id)}>
                                Sauvegarder
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => setEditingProposal(null)}>
                                Annuler
                              </Button>
                            </div>
                          </motion.div>
                        ) : (
                          <>
                            <ProposalContent content={proposal.modifiedContent || proposal.content} />
                            
                            {proposal.status === 'pending' && (
                              <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex gap-2 mt-3 pt-3 border-t border-border/30"
                              >
                                <Button
                                  size="sm"
                                  variant="default"
                                  className="flex-1 bg-green-600 hover:bg-green-700"
                                  onClick={() => handleAccept(proposal)}
                                >
                                  <Check className="w-3 h-3 mr-1" />
                                  Accepter
                                  <ArrowRight className="w-3 h-3 ml-1" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleStartEdit(proposal)}
                                >
                                  <Edit2 className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => rejectProposal(proposal.id)}
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </motion.div>
                            )}
                          </>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
              )}
            </AnimatePresence>

            {/* 4. Usage & History */}
            <section className="pt-4 border-t border-border/30">
              <div className="flex items-center justify-between">
                <div>
                  {usage && (
                    <p className="text-xs text-muted-foreground">
                      {usage.isPro ? (
                        '∞ Actions Pro'
                      ) : (
                        `${usage.actionsUsed}/${usage.limit} actions ce mois`
                      )}
                    </p>
                  )}
                </div>
                {onViewHistory && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground"
                    onClick={onViewHistory}
                  >
                    <History className="w-3 h-3 mr-1" />
                    Historique IA
                  </Button>
                )}
              </div>
            </section>
            {/* Disclaimer */}
            <p className="text-[10px] text-center text-muted-foreground/60 pt-2">
              {AI_MICROCOPY.help.disclaimer}
            </p>
          </div>
        </ScrollArea>

        {/* Upgrade Prompt Modal */}
        <AIUpgradePrompt
          open={showUpgradePrompt}
          onOpenChange={setShowUpgradePrompt}
          reason={upgradeReason}
          actionsUsed={usage?.actionsUsed || 0}
          limit={usage?.limit || 5}
        />
      </SheetContent>
    </Sheet>
  );
}

// Helper component to display proposal content nicely
function ProposalContent({ content }: { content: Record<string, any> }) {
  // Handle different proposal types
  if (content.title || content.absence_title) {
    return (
      <div className="text-sm space-y-1">
        <p className="font-medium">{content.title || content.absence_title}</p>
        {content.category && (
          <p className="text-xs text-muted-foreground">Catégorie: {content.category}</p>
        )}
        {content.non_reversible_statement && (
          <p className="text-xs"><span className="text-muted-foreground">Irréversible:</span> {content.non_reversible_statement}</p>
        )}
        {content.after_effects && (
          <p className="text-xs"><span className="text-muted-foreground">Après:</span> {content.after_effects}</p>
        )}
        {content.effect && (
          <p className="text-xs"><span className="text-muted-foreground">Effet:</span> {content.effect}</p>
        )}
        {content.impact_level && (
          <Badge variant="outline" className="text-[10px] mt-1">{content.impact_level}</Badge>
        )}
        {content.implications && (
          <ul className="text-xs text-muted-foreground list-disc list-inside mt-2">
            {content.implications.map((imp: string, i: number) => (
              <li key={i}>{imp}</li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  if (content.missing) {
    return (
      <div className="text-sm space-y-2">
        <p className="font-medium text-xs text-muted-foreground">Champs manquants :</p>
        <ul className="space-y-1">
          {content.missing.map((m: any, i: number) => (
            <li key={i} className="text-xs">
              <span className="font-medium">{m.field}</span>: {m.why}
            </li>
          ))}
        </ul>
        {content.clarifying_questions?.length > 0 && (
          <>
            <p className="font-medium text-xs text-muted-foreground mt-3">Questions de clarification :</p>
            <ul className="text-xs list-disc list-inside">
              {content.clarifying_questions.map((q: string, i: number) => (
                <li key={i}>{q}</li>
              ))}
            </ul>
          </>
        )}
      </div>
    );
  }

  if (content.report_outline) {
    return (
      <div className="text-sm space-y-2">
        {content.report_outline.map((section: any, i: number) => (
          <div key={i}>
            <p className="font-medium text-xs">{section.section}</p>
            <ul className="text-xs text-muted-foreground list-disc list-inside">
              {section.bullets.map((b: string, j: number) => (
                <li key={j}>{b}</li>
              ))}
            </ul>
          </div>
        ))}
        {content.notes && (
          <p className="text-xs italic text-muted-foreground mt-2">{content.notes}</p>
        )}
      </div>
    );
  }

  if (content.suggested_rewrite) {
    return (
      <div className="text-sm space-y-2">
        <p className="text-xs">{content.suggested_rewrite}</p>
        <div className="flex flex-wrap gap-1 mt-2">
          {content.suggested_tags?.map((tag: string, i: number) => (
            <Badge key={i} variant="secondary" className="text-[10px]">{tag}</Badge>
          ))}
        </div>
        {content.suggested_intensity && (
          <p className="text-xs text-muted-foreground">
            Intensité suggérée: {content.suggested_intensity}/5
          </p>
        )}
      </div>
    );
  }

  if (content.summary_title) {
    return (
      <div className="text-sm space-y-2">
        <p className="font-medium">{content.summary_title}</p>
        <div className="flex flex-wrap gap-1">
          {content.top_tags?.map((t: any, i: number) => (
            <Badge key={i} variant="outline" className="text-[10px]">
              {t.tag} ({t.count})
            </Badge>
          ))}
        </div>
        <p className="text-xs">
          <span className="text-muted-foreground">Tendance:</span> {content.intensity_trend}
        </p>
        {content.highlights?.length > 0 && (
          <>
            <p className="text-xs text-muted-foreground mt-2">Points clés :</p>
            <ul className="text-xs list-disc list-inside">
              {content.highlights.map((h: string, i: number) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
          </>
        )}
      </div>
    );
  }

  if (content.merge_suggestions || content.group) {
    return (
      <div className="text-sm space-y-2">
        <p className="font-medium">{content.merged_absence_title}</p>
        <p className="text-xs text-muted-foreground">{content.reason}</p>
        <p className="text-xs">{content.merged_effect}</p>
        <div className="flex gap-2 mt-1">
          <Badge variant="outline" className="text-[10px]">{content.category}</Badge>
          <Badge variant="secondary" className="text-[10px]">{content.impact_level}</Badge>
        </div>
      </div>
    );
  }

  // Fallback: display as JSON
  return (
    <pre className="text-xs font-mono text-muted-foreground overflow-auto max-h-40">
      {JSON.stringify(content, null, 2)}
    </pre>
  );
}