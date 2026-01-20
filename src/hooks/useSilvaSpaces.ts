import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useRef } from 'react';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { toast } from 'sonner';

export interface SilvaSpace {
  id: string;
  user_id: string;
  workspace_id: string | null;
  scope: 'global' | 'case';
  case_id: string | null;
  content: string;
  format_mode: 'default' | 'silence';
  created_at: string;
  updated_at: string;
  organization_id: string | null;
}

export function useSilvaSpaces(userId: string | undefined) {
  const queryClient = useQueryClient();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { currentOrganization, isPersonalMode } = useOrganizationContext();

  const { data: spaces = [], isLoading } = useQuery({
    queryKey: ['silva_spaces', userId, currentOrganization?.id, isPersonalMode],
    queryFn: async () => {
      if (!userId) return [];
      
      let query = supabase
        .from('silva_spaces')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (isPersonalMode) {
        // Personal mode: show only user's personal spaces (no org)
        query = query.eq('user_id', userId).is('organization_id', null);
      } else if (currentOrganization) {
        // Organization mode: show org spaces + user's personal spaces
        query = query.or(`organization_id.eq.${currentOrganization.id},and(user_id.eq.${userId},organization_id.is.null)`);
      } else {
        // Fallback: just user's spaces
        query = query.eq('user_id', userId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as SilvaSpace[];
    },
    enabled: !!userId,
  });

  const getGlobalSpace = useCallback(() => {
    return spaces.find(s => s.scope === 'global');
  }, [spaces]);

  const getCaseSpace = useCallback((caseId: string) => {
    return spaces.find(s => s.scope === 'case' && s.case_id === caseId);
  }, [spaces]);

  const getCaseSpaces = useCallback(() => {
    return spaces.filter(s => s.scope === 'case');
  }, [spaces]);

  const createSpace = useMutation({
    mutationFn: async ({ 
      scope, 
      caseId,
      workspaceId,
    }: { 
      scope: 'global' | 'case'; 
      caseId?: string;
      workspaceId?: string;
    }) => {
      if (!userId) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('silva_spaces')
        .insert({ 
          user_id: userId, 
          scope,
          case_id: caseId || null,
          workspace_id: workspaceId || null,
          content: '',
          format_mode: 'default',
          organization_id: isPersonalMode ? null : currentOrganization?.id || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as SilvaSpace;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['silva_spaces', userId] });
      toast.success('Espace SILVA créé');
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  const updateContent = useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      const { error } = await supabase
        .from('silva_spaces')
        .update({ content })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['silva_spaces', userId] });
    },
    onError: (error: Error) => {
      toast.error(`Erreur de sauvegarde: ${error.message}`);
    },
  });

  const updateFormatMode = useMutation({
    mutationFn: async ({ id, formatMode }: { id: string; formatMode: 'default' | 'silence' }) => {
      const { error } = await supabase
        .from('silva_spaces')
        .update({ format_mode: formatMode })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['silva_spaces', userId] });
      toast.success('Mode mis à jour');
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  const clearContent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('silva_spaces')
        .update({ content: '' })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['silva_spaces', userId] });
      toast.success('Contenu effacé');
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  const deleteSpace = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('silva_spaces')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['silva_spaces', userId] });
      toast.success('Espace supprimé');
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  // Debounced autosave function
  const debouncedSave = useCallback((id: string, content: string) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      updateContent.mutate({ id, content });
    }, 1000);
  }, [updateContent]);

  return {
    spaces,
    isLoading,
    getGlobalSpace,
    getCaseSpace,
    getCaseSpaces,
    createSpace,
    updateContent,
    updateFormatMode,
    clearContent,
    deleteSpace,
    debouncedSave,
  };
}
