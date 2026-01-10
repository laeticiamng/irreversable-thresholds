import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type AIModule = 'irreversa' | 'nulla' | 'thresh';

export type AIAction = 
  | 'irreversa_structure_draft'
  | 'irreversa_missing_fields'
  | 'irreversa_report_outline'
  | 'nulla_absence_to_effect'
  | 'nulla_detect_duplicates'
  | 'thresh_suggest_tags'
  | 'thresh_period_summary';

export interface AIActionConfig {
  id: AIAction;
  label: string;
  description: string;
  isPro: boolean;
  module: AIModule;
}

export const AI_ACTIONS_CONFIG: AIActionConfig[] = [
  // IRREVERSA
  {
    id: 'irreversa_structure_draft',
    label: 'Structurer',
    description: 'Transforme ton brouillon en seuil clair avec catégorie et implications',
    isPro: false,
    module: 'irreversa',
  },
  {
    id: 'irreversa_missing_fields',
    label: 'Ce qui manque',
    description: 'Identifie les informations à compléter pour clarifier ton seuil',
    isPro: false,
    module: 'irreversa',
  },
  {
    id: 'irreversa_report_outline',
    label: 'Plan de rapport',
    description: 'Propose une structure de rapport basée sur tes seuils',
    isPro: true,
    module: 'irreversa',
  },
  // NULLA
  {
    id: 'nulla_absence_to_effect',
    label: 'Structurer',
    description: 'Transforme un texte en absence structurée avec effets',
    isPro: false,
    module: 'nulla',
  },
  {
    id: 'nulla_detect_duplicates',
    label: 'Dédoublonner',
    description: 'Détecte les absences similaires et propose des fusions',
    isPro: true,
    module: 'nulla',
  },
  // THRESH
  {
    id: 'thresh_suggest_tags',
    label: 'Tags',
    description: 'Propose des tags et une reformulation pour ta capture',
    isPro: false,
    module: 'thresh',
  },
  {
    id: 'thresh_period_summary',
    label: 'Synthèse',
    description: 'Synthétise une période de captures en tendances',
    isPro: true,
    module: 'thresh',
  },
];

export interface AIUsage {
  actionsUsed: number;
  limit: number | null;
  isPro: boolean;
}

export interface AIProposal {
  id: string;
  content: Record<string, any>;
  status: 'pending' | 'accepted' | 'rejected' | 'modified';
  modifiedContent?: Record<string, any>;
}

export function useAIAssist() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [proposals, setProposals] = useState<AIProposal[]>([]);
  const [usage, setUsage] = useState<AIUsage | null>(null);
  const [error, setError] = useState<string | null>(null);

  const callAI = useCallback(async (
    module: AIModule,
    action: AIAction,
    caseContext: Record<string, any>,
    userInput: Record<string, any>,
    caseId?: string,
    workspaceId?: string
  ) => {
    setIsLoading(true);
    setError(null);
    setProposals([]);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Non authentifié');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          module,
          action,
          case_context: caseContext,
          user_input: userInput,
          case_id: caseId,
          workspace_id: workspaceId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.requiresPro) {
          setError('Cette fonctionnalité nécessite un abonnement Pro');
        } else if (data.requiresUpgrade) {
          setError(`Limite atteinte : ${data.actionsUsed}/${data.limit} actions ce mois`);
        } else {
          setError(data.error || 'Erreur du service IA');
        }
        return null;
      }

      setUsage(data.usage);

      // Convert output to proposals
      const output = data.output;
      const newProposals: AIProposal[] = [];

      if (output.proposals) {
        output.proposals.forEach((p: any, i: number) => {
          newProposals.push({
            id: `proposal-${i}`,
            content: p,
            status: 'pending',
          });
        });
      } else if (output.merge_suggestions) {
        output.merge_suggestions.forEach((s: any, i: number) => {
          newProposals.push({
            id: `merge-${i}`,
            content: s,
            status: 'pending',
          });
        });
      } else if (output.report_outline) {
        newProposals.push({
          id: 'report-outline',
          content: output,
          status: 'pending',
        });
      } else if (output.missing) {
        newProposals.push({
          id: 'missing-fields',
          content: output,
          status: 'pending',
        });
      } else if (output.suggested_rewrite) {
        newProposals.push({
          id: 'suggestion',
          content: output,
          status: 'pending',
        });
      } else if (output.summary_title) {
        newProposals.push({
          id: 'period-summary',
          content: output,
          status: 'pending',
        });
      }

      setProposals(newProposals);
      return data.output;

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inattendue';
      setError(message);
      toast({
        title: 'Erreur IA',
        description: message,
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const acceptProposal = useCallback((proposalId: string) => {
    setProposals(prev => prev.map(p => 
      p.id === proposalId ? { ...p, status: 'accepted' as const } : p
    ));
  }, []);

  const rejectProposal = useCallback((proposalId: string) => {
    setProposals(prev => prev.map(p => 
      p.id === proposalId ? { ...p, status: 'rejected' as const } : p
    ));
  }, []);

  const modifyProposal = useCallback((proposalId: string, modifiedContent: Record<string, any>) => {
    setProposals(prev => prev.map(p => 
      p.id === proposalId ? { ...p, status: 'modified' as const, modifiedContent } : p
    ));
  }, []);

  const resetProposals = useCallback(() => {
    setProposals([]);
    setError(null);
  }, []);

  const getActionsForModule = useCallback((module: AIModule) => {
    return AI_ACTIONS_CONFIG.filter(a => a.module === module);
  }, []);

  return {
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
  };
}