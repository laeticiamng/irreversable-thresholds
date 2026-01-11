import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Case, Signal, SignalType } from '@/types/database';
import { useOrganizationContext } from '@/contexts/OrganizationContext';

export function useCases(workspaceId: string | undefined) {
  const queryClient = useQueryClient();
  const { currentOrganization, isPersonalMode } = useOrganizationContext();

  // Fetch all cases in workspace (filtered by organization if applicable)
  const { data: cases = [], isLoading } = useQuery({
    queryKey: ['cases', workspaceId, currentOrganization?.id, isPersonalMode],
    queryFn: async () => {
      if (!workspaceId) return [];
      
      let query = supabase
        .from('cases')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false });
      
      // Apply organization filter
      if (isPersonalMode) {
        query = query.is('organization_id', null);
      } else if (currentOrganization) {
        query = query.or(`organization_id.eq.${currentOrganization.id},organization_id.is.null`);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Case[];
    },
    enabled: !!workspaceId,
  });

  // Create a new case
  const createCase = useMutation({
    mutationFn: async ({ 
      title, 
      description,
      templateId,
      metadata = {},
    }: { 
      title: string; 
      description?: string;
      templateId?: string;
      metadata?: Record<string, unknown>;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !workspaceId) throw new Error('Not authenticated or no workspace');

      const { data, error } = await supabase
        .from('cases')
        .insert([{ 
          title, 
          description: description || null,
          workspace_id: workspaceId,
          user_id: user.id,
          template_id: templateId || null,
          organization_id: isPersonalMode ? null : currentOrganization?.id || null,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data as Case;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases', workspaceId] });
    },
  });

  // Update case status
  const updateCaseStatus = useMutation({
    mutationFn: async ({ 
      caseId, 
      status 
    }: { 
      caseId: string; 
      status: Case['status'];
    }) => {
      const { error } = await supabase
        .from('cases')
        .update({ status })
        .eq('id', caseId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases', workspaceId] });
    },
  });

  // Archive case
  const archiveCase = useMutation({
    mutationFn: async (caseId: string) => {
      const { error } = await supabase
        .from('cases')
        .update({ status: 'archived' })
        .eq('id', caseId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases', workspaceId] });
    },
  });

  const getActiveCases = () => cases.filter(c => c.status === 'active');
  const getArchivedCases = () => cases.filter(c => c.status === 'archived');

  return {
    cases,
    isLoading,
    createCase,
    updateCaseStatus,
    archiveCase,
    getActiveCases,
    getArchivedCases,
  };
}

// Separate hook for signals within a case
export function useSignals(caseId: string | undefined) {
  const queryClient = useQueryClient();

  const { data: signals = [], isLoading } = useQuery({
    queryKey: ['signals', caseId],
    queryFn: async () => {
      if (!caseId) return [];
      const { data, error } = await supabase
        .from('signals')
        .select('*')
        .eq('case_id', caseId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Signal[];
    },
    enabled: !!caseId,
  });

  const addSignal = useMutation({
    mutationFn: async ({ 
      content, 
      signalType = 'observation',
      intensity,
      occurredAt,
    }: { 
      content: string; 
      signalType?: SignalType;
      intensity?: number;
      occurredAt?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !caseId) throw new Error('Not authenticated or no case');

      const { data, error } = await supabase
        .from('signals')
        .insert([{ 
          case_id: caseId,
          user_id: user.id,
          content, 
          signal_type: signalType,
          intensity: intensity || null,
          occurred_at: occurredAt || null,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data as Signal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['signals', caseId] });
    },
  });

  return {
    signals,
    isLoading,
    addSignal,
  };
}
