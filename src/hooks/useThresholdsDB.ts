import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Threshold } from '@/types/database';
import { notifyThresholdCrossed } from '@/lib/notifications';
import { useOrganizationContext } from '@/contexts/OrganizationContext';

export function useThresholdsDB(userId: string | undefined) {
  const queryClient = useQueryClient();
  const { currentOrganization, isPersonalMode } = useOrganizationContext();

  const { data: thresholds = [], isLoading } = useQuery({
    queryKey: ['thresholds', userId, currentOrganization?.id, isPersonalMode],
    queryFn: async () => {
      if (!userId) return [];
      
      let query = supabase
        .from('thresholds')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (isPersonalMode) {
        // Personal mode: show only user's personal thresholds (no org)
        query = query.eq('user_id', userId).is('organization_id', null);
      } else if (currentOrganization) {
        // Organization mode: show org thresholds + user's personal thresholds
        query = query.or(`organization_id.eq.${currentOrganization.id},and(user_id.eq.${userId},organization_id.is.null)`);
      } else {
        // Fallback: just user's thresholds
        query = query.eq('user_id', userId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Threshold[];
    },
    enabled: !!userId,
  });

  const addThreshold = useMutation({
    mutationFn: async ({ title, description }: { title: string; description: string }) => {
      if (!userId) throw new Error('User not authenticated');
      const { data, error } = await supabase
        .from('thresholds')
        .insert({ 
          user_id: userId, 
          title, 
          description,
          organization_id: isPersonalMode ? null : currentOrganization?.id || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['thresholds', userId] });
    },
  });

  const crossThreshold = useMutation({
    mutationFn: async (id: string) => {
      const threshold = thresholds.find(t => t.id === id);
      const { error } = await supabase
        .from('thresholds')
        .update({ is_crossed: true, crossed_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
      
      // Send notification
      if (userId && threshold) {
        try {
          await notifyThresholdCrossed(userId, threshold.title, threshold.case_id || undefined);
        } catch (notifError) {
          console.error('Failed to send notification:', notifError);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['thresholds', userId] });
    },
  });

  const getPendingThresholds = () => thresholds.filter(t => !t.is_crossed);
  const getCrossedThresholds = () => thresholds.filter(t => t.is_crossed);

  return {
    thresholds,
    isLoading,
    addThreshold,
    crossThreshold,
    getPendingThresholds,
    getCrossedThresholds,
  };
}
