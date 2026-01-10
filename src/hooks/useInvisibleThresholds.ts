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
      return data as (InvisibleThreshold & { tags?: string[]; intensity?: number; context?: string })[];
    },
    enabled: !!userId,
  });

  const addThreshold = useMutation({
    mutationFn: async ({ 
      title, 
      description, 
      threshType,
      caseId,
      tags,
      intensity,
      context,
    }: { 
      title: string; 
      description: string; 
      threshType?: ThreshType;
      caseId?: string;
      tags?: string[];
      intensity?: number;
      context?: string;
    }) => {
      if (!userId) throw new Error('User not authenticated');
      const { data, error } = await supabase
        .from('invisible_thresholds')
        .insert({ 
          user_id: userId, 
          title, 
          description, 
          thresh_type: threshType || 'evidence',
          case_id: caseId || null,
          tags: tags || [],
          intensity: intensity || null,
          context: context || null,
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

  const deleteThreshold = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('invisible_thresholds')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invisible_thresholds', userId] });
    },
  });

  const updateThreshold = useMutation({
    mutationFn: async ({
      id,
      title,
      description,
      threshType,
      tags,
      intensity,
      context,
    }: {
      id: string;
      title?: string;
      description?: string;
      threshType?: ThreshType;
      tags?: string[];
      intensity?: number;
      context?: string;
    }) => {
      const updates: Record<string, unknown> = {};
      if (title !== undefined) updates.title = title;
      if (description !== undefined) updates.description = description;
      if (threshType !== undefined) updates.thresh_type = threshType;
      if (tags !== undefined) updates.tags = tags;
      if (intensity !== undefined) updates.intensity = intensity;
      if (context !== undefined) updates.context = context;

      const { error } = await supabase
        .from('invisible_thresholds')
        .update(updates)
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
    deleteThreshold,
    updateThreshold,
    getPendingThresholds,
    getSensedThresholds,
  };
}
