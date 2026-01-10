import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Threshold, 
  ThresholdConsequence, 
  ThresholdCategory, 
  Severity 
} from '@/types/database';

export function useIrreversaCases(userId: string | undefined) {
  const queryClient = useQueryClient();

  // Fetch all thresholds with consequences for a user
  const { data: thresholds = [], isLoading } = useQuery({
    queryKey: ['irreversa_thresholds', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      // Get thresholds
      const { data: thresholdData, error: thresholdError } = await supabase
        .from('thresholds')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (thresholdError) throw thresholdError;
      
      // Get consequences for all thresholds
      const thresholdIds = thresholdData.map(t => t.id);
      let consequences: ThresholdConsequence[] = [];
      
      if (thresholdIds.length > 0) {
        const { data: consequenceData, error: consequenceError } = await supabase
          .from('threshold_consequences')
          .select('*')
          .in('threshold_id', thresholdIds);
        
        if (consequenceError) throw consequenceError;
        consequences = consequenceData as ThresholdConsequence[];
      }
      
      // Combine thresholds with their consequences
      return thresholdData.map(t => ({
        ...t,
        consequences: consequences.filter(c => c.threshold_id === t.id),
      })) as Threshold[];
    },
    enabled: !!userId,
  });

  // Create threshold with enhanced fields
  const createThreshold = useMutation({
    mutationFn: async ({
      title,
      description,
      caseId,
      category = 'autre',
      severity = 'moderate',
      whatCannotBeUndone,
      whatChangesAfter,
      conditions,
      notes,
    }: {
      title: string;
      description: string;
      caseId?: string;
      category?: ThresholdCategory;
      severity?: Severity;
      whatCannotBeUndone?: string;
      whatChangesAfter?: string;
      conditions?: string;
      notes?: string;
    }) => {
      if (!userId) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('thresholds')
        .insert([{
          user_id: userId,
          title,
          description,
          case_id: caseId || null,
          category,
          severity,
          what_cannot_be_undone: whatCannotBeUndone || null,
          what_changes_after: whatChangesAfter || null,
          conditions: conditions || null,
          notes: notes || null,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data as Threshold;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['irreversa_thresholds', userId] });
    },
  });

  // Cross a threshold
  const crossThreshold = useMutation({
    mutationFn: async (thresholdId: string) => {
      const { error } = await supabase
        .from('thresholds')
        .update({ 
          is_crossed: true, 
          crossed_at: new Date().toISOString() 
        })
        .eq('id', thresholdId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['irreversa_thresholds', userId] });
    },
  });

  // Add consequence to a threshold
  const addConsequence = useMutation({
    mutationFn: async ({
      thresholdId,
      consequenceType,
      description,
    }: {
      thresholdId: string;
      consequenceType: ThresholdConsequence['consequence_type'];
      description: string;
    }) => {
      if (!userId) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('threshold_consequences')
        .insert([{
          threshold_id: thresholdId,
          user_id: userId,
          consequence_type: consequenceType,
          description,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data as ThresholdConsequence;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['irreversa_thresholds', userId] });
    },
  });

  // Delete consequence
  const deleteConsequence = useMutation({
    mutationFn: async (consequenceId: string) => {
      const { error } = await supabase
        .from('threshold_consequences')
        .delete()
        .eq('id', consequenceId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['irreversa_thresholds', userId] });
    },
  });

  // Delete threshold
  const deleteThreshold = useMutation({
    mutationFn: async (thresholdId: string) => {
      // First delete all consequences
      await supabase
        .from('threshold_consequences')
        .delete()
        .eq('threshold_id', thresholdId);
      
      const { error } = await supabase
        .from('thresholds')
        .delete()
        .eq('id', thresholdId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['irreversa_thresholds', userId] });
    },
  });

  // Update threshold
  const updateThreshold = useMutation({
    mutationFn: async ({
      id,
      title,
      description,
      category,
      severity,
      whatCannotBeUndone,
      whatChangesAfter,
      conditions,
      notes,
    }: {
      id: string;
      title?: string;
      description?: string;
      category?: ThresholdCategory;
      severity?: Severity;
      whatCannotBeUndone?: string;
      whatChangesAfter?: string;
      conditions?: string;
      notes?: string;
    }) => {
      const updates: Record<string, unknown> = {};
      if (title !== undefined) updates.title = title;
      if (description !== undefined) updates.description = description;
      if (category !== undefined) updates.category = category;
      if (severity !== undefined) updates.severity = severity;
      if (whatCannotBeUndone !== undefined) updates.what_cannot_be_undone = whatCannotBeUndone;
      if (whatChangesAfter !== undefined) updates.what_changes_after = whatChangesAfter;
      if (conditions !== undefined) updates.conditions = conditions;
      if (notes !== undefined) updates.notes = notes;

      const { error } = await supabase
        .from('thresholds')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['irreversa_thresholds', userId] });
    },
  });

  // Get thresholds by case
  const getThresholdsByCase = (caseId: string) => 
    thresholds.filter(t => t.case_id === caseId);

  // Get pending/crossed
  const getPendingThresholds = () => thresholds.filter(t => !t.is_crossed);
  const getCrossedThresholds = () => thresholds.filter(t => t.is_crossed);

  // Get all consequences grouped by type
  const getAllConsequences = () => {
    const all: ThresholdConsequence[] = [];
    thresholds.forEach(t => {
      if (t.consequences) {
        all.push(...t.consequences);
      }
    });
    return all;
  };

  return {
    thresholds,
    isLoading,
    createThreshold,
    crossThreshold,
    addConsequence,
    deleteConsequence,
    deleteThreshold,
    updateThreshold,
    getThresholdsByCase,
    getPendingThresholds,
    getCrossedThresholds,
    getAllConsequences,
  };
}
