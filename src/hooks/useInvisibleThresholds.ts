import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { InvisibleThreshold, ThreshType } from '@/types/database';
import { notifyThresholdSensed } from '@/lib/notifications';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { toast } from 'sonner';

export function useInvisibleThresholds(userId: string | undefined) {
  const queryClient = useQueryClient();
  const { currentOrganization, isPersonalMode } = useOrganizationContext();

  const { data: thresholds = [], isLoading } = useQuery({
    queryKey: ['invisible_thresholds', userId, currentOrganization?.id, isPersonalMode],
    queryFn: async () => {
      if (!userId) return [];
      
      let query = supabase
        .from('invisible_thresholds')
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
          organization_id: isPersonalMode ? null : currentOrganization?.id || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invisible_thresholds', userId] });
      toast.success('Seuil créé avec succès');
    },
    onError: (error: Error) => {
      toast.error(`Erreur lors de la création: ${error.message}`);
    },
  });

  const markAsSensed = useMutation({
    mutationFn: async (id: string) => {
      const threshold = thresholds.find(t => t.id === id);
      const { error } = await supabase
        .from('invisible_thresholds')
        .update({ sensed_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
      
      // Send notification
      if (userId && threshold) {
        try {
          await notifyThresholdSensed(userId, threshold.title, threshold.case_id || undefined);
        } catch (notifError) {
          console.error('Failed to send notification:', notifError);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invisible_thresholds', userId] });
      toast.success('Seuil marqué comme ressenti');
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  const unmarkAsSensed = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('invisible_thresholds')
        .update({ sensed_at: null })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invisible_thresholds', userId] });
      toast.success('Seuil remis en latent');
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
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
      toast.success('Seuil supprimé');
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
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
      toast.success('Seuil mis à jour');
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  // Helper functions
  const getPendingThresholds = () => thresholds.filter(t => !t.sensed_at);
  const getSensedThresholds = () => thresholds.filter(t => t.sensed_at);
  const getThresholdsByCase = (caseId: string) => thresholds.filter(t => t.case_id === caseId);

  const getStatistics = () => ({
    total: thresholds.length,
    sensed: thresholds.filter(t => t.sensed_at).length,
    pending: thresholds.filter(t => !t.sensed_at).length,
    byType: Object.entries(
      thresholds.reduce((acc, t) => {
        const type = t.thresh_type || 'evidence';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ),
    averageIntensity: thresholds.filter(t => t.intensity).length > 0
      ? thresholds.reduce((sum, t) => sum + (t.intensity || 0), 0) / thresholds.filter(t => t.intensity).length
      : 0,
  });

  return {
    thresholds,
    isLoading,
    addThreshold,
    markAsSensed,
    unmarkAsSensed,
    deleteThreshold,
    updateThreshold,
    getPendingThresholds,
    getSensedThresholds,
    getThresholdsByCase,
    getStatistics,
  };
}
