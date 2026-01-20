import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Signal, SignalType } from '@/types/database';
import { useOrganizationContext } from '@/contexts/OrganizationContext';

export function useSignals(userId: string | undefined, caseId?: string) {
  const queryClient = useQueryClient();
  const { currentOrganization, isPersonalMode } = useOrganizationContext();

  const { data: signals = [], isLoading } = useQuery({
    queryKey: ['signals', userId, caseId, currentOrganization?.id, isPersonalMode],
    queryFn: async () => {
      if (!userId) return [];

      let query = supabase
        .from('signals')
        .select('*')
        .order('created_at', { ascending: false });

      if (caseId) {
        query = query.eq('case_id', caseId);
      }

      if (isPersonalMode) {
        query = query.eq('user_id', userId).is('organization_id', null);
      } else if (currentOrganization) {
        query = query.or(`organization_id.eq.${currentOrganization.id},and(user_id.eq.${userId},organization_id.is.null)`);
      } else {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Signal[];
    },
    enabled: !!userId,
  });

  const addSignal = useMutation({
    mutationFn: async ({
      content,
      signalType,
      intensity,
      occurredAt,
      caseId: signalCaseId,
    }: {
      content: string;
      signalType: SignalType;
      intensity?: number;
      occurredAt?: string;
      caseId?: string;
    }) => {
      if (!userId) throw new Error('User not authenticated');
      const { data, error } = await supabase
        .from('signals')
        .insert({
          user_id: userId,
          content,
          signal_type: signalType,
          intensity: intensity || null,
          occurred_at: occurredAt || null,
          case_id: signalCaseId || caseId || null,
          organization_id: isPersonalMode ? null : currentOrganization?.id || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['signals', userId] });
    },
  });

  const updateSignal = useMutation({
    mutationFn: async ({
      id,
      content,
      signalType,
      intensity,
      occurredAt,
    }: {
      id: string;
      content?: string;
      signalType?: SignalType;
      intensity?: number;
      occurredAt?: string;
    }) => {
      const updates: Record<string, unknown> = {};
      if (content !== undefined) updates.content = content;
      if (signalType !== undefined) updates.signal_type = signalType;
      if (intensity !== undefined) updates.intensity = intensity;
      if (occurredAt !== undefined) updates.occurred_at = occurredAt;

      const { data, error } = await supabase
        .from('signals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['signals', userId] });
    },
  });

  const deleteSignal = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('signals')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['signals', userId] });
    },
  });

  const getSignalsByType = (type: SignalType) => signals.filter(s => s.signal_type === type);
  const getRecentSignals = (days: number = 7) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return signals.filter(s => new Date(s.created_at) >= cutoff);
  };
  const getHighIntensitySignals = (minIntensity: number = 4) =>
    signals.filter(s => s.intensity && s.intensity >= minIntensity);

  return {
    signals,
    isLoading,
    addSignal,
    updateSignal,
    deleteSignal,
    getSignalsByType,
    getRecentSignals,
    getHighIntensitySignals,
  };
}
