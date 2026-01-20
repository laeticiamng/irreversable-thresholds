import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Absence, AbsenceEffect, AbsenceCategory, ImpactLevel } from '@/types/database';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { toast } from 'sonner';

export function useAbsencesDB(userId: string | undefined) {
  const queryClient = useQueryClient();
  const { currentOrganization, isPersonalMode } = useOrganizationContext();

  const { data: absences = [], isLoading } = useQuery({
    queryKey: ['absences', userId, currentOrganization?.id, isPersonalMode],
    queryFn: async () => {
      if (!userId) return [];
      
      // Build the query based on organization context
      let query = supabase
        .from('absences')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (isPersonalMode) {
        // Personal mode: show only user's personal absences (no org)
        query = query.eq('user_id', userId).is('organization_id', null);
      } else if (currentOrganization) {
        // Organization mode: show org absences + user's personal absences
        query = query.or(`organization_id.eq.${currentOrganization.id},and(user_id.eq.${userId},organization_id.is.null)`);
      } else {
        // Fallback: just user's absences
        query = query.eq('user_id', userId);
      }
      
      const { data: absencesData, error: absencesError } = await query;
      
      if (absencesError) throw absencesError;

      // Fetch effects for all absences
      const absenceIds = absencesData.map(a => a.id);
      if (absenceIds.length === 0) return [];
      
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
      category?: AbsenceCategory | string;
      impactLevel?: ImpactLevel | string;
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
          organization_id: isPersonalMode ? null : currentOrganization?.id || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['absences', userId] });
      toast.success('Absence créée avec succès');
    },
    onError: (error: Error) => {
      toast.error(`Erreur lors de la création: ${error.message}`);
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
      toast.success('Absence supprimée');
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
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
      category?: AbsenceCategory | string;
      impactLevel?: ImpactLevel | string;
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
      toast.success('Absence mise à jour');
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
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
      toast.success('Effet supprimé');
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
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
      const { data, error } = await supabase
        .from('absence_effects')
        .insert({
          absence_id: absenceId,
          user_id: userId,
          effect_type: effectType,
          description
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['absences', userId] });
      toast.success('Effet ajouté');
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  const updateEffect = useMutation({
    mutationFn: async ({
      id,
      effectType,
      description
    }: {
      id: string;
      effectType?: AbsenceEffect['effect_type'];
      description?: string;
    }) => {
      if (!userId) throw new Error('User not authenticated');

      const updates: Record<string, unknown> = {};
      if (effectType !== undefined) updates.effect_type = effectType;
      if (description !== undefined) updates.description = description;

      const { error } = await supabase
        .from('absence_effects')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['absences', userId] });
      toast.success('Effet mis à jour');
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  // Helper functions
  const getAbsencesByCase = (caseId: string) =>
    absences.filter(a => a.case_id === caseId);

  const getStatistics = () => ({
    total: absences.length,
    byCategory: Object.entries(
      absences.reduce((acc, a) => {
        const cat = a.category || 'autre';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ),
    byImpact: Object.entries(
      absences.reduce((acc, a) => {
        const imp = a.impact_level || 'moderate';
        acc[imp] = (acc[imp] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ),
    totalEffects: absences.reduce((sum, a) => sum + (a.effects?.length || 0), 0),
    highImpact: absences.filter(a => a.impact_level === 'high').length,
  });

  return {
    absences,
    isLoading,
    addAbsence,
    addEffect,
    updateEffect,
    deleteAbsence,
    updateAbsence,
    deleteEffect,
    getAbsencesByCase,
    getStatistics,
  };
}
