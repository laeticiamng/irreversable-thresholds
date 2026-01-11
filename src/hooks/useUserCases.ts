import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Case, ModuleType } from '@/types/database';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';
import { useOrganizationContext } from '@/contexts/OrganizationContext';

/**
 * Hook for fetching cases by user ID (across all workspaces)
 * Use this when you need to display cases for the current user regardless of workspace
 */
export function useUserCases(userId: string | undefined) {
  const queryClient = useQueryClient();
  const { currentOrganization, isPersonalMode } = useOrganizationContext();

  const { data: cases = [], isLoading } = useQuery({
    queryKey: ['user_cases', userId, currentOrganization?.id, isPersonalMode],
    queryFn: async () => {
      if (!userId) return [];
      
      let query = supabase
        .from('cases')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (isPersonalMode) {
        // Personal mode: show only user's personal cases (no org)
        query = query.eq('user_id', userId).is('organization_id', null);
      } else if (currentOrganization) {
        // Organization mode: show org cases + user's personal cases
        query = query.or(`organization_id.eq.${currentOrganization.id},and(user_id.eq.${userId},organization_id.is.null)`);
      } else {
        // Fallback: just user's cases
        query = query.eq('user_id', userId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Case[];
    },
    enabled: !!userId,
  });

  const deleteCase = useMutation({
    mutationFn: async (caseId: string) => {
      const { error } = await supabase
        .from('cases')
        .delete()
        .eq('id', caseId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_cases', userId] });
      toast.success('Dossier supprimé');
    },
    onError: () => {
      toast.error('Erreur lors de la suppression');
    },
  });

  const archiveCase = useMutation({
    mutationFn: async (caseId: string) => {
      const { error } = await supabase
        .from('cases')
        .update({ status: 'archived' })
        .eq('id', caseId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_cases', userId] });
      toast.success('Dossier archivé');
    },
    onError: () => {
      toast.error('Erreur lors de l\'archivage');
    },
  });

  const restoreCase = useMutation({
    mutationFn: async (caseId: string) => {
      const { error } = await supabase
        .from('cases')
        .update({ status: 'active' })
        .eq('id', caseId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_cases', userId] });
      toast.success('Dossier restauré');
    },
    onError: () => {
      toast.error('Erreur lors de la restauration');
    },
  });

  const updateCase = useMutation({
    mutationFn: async ({ caseId, updates }: { caseId: string; updates: { title?: string; description?: string; status?: string } }) => {
      const { error } = await supabase
        .from('cases')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', caseId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_cases', userId] });
    },
  });

  const createCase = useMutation({
    mutationFn: async (data: { title: string; description?: string; metadata?: Json }) => {
      if (!userId) throw new Error('User not authenticated');
      
      // Get user's personal workspace
      const { data: workspaces, error: wsError } = await supabase
        .from('workspaces')
        .select('id')
        .eq('owner_id', userId)
        .eq('is_personal', true)
        .single();
      
      if (wsError || !workspaces) throw new Error('No personal workspace found');
      
      const { data: newCase, error } = await supabase
        .from('cases')
        .insert([{
          title: data.title,
          description: data.description || null,
          metadata: data.metadata || null,
          user_id: userId,
          workspace_id: workspaces.id,
          status: 'active',
          organization_id: isPersonalMode ? null : currentOrganization?.id || null,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return newCase as Case;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_cases', userId] });
      toast.success('Dossier créé');
    },
    onError: () => {
      toast.error('Erreur lors de la création');
    },
  });

  const getActiveCases = () => cases.filter(c => c.status === 'active');
  const getArchivedCases = () => cases.filter(c => c.status === 'archived');
  
  const getCasesByModule = (module: ModuleType) => {
    return cases.filter(c => {
      const meta = c.metadata as Record<string, unknown> | null;
      return meta?.module === module;
    });
  };

  const searchCases = (query: string) => {
    const lowerQuery = query.toLowerCase();
    return cases.filter(c => 
      c.title.toLowerCase().includes(lowerQuery) ||
      c.description?.toLowerCase().includes(lowerQuery)
    );
  };

  return {
    cases,
    isLoading,
    createCase,
    deleteCase,
    archiveCase,
    restoreCase,
    updateCase,
    getActiveCases,
    getArchivedCases,
    getCasesByModule,
    searchCases,
  };
}
