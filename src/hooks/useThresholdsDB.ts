import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Threshold } from '@/types/database';

export function useThresholdsDB(userId: string | undefined) {
  const queryClient = useQueryClient();

  const { data: thresholds = [], isLoading } = useQuery({
    queryKey: ['thresholds', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('thresholds')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
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
        .insert({ user_id: userId, title, description })
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
      const { error } = await supabase
        .from('thresholds')
        .update({ is_crossed: true, crossed_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
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
