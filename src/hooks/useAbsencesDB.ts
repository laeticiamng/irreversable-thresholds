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
    mutationFn: async ({ 
      title, 
      description,
      caseId,
      category = 'autre',
      impactLevel = 'moderate',
      counterfactual,
      evidenceNeeded,
    }: { 
      title: string; 
      description: string;
      caseId?: string;
      category?: string;
      impactLevel?: string;
      counterfactual?: string;
      evidenceNeeded?: string;
    }) => {
      if (!userId) throw new Error('User not authenticated');
      const { data, error } = await supabase
        .from('absences')
        .insert({ 
          user_id: userId, 
          title, 
          description,
          case_id: caseId || null,
          category,
          impact_level: impactLevel,
          counterfactual: counterfactual || null,
          evidence_needed: evidenceNeeded || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['absences', userId] });
    },
  });

  const deleteAbsence = useMutation({
    mutationFn: async (absenceId: string) => {
      if (!userId) throw new Error('User not authenticated');
      const { error } = await supabase
        .from('absences')
        .delete()
        .eq('id', absenceId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['absences', userId] });
    },
  });

  const updateAbsence = useMutation({
    mutationFn: async ({
      id,
      title,
      description,
      category,
      impactLevel,
      counterfactual,
      evidenceNeeded,
    }: {
      id: string;
      title?: string;
      description?: string;
      category?: string;
      impactLevel?: string;
      counterfactual?: string;
      evidenceNeeded?: string;
    }) => {
      if (!userId) throw new Error('User not authenticated');
      
      const updates: Record<string, unknown> = {};
      if (title !== undefined) updates.title = title;
      if (description !== undefined) updates.description = description;
      if (category !== undefined) updates.category = category;
      if (impactLevel !== undefined) updates.impact_level = impactLevel;
      if (counterfactual !== undefined) updates.counterfactual = counterfactual;
      if (evidenceNeeded !== undefined) updates.evidence_needed = evidenceNeeded;

      const { error } = await supabase
        .from('absences')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['absences', userId] });
    },
  });

  const deleteEffect = useMutation({
    mutationFn: async (effectId: string) => {
      if (!userId) throw new Error('User not authenticated');
      const { error } = await supabase
        .from('absence_effects')
        .delete()
        .eq('id', effectId);
      
      if (error) throw error;
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
    deleteAbsence,
    updateAbsence,
    deleteEffect,
  };
}
