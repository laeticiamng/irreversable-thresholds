import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { InvisibleThreshold, ThreshType } from '@/types/database';

export function useInvisibleThresholds(userId: string | undefined) {
  const queryClient = useQueryClient();

  const { data: thresholds = [], isLoading } = useQuery({
    queryKey: ['invisible_thresholds', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('invisible_thresholds')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as InvisibleThreshold[];
    },
    enabled: !!userId,
  });

  const addThreshold = useMutation({
    mutationFn: async ({ 
      title, 
      description, 
      threshType 
    }: { 
      title: string; 
      description: string; 
      threshType: ThreshType;
    }) => {
      if (!userId) throw new Error('User not authenticated');
      const { data, error } = await supabase
        .from('invisible_thresholds')
        .insert({ 
          user_id: userId, 
          title, 
          description, 
          thresh_type: threshType 
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invisible_thresholds', userId] });
    },
  });

  const markAsSensed = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('invisible_thresholds')
        .update({ sensed_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invisible_thresholds', userId] });
    },
  });

  const getPendingThresholds = () => thresholds.filter(t => !t.sensed_at);
  const getSensedThresholds = () => thresholds.filter(t => t.sensed_at);

  return {
    thresholds,
    isLoading,
    addThreshold,
    markAsSensed,
    getPendingThresholds,
    getSensedThresholds,
  };
}
