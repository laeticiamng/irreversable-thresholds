import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Case } from '@/types/database';

/**
 * Hook for fetching cases by user ID (across all workspaces)
 * Use this when you need to display cases for the current user regardless of workspace
 */
export function useUserCases(userId: string | undefined) {
  const queryClient = useQueryClient();

  const { data: cases = [], isLoading } = useQuery({
    queryKey: ['user_cases', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
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
    },
  });

  const getActiveCases = () => cases.filter(c => c.status === 'active');
  const getArchivedCases = () => cases.filter(c => c.status === 'archived');
  const getCasesByModule = (module: string) => {
    // Filter by module based on metadata or case title pattern
    return cases.filter(c => {
      const meta = c.metadata as Record<string, unknown>;
      return meta?.module === module;
    });
  };

  return {
    cases,
    isLoading,
    deleteCase,
    getActiveCases,
    getArchivedCases,
    getCasesByModule,
  };
}
