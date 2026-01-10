import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Absence, AbsenceEffect } from '@/types/database';

export function useAbsencesDB(userId: string | undefined) {
  const queryClient = useQueryClient();

  const { data: absences = [], isLoading } = useQuery({
    queryKey: ['absences', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      // Fetch absences
      const { data: absencesData, error: absencesError } = await supabase
        .from('absences')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (absencesError) throw absencesError;

      // Fetch effects for all absences
      const absenceIds = absencesData.map(a => a.id);
      const { data: effectsData, error: effectsError } = await supabase
        .from('absence_effects')
        .select('*')
        .in('absence_id', absenceIds);
      
      if (effectsError) throw effectsError;

      // Combine absences with their effects
      return absencesData.map(absence => ({
        ...absence,
        effects: effectsData.filter(e => e.absence_id === absence.id) as AbsenceEffect[],
      })) as Absence[];
    },
    enabled: !!userId,
  });

  const addAbsence = useMutation({
    mutationFn: async ({ title, description }: { title: string; description: string }) => {
      if (!userId) throw new Error('User not authenticated');
      const { data, error } = await supabase
        .from('absences')
        .insert({ user_id: userId, title, description })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['absences', userId] });
    },
  });

  const addEffect = useMutation({
    mutationFn: async ({ 
      absenceId, 
      effectType, 
      description 
    }: { 
      absenceId: string; 
      effectType: AbsenceEffect['effect_type']; 
      description: string;
    }) => {
      if (!userId) throw new Error('User not authenticated');
      const { error } = await supabase
        .from('absence_effects')
        .insert({ 
          absence_id: absenceId, 
          user_id: userId,
          effect_type: effectType, 
          description 
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['absences', userId] });
    },
  });

  return {
    absences,
    isLoading,
    addAbsence,
    addEffect,
  };
}
