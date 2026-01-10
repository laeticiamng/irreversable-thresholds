import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Tag {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
}

interface CaseTag {
  id: string;
  case_id: string;
  tag_id: string;
  created_at: string;
  tag?: Tag;
}

export function useTags(userId: string | undefined) {
  const queryClient = useQueryClient();

  const { data: tags = [], isLoading } = useQuery({
    queryKey: ['tags', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('user_id', userId)
        .order('name');
      if (error) throw error;
      return data as Tag[];
    },
    enabled: !!userId,
  });

  const createTag = useMutation({
    mutationFn: async ({ name, color }: { name: string; color?: string }) => {
      if (!userId) throw new Error('User not authenticated');
      const { data, error } = await supabase
        .from('tags')
        .insert({ user_id: userId, name, color: color || '#6366f1' })
        .select()
        .single();
      if (error) throw error;
      return data as Tag;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags', userId] });
    },
  });

  const updateTag = useMutation({
    mutationFn: async ({ id, name, color }: { id: string; name?: string; color?: string }) => {
      const { data, error } = await supabase
        .from('tags')
        .update({ name, color })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Tag;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags', userId] });
    },
  });

  const deleteTag = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tags').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags', userId] });
    },
  });

  return {
    tags,
    isLoading,
    createTag,
    updateTag,
    deleteTag,
  };
}

export function useCaseTags(caseId: string | undefined) {
  const queryClient = useQueryClient();

  const { data: caseTags = [], isLoading } = useQuery({
    queryKey: ['case-tags', caseId],
    queryFn: async () => {
      if (!caseId) return [];
      const { data, error } = await supabase
        .from('case_tags')
        .select('*, tag:tags(*)')
        .eq('case_id', caseId);
      if (error) throw error;
      return data as CaseTag[];
    },
    enabled: !!caseId,
  });

  const addTagToCase = useMutation({
    mutationFn: async (tagId: string) => {
      if (!caseId) throw new Error('Case ID required');
      const { data, error } = await supabase
        .from('case_tags')
        .insert({ case_id: caseId, tag_id: tagId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['case-tags', caseId] });
    },
  });

  const removeTagFromCase = useMutation({
    mutationFn: async (tagId: string) => {
      if (!caseId) throw new Error('Case ID required');
      const { error } = await supabase
        .from('case_tags')
        .delete()
        .eq('case_id', caseId)
        .eq('tag_id', tagId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['case-tags', caseId] });
    },
  });

  return {
    caseTags,
    tags: caseTags.map(ct => ct.tag).filter(Boolean) as Tag[],
    isLoading,
    addTagToCase,
    removeTagFromCase,
  };
}
